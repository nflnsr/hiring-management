"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, DollarSign, User } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  description: string;
  requirements: string[];
}

export default function ApplicantJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const storedJobs = localStorage.getItem("jobs");
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs);
      const activeJobs = parsedJobs.filter((job: any) => job.status === "active");
      setJobs(activeJobs);
      if (activeJobs.length > 0) {
        setSelectedJob(activeJobs[0]);
      }
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("userRole");
    window.location.href = "/";
  };

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="80" r="20" fill="#0d9488" />
            <path d="M 70 110 Q 100 140 130 110" stroke="#0d9488" strokeWidth="3" fill="none" />
            <path d="M 60 140 Q 100 180 140 140" stroke="#fcd34d" strokeWidth="3" fill="none" />
            <circle cx="140" cy="100" r="15" fill="#fcd34d" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900">No job openings available</h2>
          <p className="text-gray-600">Please wait for the next batch of openings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Job List</h1>
        <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
          <User
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="w-6 h-6 text-gray-600"
          />
        </button>
      </div>
      {showProfileModal && (
        <div className="absolute right-8 xl:right-25 2xl:right-40 bg-white border shadow px-8 py-2 z-50">
          <button
            onClick={() => logoutHandler()}
            className="bg-red-400 px-4 py-1 rounded-md text-white font-sans cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-96 border-r border-gray-200 overflow-y-auto bg-white">
          <div className="p-4 space-y-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedJob?.id === job.id
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center text-sm font-semibold text-teal-600">
                    {job.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedJob && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</h1>
                  <p className="text-gray-600 mb-4">{selectedJob.company}</p>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {selectedJob.jobType}
                    </span>
                    <span className="text-gray-600">{selectedJob.location}</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                <ul className="space-y-2 text-gray-700">
                  {selectedJob.requirements?.map((req, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/applicant/${selectedJob.id}/apply`}
                className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Apply
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
