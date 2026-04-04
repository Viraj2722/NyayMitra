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

import { app } from "@/lib/firebase";
import { getDataConnect } from "firebase/data-connect";
import { createAppointment, connectorConfig, createUser, getUserByUid, upsertUserProfile } from "@/lib/dataconnect-generated";

// Initialize Data Connect using the officially generated Connector Config
const dataConnect = getDataConnect(app, connectorConfig);

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
    await createAppointment(dataConnect, {
      userName: appointment.userName,
      userContact: appointment.userContact,
      problemSummary: appointment.problemSummary,
      preferredDate: appointment.preferredDate,
      status: appointment.status || "pending"
    });
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
