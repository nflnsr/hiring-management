"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  status: "active" | "inactive" | "draft";
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  created_at: string;
  job_type?: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "applicant") {
      router.push("/");
      return;
    }
    loadJobs();
  }, [router]);

  const loadJobs = () => {
    const stored = localStorage.getItem("jobs");
    if (stored) {
      const allJobs = JSON.parse(stored);
      const activeJobs = allJobs.filter((job: Job) => job.status === "active");
      setJobs(activeJobs);
      if (activeJobs.length > 0) {
        setSelectedJob(activeJobs[0]);
      }
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const logoutHandler = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Job List</h1>
          <button
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
            onClick={() => setShowProfileModal(!showProfileModal)}
          >
            <User className="w-5 h-5 text-gray-600" />
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          <div className="w-96 flex flex-col border-r border-gray-200 pr-4">
            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by job details"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2"
                />
                <svg
                  className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No jobs found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedJob?.id === job.id
                          ? "border-teal-600 bg-teal-50"
                          : "border-teal-200 bg-white hover:border-teal-400"
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                      <p className="text-gray-600 text-xs mt-1">{job.department}</p>
                      <div className="flex items-center gap-1 mt-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs">
                          {formatSalary(job.salary_range.min)} -{" "}
                          {formatSalary(job.salary_range.max)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {filteredJobs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="mb-6">
                    <svg
                      className="w-32 h-32 mx-auto"
                      viewBox="0 0 200 200"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="100" cy="100" r="80" fill="#f3f4f6" />
                      <circle cx="85" cy="85" r="35" fill="none" stroke="#0d9488" strokeWidth="8" />
                      <line
                        x1="110"
                        y1="110"
                        x2="140"
                        y2="140"
                        stroke="#0d9488"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No job openings available
                  </h3>
                  <p className="text-gray-600">Please wait for the next batch of openings.</p>
                </div>
              </div>
            ) : selectedJob ? (
              <div className="h-full overflow-y-auto">
                <div className="pb-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-teal-600">
                          {selectedJob.department.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                        <p className="text-gray-600">{selectedJob.department}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/jobs/${selectedJob.id}/apply`)}
                      className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-semibold rounded-lg px-6 py-2"
                    >
                      Apply
                    </Button>
                  </div>

                  {selectedJob.job_type && (
                    <div className="inline-block">
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {selectedJob.job_type}
                      </span>
                    </div>
                  )}
                </div>

                <div className="py-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {selectedJob.description.split("\n").map((line, idx) => (
                      <p key={idx} className="mb-2">
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Salary Range</h4>
                    <p className="text-gray-700">
                      {formatSalary(selectedJob.salary_range.min)} -{" "}
                      {formatSalary(selectedJob.salary_range.max)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
