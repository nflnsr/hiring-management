"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<"admin" | "applicant" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userRole");
    if (stored) {
      setUserRole(stored as "admin" | "applicant");
      router.push(stored === "admin" ? "/admin/jobs" : "/jobs");
    }
  }, [router]);

  const handleRoleSelect = (role: "admin" | "applicant") => {
    localStorage.setItem("userRole", role);
    router.push(role === "admin" ? "/admin/jobs" : "/jobs");
  };

  const handleResetData = () => {
    localStorage.clear();
    setUserRole(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary to-primary-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Hiring Management Platform</h1>
          <p className="text-lg mb-12 text-black">Select your role to get started</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleRoleSelect("admin")}
              className="p-8 border-2 border-border rounded-lg hover:border-accent hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">👔</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Admin / Recruiter</h2>
              <p className="text-gray-600">
                Create jobs, manage applicants, and configure requirements
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect("applicant")}
              className="p-8 border-2 border-border rounded-lg hover:border-accent hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Job Seeker</h2>
              <p className="text-gray-600">Browse jobs and submit applications</p>
            </button>
          </div>
          <div className="pt-4 w-full">
            <button
              onClick={handleResetData}
              className="bg-red-500 w-full hover:bg-red-400 cursor-pointer text-white px-4 py-2 rounded-md"
            >
              Reset data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
