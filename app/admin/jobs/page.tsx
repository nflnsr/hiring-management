"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import CreateJobModal from "@/components/admin/create-job-modal";

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
}

export default function AdminJobsPage() {
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      router.push("/");
      return;
    }
    loadJobs();

    const showToast = localStorage.getItem("showJobSuccessToast");
    if (showToast) {
      setShowSuccessToast(true);
      localStorage.removeItem("showJobSuccessToast");
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  }, [router]);

  const loadJobs = () => {
    const stored = localStorage.getItem("jobs");
    if (stored) {
      setJobs(JSON.parse(stored));
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleJobCreated = (newJob: Job) => {
    const updatedJobs = [...jobs, newJob];
    setJobs(updatedJobs);
    localStorage.setItem("jobs", JSON.stringify(updatedJobs));
    setShowCreateModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-200 bg-green-50 text-green-700";
      case "inactive":
        return "border-red-200 bg-red-50 text-red-700";
      case "draft":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const statusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const logoutHandler = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Job List</h1>
          <button
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
            onClick={() => setShowProfileModal(!showProfileModal)}
          >
            <User className="w-6 h-6 text-gray-600" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="relative mb-4 z-10">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by job details"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border border-border rounded-lg"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                {["all", "active", "inactive", "draft"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? status === "all"
                          ? "bg-primary text-primary-foreground"
                          : status === "active"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : status === "inactive"
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                        : "bg-white text-foreground border border-border hover:bg-gray-50"
                    }`}
                  >
                    {status === "all" ? "All" : statusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <Card className="p-16 text-center border border-border">
                <div className="text-6xl mb-4">👨‍💼</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No job openings available
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create a job opening now and start the candidate process.
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Create a new job
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="p-6 border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {statusLabel(job.status)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            started on {job.created_at}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatSalary(job.salary_range.min)} -{" "}
                          {formatSalary(job.salary_range.max)}
                        </p>
                      </div>
                      <Link href={`/admin/jobs/${job.id}/candidates`}>
                        <Button
                          variant="outline"
                          className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold bg-transparent"
                        >
                          Manage Job
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-gray-800 text-white p-6 rounded-xl border-0">
              <h3 className="text-xl font-bold mb-2">Recruit the best candidates</h3>
              <p className="text-gray-300 text-sm mb-6">Create jobs, invite, and hire with ease</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Create a new job
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div className="fixed bottom-6 left-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            Job vacancy successfully created
          </span>
        </div>
      )}

      <CreateJobModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
}
