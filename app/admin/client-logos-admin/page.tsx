"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CloudinaryUploader from '@/components/CloudinaryUploader';
import { addClientLogo, listClientLogos, deleteClientLogo } from '@/lib/firestoreHelpers';

export default function ClientLogosAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const list = await listClientLogos();
        if (!mounted) return;
        setItems(list || []);
      } catch (err) {
        console.error(err);
        setMessage('Failed to load client logos');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // CloudinaryUploader calls onUploaded for each uploaded file with Cloudinary response
  async function handleUploaded(resp: any) {
    try {
      // Cloudinary upload response commonly contains: secure_url, public_id, folder
      const url = resp.secure_url || resp.url || resp.secureUrl || resp.secure_url;
      const public_id = resp.public_id || resp.publicId || resp.publicId;
      const filename = resp.original_filename || resp.original_filename || (public_id || '').split('/').pop();
      const doc = { url, public_id, name: filename, alt: filename };
      await addClientLogo(doc);
      // refresh list
      const list = await listClientLogos();
      setItems(list || []);
      setMessage('Uploaded and saved');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save uploaded image to Firestore', err);
      setMessage('Failed to save uploaded image');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this logo?')) return;
    try {
      await deleteClientLogo(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      setMessage('Delete failed');
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Client Logos (Carousel)</h1>
          <p className="text-gray-400 text-sm">Manage the logos displayed in the client carousel on the home page.</p>
        </div>
        <Link
          href="/admin/admin-dashboard"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm border border-gray-700"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-orange-400">Add New Logos</h2>
        <CloudinaryUploader folder="client-logos" multiple={true} onUploaded={handleUploaded} />
        <p className="mt-2 text-xs text-gray-500 italic">Recommended aspect ratio: 3:2 or similar with transparent background if possible.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${message.includes('Failed') ? 'bg-red-900/20 border-red-900 text-red-400' : 'bg-green-900/20 border-green-900 text-green-400'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading && <div className="text-gray-400 col-span-full py-20 text-center animate-pulse">Loading logos...</div>}
        {!loading && items.length === 0 && (
          <div className="text-gray-400 col-span-full py-20 text-center bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
            No client logos yet. Upload some images to get started.
          </div>
        )}
        {items.map(it => (
          <div key={it.id} className="group bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all duration-300">
            <div className="bg-white/5 rounded-lg p-4 mb-4 flex items-center justify-center h-32 overflow-hidden border border-gray-700/50 group-hover:bg-white/10 transition-colors">
              <img 
                src={it.url} 
                alt={it.alt || it.name || 'client'} 
                className="max-w-full max-h-full object-contain filter drop-shadow-lg" 
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-gray-200 truncate pr-2" title={it.name || it.alt}>
                {it.name || it.alt || 'Untitled Logo'}
              </div>
              <button 
                onClick={() => handleDelete(it.id)} 
                className="w-full py-2 bg-red-600/10 hover:bg-red-600 border border-red-600/30 hover:border-red-600 text-red-400 hover:text-white rounded-lg text-xs font-semibold transition-all duration-200"
              >
                Remove Logo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
