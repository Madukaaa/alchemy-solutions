"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listCareers } from "@/lib/firestoreHelpers";

type Job = {
  id: string;
  title?: string;
  tags?: string[];
  applyText?: string;
};

const CareerCard = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCareers() {
      try {
        const data = await listCareers();
        if (data) {
          setJobs(data as Job[]);
        }
      } catch (error) {
        console.error("Error loading careers:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCareers();
  }, []);

  const handleApplyClick = (jobId: string) => {
    router.push(`/careers/${jobId}`);
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-black p-6 rounded-2xl border border-[#1a1a1a]">
          <p className="text-white">Loading careers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-black p-6 rounded-2xl shadow-lg w-full max-w-md border border-[#1a1a1a] min-h-[260px] flex flex-col"
        >
          {/* Title */}
          <h2 className="text-white text-xl font-semibold leading-snug mb-4">
            {job.title}
          </h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {job.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-white text-black rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex-grow"></div>

          {/* Button */}
          <button
            onClick={() => handleApplyClick(job.id)}
            className="text-[#E2791D] font-medium hover:underline flex items-center gap-2 mt-4"
          >
            {job.applyText || "Apply Now →"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default CareerCard;
