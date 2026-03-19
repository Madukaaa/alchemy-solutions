import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

type DataMap = Record<string, unknown>;
type ItemWithId = DataMap & { id: string };

export type BlogPost = {
  id: string;
  title?: string;
  subtitle?: string;
  author?: string;
  readTime?: string;
  date?: string | number;
  createdAt?: string | number;
  image?: string;
  imageUrl?: string;
  mainImage?: string | { secure_url?: string; url?: string };
  sections?: Array<{
    type?: string;
    title?: string;
    text?: string;
    content?: string | { url?: string; secure_url?: string };
    url?: string;
    items?: string[];
  }>;
  content?: Array<{
    type?: string;
    title?: string;
    text?: string;
    content?: string | { url?: string; secure_url?: string };
    url?: string;
    items?: string[];
  }>;
};

function requireDb() {
  if (!db) {
    throw new Error("Firebase is not configured. Check NEXT_PUBLIC_FIREBASE_* environment variables.");
  }
  return db;
}

async function listCollection(name: string, field = "createdAt", direction: "asc" | "desc" = "desc") {
  const firestore = requireDb();
  const col = collection(firestore, name);
  const q = query(col, orderBy(field, direction));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DataMap) })) as ItemWithId[];
}

async function addCollectionItem(name: string, data: DataMap) {
  const firestore = requireDb();
  const col = collection(firestore, name);
  const docRef = await addDoc(col, { ...data, createdAt: Date.now() });
  return { id: docRef.id };
}

async function updateCollectionItem(name: string, id: string, data: DataMap) {
  const firestore = requireDb();
  const d = doc(firestore, name, id);
  await updateDoc(d, { ...data, updatedAt: Date.now() });
}

async function deleteCollectionItem(name: string, id: string) {
  const firestore = requireDb();
  const d = doc(firestore, name, id);
  await deleteDoc(d);
}

export async function addBlogPost(data: DataMap) {
  return addCollectionItem("blogPosts", data);
}

export async function listBlogPosts() {
  return listCollection("blogPosts");
}

export async function deleteBlogPost(id: string) {
  await deleteCollectionItem("blogPosts", id);
}

export async function updateBlogPost(id: string, data: DataMap) {
  await updateCollectionItem("blogPosts", id, data);
}

export async function addGalleryItem(data: DataMap) {
  return addCollectionItem("gallery", data);
}

export async function listGallery() {
  return listCollection("gallery");
}

export async function deleteGalleryItem(id: string) {
  await deleteCollectionItem("gallery", id);
}

export async function addDomeImage(data: DataMap) {
  return addCollectionItem("domeGallery", data);
}

export async function listDomeImages() {
  return listCollection("domeGallery");
}

export async function deleteDomeImage(id: string) {
  await deleteCollectionItem("domeGallery", id);
}

export async function addTeamMember(data: DataMap) {
  const now = Date.now();
  const firestore = requireDb();
  const col = collection(firestore, "team");
  const docRef = await addDoc(col, { ...data, createdAt: now, position: now });
  return { id: docRef.id };
}

export async function listTeamMembers() {
  return listCollection("team", "position", "asc");
}

export async function updateTeamMember(id: string, data: DataMap) {
  await updateCollectionItem("team", id, data);
}

export async function deleteTeamMember(id: string) {
  await deleteCollectionItem("team", id);
}

export async function addFeaturedWork(data: DataMap) {
  return addCollectionItem("featuredWork", data);
}

export async function listFeaturedWork() {
  return listCollection("featuredWork");
}

export async function updateFeaturedWork(id: string, data: DataMap) {
  await updateCollectionItem("featuredWork", id, data);
}

export async function deleteFeaturedWork(id: string) {
  await deleteCollectionItem("featuredWork", id);
}

export async function addITProject(data: DataMap) {
  return addCollectionItem("itProjects", data);
}

export async function listITProjects() {
  return listCollection("itProjects");
}

export async function updateITProject(id: string, data: DataMap) {
  await updateCollectionItem("itProjects", id, data);
}

export async function deleteITProject(id: string) {
  await deleteCollectionItem("itProjects", id);
}

export async function addEventImage(data: DataMap) {
  return addCollectionItem("eventImages", data);
}

export async function listEventImages() {
  return listCollection("eventImages");
}

export async function deleteEventImage(id: string) {
  await deleteCollectionItem("eventImages", id);
}

export async function updateEventImage(id: string, data: DataMap) {
  await updateCollectionItem("eventImages", id, data);
}

export async function addClientLogo(data: DataMap) {
  return addCollectionItem("clientLogos", data);
}

export async function listClientLogos() {
  return listCollection("clientLogos");
}

export async function deleteClientLogo(id: string) {
  await deleteCollectionItem("clientLogos", id);
}

export async function addCareer(data: DataMap) {
  try {
    console.log("addCareer called with data:", data);
    const result = await addCollectionItem("careers", data);
    console.log("Document added with ID:", result.id);
    return result;
  } catch (error) {
    console.error("Error in addCareer:", error);
    throw error;
  }
}

export async function listCareers() {
  try {
    console.log("listCareers called");
    const careers = await listCollection("careers");
    console.log("Careers retrieved:", careers.length);
    return careers;
  } catch (error) {
    console.error("Error in listCareers:", error);
    throw error;
  }
}

export async function updateCareer(id: string, data: DataMap) {
  await updateCollectionItem("careers", id, data);
}

export async function deleteCareer(id: string) {
  await deleteCollectionItem("careers", id);
}

