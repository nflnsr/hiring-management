"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Candidate {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  domicile: string;
  linkedin_link: string;
  date_of_birth: string;
}

export default function CandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      router.push("/");
      return;
    }

    const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
    const job = jobs.find((j: any) => j.id === jobId);
    if (job) {
      setJobTitle(job.title);
    }

    const allCandidates = JSON.parse(localStorage.getItem("candidates") || "[]");
    const jobCandidates = allCandidates.filter((c: any) => c.job_id === jobId);
    setCandidates(jobCandidates);
  }, [jobId, router]);

  const logoutHandler = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/admin/jobs">
              <button className="text-sm font-medium text-foreground hover:text-primary">
                Job list
              </button>
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Manage Candidate</span>
          </div>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">{jobTitle}</h2>

        {candidates.length === 0 ? (
          <Card className="p-16 text-center border border-border">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No candidates found</h3>
            <p className="text-muted-foreground">
              Share your job vacancies so that more candidates will apply.
            </p>
          </Card>
        ) : (
          <div className="border border-border rounded-lg overflow-x-auto bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-border" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Nama Lengkap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Email Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Phone Numbers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Domicile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Link LinkedIn
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-border hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-border" />
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {candidate.full_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{candidate.email || "-"}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {candidate.phone_number || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {candidate.date_of_birth || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {candidate.domicile || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{candidate.gender || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      {candidate.linkedin_link ? (
                        <a
                          href={candidate.linkedin_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate inline-block max-w-xs"
                        >
                          {candidate.linkedin_link.substring(0, 30)}...
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
