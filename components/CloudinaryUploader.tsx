"use client";

import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface CloudinaryUploaderProps {
  folder: string;
  multiple?: boolean;
  onUploaded: (resp: any) => void;
}

/**
 * A reusable Cloudinary upload component.
 * @param folder - Cloudinary folder to upload to.
 * @param multiple - Whether to allow multiple file selection.
 * @param onUploaded - Callback function called for each successful upload.
 */
export default function CloudinaryUploader({ folder, multiple = false, onUploaded }: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      // Upload each file and call onUploaded for each
      const results = await Promise.all(
        files.map(file => uploadToCloudinary(file, folder))
      );
      
      results.forEach(res => {
        onUploaded(res);
      });

      // Clear input after successful upload
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image(s)');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept="image/*"
          className="block w-full text-sm text-gray-400 
            file:mr-4 file:py-2 file:px-4 
            file:rounded file:border-0 
            file:text-sm file:font-semibold 
            file:bg-orange-600 file:text-white 
            hover:file:bg-orange-700 cursor-pointer
            bg-gray-800 p-2 rounded border border-gray-700"
          disabled={uploading}
        />
        {uploading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
             <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
          </div>
        )}
      </div>
      {uploading && <p className="text-xs text-orange-400 animate-pulse">Uploading to {folder}...</p>}
      {error && <p className="text-xs text-red-500 bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}
    </div>
  );
}
