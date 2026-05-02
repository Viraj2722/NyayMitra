import hashlib
import json
import math
import os
import tempfile
from typing import Dict, List, Optional, Tuple

import requests
from pypdf import PdfReader


# Official URLs for the new criminal laws and key legal references
LATEST_INDIAN_LAWS = {
    "Constitution_of_India": "https://www.indiacode.nic.in/bitstream/123456789/19150/1/constitution_of_india.pdf",
    "BNS_2023": "https://www.mha.gov.in/sites/default/files/250883_english_01042024.pdf",
    "BNSS_2023": "https://www.indiacode.nic.in/bitstream/123456789/21544/1/the_bharatiya_nagarik_suraksha_sanhita%2c_2023.pdf",
    "BSA_2023": "https://www.mha.gov.in/sites/default/files/2024-04/250882_english_01042024_0.pdf",
    "Contract_Act_1872": "https://www.indiacode.nic.in/bitstream/123456789/2187/1/A1872-09.pdf",
}


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
KB_DIR = os.path.join(BASE_DIR, "legal_knowledge_base")
INDEX_PATH = os.path.join(KB_DIR, "legal_rag_index.json")
MANIFEST_PATH = os.path.join(KB_DIR, "legal_rag_manifest.json")


def _dot_product(a: List[float], b: List[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def _norm(a: List[float]) -> float:
    return math.sqrt(sum(x * x for x in a))


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    denom = _norm(a) * _norm(b)
    if denom == 0:
        return 0.0
    return _dot_product(a, b) / denom


def _tokenize(text: str) -> List[str]:
    stopwords = {
        "a", "an", "the", "and", "or", "to", "of", "in", "on", "for", "with", "at", "by", "from",
        "is", "are", "was", "were", "be", "been", "being", "my", "your", "his", "her", "their", "our",
        "me", "you", "he", "she", "they", "we", "it", "this", "that", "these", "those", "without",
        "any", "no", "not", "have", "has", "had", "can", "could", "should", "would", "will", "shall",
    }
    tokens = []
    for raw in text.split():
        token = raw.strip().lower().strip(".,;:!?()[]{}\"'`")
        if len(token) < 3:
            continue
        if token in stopwords:
            continue
        tokens.append(token)
    return tokens


def _token_overlap_score(query_text: str, chunk_text: str) -> float:
    query_tokens = set(_tokenize(query_text))
    if not query_tokens:
        return 0.0
    chunk_tokens = set(_tokenize(chunk_text))
    if not chunk_tokens:
        return 0.0
    overlap = query_tokens.intersection(chunk_tokens)
    return len(overlap) / max(len(query_tokens), 1)


def _token_overlap_count(query_text: str, chunk_text: str) -> int:
    query_tokens = set(_tokenize(query_text))
    if not query_tokens:
        return 0
    chunk_tokens = set(_tokenize(chunk_text))
    if not chunk_tokens:
        return 0
    return len(query_tokens.intersection(chunk_tokens))


def _simple_fallback_embedding(text: str, dim: int = 128) -> List[float]:
    # Deterministic lightweight embedding used for fast local retrieval.
    vector = [0.0] * dim
    for token in text.lower().split():
        digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
        idx = int(digest[:8], 16) % dim
        vector[idx] += 1.0
    return vector


def _chunk_text(text: str, chunk_size: int = 1200, overlap: int = 80) -> List[str]:
    cleaned = " ".join((text or "").split())
    if not cleaned:
        return []

    chunks: List[str] = []
    start = 0
    text_length = len(cleaned)

    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk = cleaned[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= text_length:
            break
        start = max(end - overlap, start + 1)

    return chunks


def _embed_text(text: str) -> List[float]:
    return _simple_fallback_embedding(text)


def _download_pdf(url: str, file_path: str) -> None:
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    content = response.content
    if not content.lstrip().startswith(b"%PDF-"):
        raise ValueError(f"Downloaded content is not a valid PDF: {url}")

    directory = os.path.dirname(file_path)
    os.makedirs(directory, exist_ok=True)
    with tempfile.NamedTemporaryFile(delete=False, dir=directory, suffix=".pdf") as temp_file:
        temp_file.write(content)
        temp_path = temp_file.name

    os.replace(temp_path, file_path)


def _is_valid_pdf(file_path: str) -> bool:
    try:
        with open(file_path, "rb") as f:
            header = f.read(5)
        return header == b"%PDF-"
    except Exception:
        return False


def _current_source_state() -> Dict[str, float]:
    state: Dict[str, float] = {}
    for law_name in LATEST_INDIAN_LAWS:
        file_path = os.path.join(KB_DIR, f"{law_name}.pdf")
        if os.path.exists(file_path):
            state[law_name] = os.path.getmtime(file_path)
    return state


def _load_manifest() -> Dict:
    if not os.path.exists(MANIFEST_PATH):
        return {}
    try:
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            payload = json.load(f)
        return payload if isinstance(payload, dict) else {}
    except Exception:
        return {}


def ingest_legal_data(force_download: bool = False) -> Dict[str, int]:
    os.makedirs(KB_DIR, exist_ok=True)

    if not force_download and os.path.exists(INDEX_PATH):
        manifest = _load_manifest()
        if manifest.get("source_state") == _current_source_state():
            items = manifest.get("total_chunks", 0)
            return {"total_chunks": int(items)}

    all_chunks: List[Dict] = []
    for law_name, url in LATEST_INDIAN_LAWS.items():
        file_path = os.path.join(KB_DIR, f"{law_name}.pdf")
        if force_download or not os.path.exists(file_path) or not _is_valid_pdf(file_path):
            try:
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
                _download_pdf(url, file_path)
            except Exception as download_error:
                print(f"Skipping {law_name}: {download_error}")
                continue

        try:
            reader = PdfReader(file_path)
            for page_index, page in enumerate(reader.pages, start=1):
                raw_text = page.extract_text() or ""
                for chunk_index, text in enumerate(_chunk_text(raw_text), start=1):
                    if not text:
                        continue

                    embedding = _embed_text(text)

                    all_chunks.append(
                        {
                            "text": text,
                            "metadata": {
                                "law_name": law_name,
                                "source_url": url,
                                "source_file": file_path,
                                "page": page_index,
                                "chunk": chunk_index,
                            },
                            "embedding": embedding,
                        }
                    )
        except Exception as parse_error:
            print(f"Skipping {law_name}: PDF parse failed ({parse_error})")
            continue

    index_payload = {"items": all_chunks}
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(index_payload, f)

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {
                "source_state": _current_source_state(),
                "total_chunks": len(all_chunks),
            },
            f,
        )

    return {"total_chunks": len(all_chunks)}


def _load_index() -> List[Dict]:
    if not os.path.exists(INDEX_PATH):
        ingest_legal_data(force_download=False)

    if not os.path.exists(INDEX_PATH):
        return []

    try:
        with open(INDEX_PATH, "r", encoding="utf-8") as f:
            payload = json.load(f)
        items = payload.get("items", []) if isinstance(payload, dict) else []
        return items if isinstance(items, list) else []
    except Exception:
        return []


def retrieve_legal_context(query: str, top_k: int = 4, allowed_laws: Optional[List[str]] = None) -> Tuple[str, List[Dict]]:
    allowed = set(allowed_laws or [])
    items = _load_index()
    if not items:
        return "", []

    query_embedding = _embed_text(query)
    scored = []
    for item in items:
        if allowed:
            law_name = (item.get("metadata") or {}).get("law_name")
            if law_name not in allowed:
                continue
        embedding = item.get("embedding") or []
        if not embedding:
            continue
        cosine = _cosine_similarity(query_embedding, embedding)
        overlap = _token_overlap_score(query, item.get("text", ""))
        score = (0.65 * cosine) + (0.35 * overlap)
        scored.append((score, item))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_items = [
        entry[1]
        for entry in scored[:top_k]
        if entry[0] >= 0.12
        and _token_overlap_score(query, entry[1].get("text", "")) >= 0.03
        and _token_overlap_count(query, entry[1].get("text", "")) >= 1
    ]

    sources: List[Dict] = []
    context_blocks: List[str] = []
    for idx, item in enumerate(top_items, start=1):
        metadata = item.get("metadata", {})
        law_name = metadata.get("law_name", "Unknown Law")
        page = metadata.get("page")
        quote = item.get("text", "")[:800]

        context_blocks.append(
            f"[{idx}] {law_name} | page: {page}\n{quote}"
        )

        sources.append(
            {
                "id": idx,
                "law_name": law_name,
                "page": page,
                "source_url": metadata.get("source_url", ""),
                "excerpt": quote,
            }
        )

    context_text = "\n\n".join(context_blocks)
    return context_text, sources