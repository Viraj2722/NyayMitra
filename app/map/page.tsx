"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function MapPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">{t("map.title", "Nearby Legal Centers")}</h1>
      <p>{t("map.subtitle", "Google Map integration goes here.")}</p>
    </div>
  );
}
