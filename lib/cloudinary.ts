// Simple helper to create an unsigned upload URL for Cloudinary.
export function getCloudinaryUrl() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dufcussip";
  return `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
}

export function createUploadFormData(file: File, folder = "blog-images") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "AlchemWeb");

  // Allow a root folder to be prepended from env.
  const rootFolder = process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER;
  const finalFolder = rootFolder ? `${rootFolder}/${folder}` : folder;
  fd.append("folder", finalFolder);

  return fd;
}

export async function uploadToCloudinary(file: File, folder: string) {
  const formData = createUploadFormData(file, folder);
  const res = await fetch(getCloudinaryUrl(), {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Cloudinary upload failed.");
  }

  return (await res.json()) as { secure_url?: string; url?: string };
}
