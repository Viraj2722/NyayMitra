/**
 * Firebase Data Connect - Service API
 * 
 * This file acts as the boundary for Data Connect.
 * Since Data Connect generates a local SDK, you will usually import 
 * these from "@firebasegen/...".
 * 
 * For this hackathon, we are defining exactly what those functions 
 * will look like and taking in the exact Schema types you provided.
 * When you generate your SDK, simply replace these bodies with the 
 * real generated mutations (e.g. `await createUser(...)`).
 */

import { app, db } from "@/lib/firebase";
import { getDataConnect } from "firebase/data-connect";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import {
  createAppointmentWithCenter,
  connectorConfig,
  createLegalAidCenter,
  createUser,
  deleteAppointmentById,
  getUserByUid,
  listLegalAidCenters,
  listAppointmentsByUserId,
  upsertUserProfile,
} from "@/lib/dataconnect-generated";

// Initialize Data Connect using the officially generated Connector Config
const dataConnect = getDataConnect(app, connectorConfig);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface User {
  id?: string;
  uid: string;
  name?: string;
  preferredLanguage?: string;
  mobile?: string;
}

export interface LegalAidCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  freeServices: boolean;
  categories: string[];
  timings?: string;
  description?: string;
}

export interface UserQuery {
  id: string;
  userId?: string;
  queryText?: string;
  detectedLanguage: string;
  legalCategoryDetected?: string;
  isUrgent: boolean;
  isAnonymous: boolean;
  aiResponse?: string;
  createdAt?: string;
}

export interface AppointmentInput {
  userId?: string;
  legalAidCenterId: string;
  centerName?: string;
  centerAddress?: string;
  centerPhone?: string;
  centerLatitude?: number;
  centerLongitude?: number;
  centerCategories?: string[];
  userName: string;
  userContact: string;
  problemSummary: string;
  preferredDate: string;
  preferredTime?: string;
  status: string;
}

export interface Appointment extends AppointmentInput {
  id: string;
  createdAt?: string;
}

export interface UserAppointmentView {
  id: string;
  center_name: string;
  center_address?: string;
  center_phone?: string;
  date: string;
  time?: string;
  name: string;
  phone: string;
  issue_summary?: string;
  status: "pending" | "confirmed" | "completed";
  created_at?: string;
}

export interface CreateLegalAidCenterInput {
  name: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  freeServices?: boolean;
  categories?: string[];
  timings?: string;
  description?: string;
  services?: string[];
  languages?: string[];
  emergency?: boolean;
  priority?: number;
}

const LIST_CENTERS_OP_UNAVAILABLE_KEY = "nyaymitra_dc_list_centers_unavailable";

const readListCentersOpUnavailable = () => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(LIST_CENTERS_OP_UNAVAILABLE_KEY) === "true";
};

const markListCentersOpUnavailable = () => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LIST_CENTERS_OP_UNAVAILABLE_KEY, "true");
};

const clearListCentersOpUnavailable = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LIST_CENTERS_OP_UNAVAILABLE_KEY);
};

const hasOperationNotFoundError = (error: unknown) => {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message)
      : String(error || "");

  return message.includes("operation") && message.includes("not found");
};

const readFirestoreCentersFallback = async (limitRows: number): Promise<LegalAidCenter[]> => {
  try {
    const fallbackQuery = query(collection(db, "centers"), limit(limitRows));
    const snapshot = await getDocs(fallbackQuery);

    return snapshot.docs.map((entry) => {
      const data = entry.data() as Record<string, unknown>;
      const latitudeValue = Number(data.latitude ?? data.lat ?? 0);
      const longitudeValue = Number(data.longitude ?? data.lng ?? 0);

      return {
        id: entry.id,
        name: String(data.name || "Legal Aid Center"),
        address: String(data.address || "Address not available"),
        phone: String(data.phone || "0000000000"),
        latitude: Number.isFinite(latitudeValue) ? latitudeValue : 0,
        longitude: Number.isFinite(longitudeValue) ? longitudeValue : 0,
        freeServices: Boolean(data.freeServices ?? data.emergency ?? true),
        categories: Array.isArray(data.categories)
          ? data.categories.map((item) => String(item)).filter(Boolean)
          : [],
        timings: typeof data.timings === "string" ? data.timings : undefined,
        description: typeof data.description === "string" ? data.description : undefined,
      };
    });
  } catch (fallbackError) {
    console.error("❌ Failed to fetch legal aid centers from Firestore fallback:", fallbackError);
    return [];
  }
};

export const listLegalAidCentersDataConnect = async (
  limitRows = 200,
): Promise<LegalAidCenter[]> => {
  if (readListCentersOpUnavailable()) {
    return readFirestoreCentersFallback(limitRows);
  }

  try {
    const result = await listLegalAidCenters(dataConnect, { limit: limitRows });
    const rows = result?.data?.legalAidCenters || [];

    clearListCentersOpUnavailable();

    return rows.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address,
      phone: center.phone,
      latitude: Number(center.latitude),
      longitude: Number(center.longitude),
      freeServices: Boolean(center.freeServices),
      categories: Array.isArray(center.categories) ? center.categories : [],
      timings: center.timings || undefined,
      description: center.description || undefined,
    }));
  } catch (error) {
    if (hasOperationNotFoundError(error)) {
      // Avoid hammering the same missing op on every render while backend is not deployed.
      markListCentersOpUnavailable();
      console.warn("⚠️ Data Connect center list operation not deployed yet. Falling back to alternate center sources.");
    } else {
      console.error("❌ Failed to fetch legal aid centers from Data Connect:", error);
    }

    const fallbackCenters = await readFirestoreCentersFallback(limitRows);
    if (fallbackCenters.length > 0) {
      return fallbackCenters;
    }

    return [];
  }
};

export const createLegalAidCenterDataConnect = async (
  input: CreateLegalAidCenterInput,
) => {
  try {
    const result = await createLegalAidCenter(dataConnect, {
      name: input.name,
      address: input.address,
      phone: input.phone,
      latitude: Number.isFinite(input.latitude) ? Number(input.latitude) : 0,
      longitude: Number.isFinite(input.longitude) ? Number(input.longitude) : 0,
      freeServices: input.freeServices ?? true,
      categories: input.categories && input.categories.length > 0 ? input.categories : ["general"],
      timings: input.timings || "Mon-Sat 10AM-5PM",
      description: input.description || "",
    });

    const centerId = result?.data?.legalAidCenter_insert?.id;
    if (!centerId) {
      return { ok: false as const, error: "Center id was not returned by Data Connect." };
    }

    const centerMirrorRef = doc(db, "centers", centerId);
    await setDoc(centerMirrorRef, {
      name: input.name,
      address: input.address,
      phone: input.phone,
      categories: input.categories && input.categories.length > 0 ? input.categories : ["general"],
      services: input.services || [],
      languages: input.languages || [],
      description: input.description || "",
      timings: input.timings || "Mon-Sat 10AM-5PM",
      freeServices: input.freeServices ?? true,
      emergency: Boolean(input.emergency),
      priority: Number.isFinite(input.priority) ? Number(input.priority) : 0,
      latitude: Number.isFinite(input.latitude) ? Number(input.latitude) : 0,
      longitude: Number.isFinite(input.longitude) ? Number(input.longitude) : 0,
      lat: Number.isFinite(input.latitude) ? Number(input.latitude) : 0,
      lng: Number.isFinite(input.longitude) ? Number(input.longitude) : 0,
      source: "dataconnect",
      data_connect_id: centerId,
      updated_at: serverTimestamp(),
      created_at: serverTimestamp(),
    });

    const mirrorSnapshot = await getDoc(centerMirrorRef);

    return {
      ok: true as const,
      id: centerId,
      mode: "dataconnect" as const,
      mirrored: mirrorSnapshot.exists(),
    };
  } catch (error) {
    if (!hasOperationNotFoundError(error)) {
      console.error("❌ Failed to create legal aid center in Data Connect:", error);
      return {
        ok: false as const,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create center in Data Connect.",
      };
    }

    console.warn("⚠️ Data Connect center create operation not deployed yet. Saving center to Firestore mirror.");

    try {
      const mirrorResult = await addDoc(collection(db, "centers"), {
        name: input.name,
        address: input.address,
        phone: input.phone,
        categories: input.categories && input.categories.length > 0 ? input.categories : ["general"],
        services: input.services || [],
        languages: input.languages || [],
        description: input.description || "",
        timings: input.timings || "Mon-Sat 10AM-5PM",
        freeServices: input.freeServices ?? true,
        emergency: Boolean(input.emergency),
        priority: Number.isFinite(input.priority) ? Number(input.priority) : 0,
        latitude: Number.isFinite(input.latitude) ? Number(input.latitude) : 0,
        longitude: Number.isFinite(input.longitude) ? Number(input.longitude) : 0,
        lat: Number.isFinite(input.latitude) ? Number(input.latitude) : 0,
        lng: Number.isFinite(input.longitude) ? Number(input.longitude) : 0,
        source: "firestore-fallback",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return {
        ok: true as const,
        id: mirrorResult.id,
        mode: "firestore-fallback" as const,
        mirrored: true,
      };
    } catch (fallbackError) {
      console.error("❌ Failed to create legal aid center in Firestore fallback:", fallbackError);
      return {
        ok: false as const,
        error:
          fallbackError instanceof Error
            ? fallbackError.message
            : "Unable to save center to Firestore fallback.",
      };
    }
  }
};

export const syncUserToDataConnect = async (user: User) => {
  console.log("🟢 [Data Connect] Sending User to PostgreSQL DB:", user);
  try {
    const existing = await getUserByUid(dataConnect, { uid: user.uid });
    const existingRecord = existing?.data?.users?.[0] || null;

    if (!existingRecord) {
      const created = await createUser(dataConnect, {
        uid: user.uid,
        name: user.name || "Anonymous",
        preferredLanguage: user.preferredLanguage || "English",
        mobile: user.mobile || null,
      });
      console.log("✅ Data Connect User Created:", created);
      return;
    }

    const shouldUpdate =
      (user.name ?? "Anonymous") !== (existingRecord.name ?? "Anonymous") ||
      (user.preferredLanguage ?? "English") !== (existingRecord.preferredLanguage ?? "English") ||
      (user.mobile ?? null) !== (existingRecord.mobile ?? null);

    if (!shouldUpdate) {
      console.log("✅ Data Connect User Already Up-to-date");
      return;
    }

    const updated = await upsertUserProfile(dataConnect, {
      id: existingRecord.id,
      uid: user.uid,
      name: user.name || "Anonymous",
      preferredLanguage: user.preferredLanguage || "English",
      mobile: user.mobile || null,
    });
    console.log("✅ Data Connect User Updated:", updated);
  } catch (err) {
    console.error("❌ Failed DataConnect User Sync:", err);
    throw err;
  }
};

export const createAppointmentDataConnect = async (appointment: AppointmentInput) => {
  console.log("🟢 [Data Connect] Saving Appointment:", appointment);
  try {
    let legalAidCenterId = appointment.legalAidCenterId;
    const isUuid = UUID_REGEX.test(legalAidCenterId);
    let dataConnectUserId: string | null = null;

    if (appointment.userId) {
      if (UUID_REGEX.test(appointment.userId)) {
        dataConnectUserId = appointment.userId;
      } else if (appointment.userId !== "anonymous") {
        try {
          const userLookup = await getUserByUid(dataConnect, { uid: appointment.userId });
          dataConnectUserId = userLookup?.data?.users?.[0]?.id || null;
        } catch (lookupError) {
          console.warn("⚠️ Could not resolve Data Connect user ID from UID:", lookupError);
        }
      }
    }

    // If center ID is not a Data Connect UUID, create a center in Data Connect first.
    if (!isUuid) {
      const centerInsert = await createLegalAidCenter(dataConnect, {
        name: appointment.centerName || "Legal Aid Center",
        address: appointment.centerAddress || "Address not available",
        phone: appointment.centerPhone || "0000000000",
        latitude: Number.isFinite(appointment.centerLatitude)
          ? Number(appointment.centerLatitude)
          : 0,
        longitude: Number.isFinite(appointment.centerLongitude)
          ? Number(appointment.centerLongitude)
          : 0,
        freeServices: true,
        categories:
          appointment.centerCategories && appointment.centerCategories.length > 0
            ? appointment.centerCategories
            : ["general"],
        timings: "Mon-Sat 10AM-5PM",
        description: "Auto-synced from NyayMitra booking flow",
      });

      legalAidCenterId = centerInsert?.data?.legalAidCenter_insert?.id || legalAidCenterId;
    }

    const createResult = await createAppointmentWithCenter(dataConnect, {
      userId: dataConnectUserId,
      legalAidCenterId,
      userName: appointment.userName,
      userContact: appointment.userContact,
      problemSummary: appointment.problemSummary,
      preferredDate: appointment.preferredDate,
      preferredTime: appointment.preferredTime || null,
      status: appointment.status || "pending"
    });

    const appointmentId = createResult?.data?.appointment_insert?.id;
    const firestoreAppointment = {
      user_id: appointment.userId || "anonymous",
      user_uid: appointment.userId || null,
      center_id: legalAidCenterId,
      center_name: appointment.centerName || "Legal Aid Center",
      center_address: appointment.centerAddress || "Address not available",
      center_phone: appointment.centerPhone || "0000000000",
      name: appointment.userName,
      phone: appointment.userContact,
      issue_summary: appointment.problemSummary,
      date: appointment.preferredDate,
      time: appointment.preferredTime || null,
      status: appointment.status || "pending",
      source: "dataconnect",
      data_connect_id: appointmentId || null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    // Keep Firestore in sync for real-time UI streams and admin dashboards.
    if (appointmentId) {
      await setDoc(doc(db, "appointments", appointmentId), firestoreAppointment);
    } else {
      await addDoc(collection(db, "appointments"), firestoreAppointment);
    }

    console.log("✅ Appointment created successfully");
    return true;
  } catch (err) {
    console.error("❌ Failed DataConnect Appointment Insert:", err);
    return false;
  }
};

export const createUserQueryDataConnect = async (query: {
  userId?: string;
  queryText?: string;
  detectedLanguage: string;
  legalCategoryDetected?: string;
  isUrgent: boolean;
  isAnonymous: boolean;
  aiResponse?: string;
}) => {
  console.log("🟢 [Data Connect] Saving User Query:", query);
  try {
    // This would be implemented when the query mutation is generated
    // For now, we'll rely on backend Firestore write
    return true;
  } catch (err) {
    console.error("❌ Failed DataConnect Query Insert:", err);
    return false;
  }
};

export const getUserProfileByUid = async (uid: string) => {
  try {
    const result = await getUserByUid(dataConnect, { uid });
    return result?.data?.users?.[0] || null;
  } catch (error) {
    console.error("❌ Failed to fetch user profile:", error);
    return null;
  }
};

export const getUserAppointmentsDataConnect = async (
  firebaseUid: string,
  limitRows = 100,
): Promise<UserAppointmentView[]> => {
  try {
    const user = await getUserProfileByUid(firebaseUid);
    if (!user?.id) {
      return [];
    }

    const result = await listAppointmentsByUserId(dataConnect, {
      userId: user.id,
      limit: limitRows,
    });

    const rows = result?.data?.appointments || [];
    return rows.map((appointment) => ({
      id: appointment.id,
      center_name: appointment.legalAidCenter?.name || "Legal Aid Center",
      center_address: appointment.legalAidCenter?.address || undefined,
      center_phone: appointment.legalAidCenter?.phone || undefined,
      date: appointment.preferredDate,
      time: appointment.preferredTime || undefined,
      name: appointment.userName,
      phone: appointment.userContact,
      issue_summary: appointment.problemSummary || undefined,
      status:
        appointment.status === "confirmed" || appointment.status === "completed"
          ? appointment.status
          : "pending",
      created_at: appointment.createdAt || undefined,
    }));
  } catch (error) {
    if (!hasOperationNotFoundError(error)) {
      console.error("❌ Failed to fetch appointments from Data Connect:", error);
    } else {
      console.warn("⚠️ Data Connect query operation not deployed yet, using Firestore fallback.");
    }

    try {
      const fallbackQuery = query(
        collection(db, "appointments"),
        where("user_id", "==", firebaseUid),
        orderBy("created_at", "desc"),
        limit(limitRows),
      );
      const snapshot = await getDocs(fallbackQuery);
      return snapshot.docs
        .map((entry) => {
          const data = entry.data() as Record<string, unknown>;
          if (String(data.status || "pending").toLowerCase() === "cancelled") {
            return null;
          }

          const createdAt =
            typeof data.created_at === "string"
              ? data.created_at
              : typeof (data.created_at as { toDate?: () => Date } | undefined)?.toDate === "function"
                ? (data.created_at as { toDate: () => Date }).toDate().toISOString()
                : undefined;

          return {
            id: entry.id,
            center_name: String(data.center_name || "Legal Aid Center"),
            center_address: typeof data.center_address === "string" ? data.center_address : undefined,
            center_phone: typeof data.center_phone === "string" ? data.center_phone : undefined,
            date: String(data.date || ""),
            time: typeof data.time === "string" ? data.time : undefined,
            name: String(data.name || ""),
            phone: String(data.phone || ""),
            issue_summary: typeof data.issue_summary === "string" ? data.issue_summary : undefined,
            status:
              String(data.status || "pending").toLowerCase() === "confirmed"
                ? "confirmed"
                : String(data.status || "pending").toLowerCase() === "completed"
                  ? "completed"
                  : "pending",
            created_at: createdAt,
          } as UserAppointmentView;
        })
        .filter((row): row is UserAppointmentView => row !== null);
    } catch (fallbackError) {
      console.error("❌ Failed to fetch fallback appointments from Firestore:", fallbackError);
      return [];
    }
  }
};

export const deleteAppointmentDataConnect = async (appointmentId: string) => {
  let dataConnectDeleted = false;
  let firestoreDeleted = false;

  try {
    await deleteAppointmentById(dataConnect, { id: appointmentId });
    dataConnectDeleted = true;
  } catch (error) {
    if (!hasOperationNotFoundError(error)) {
      console.error("❌ Failed to delete appointment in Data Connect:", error);
    } else {
      console.warn("⚠️ Data Connect delete operation not deployed yet, deleting via Firestore fallback.");
    }
  }

  try {
    await deleteDoc(doc(db, "appointments", appointmentId));
    firestoreDeleted = true;
  } catch (fallbackError) {
    // Firestore mirror might not exist in some environments; only log non-trivial failures.
    console.warn("⚠️ Firestore mirror delete failed or document missing:", fallbackError);
  }

  return dataConnectDeleted || firestoreDeleted;
};
