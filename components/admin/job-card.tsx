"use client";

import { useRouter } from "next/navigation";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    department: string;
    status: "active" | "inactive" | "draft";
    salary_range: {
      min: number;
      max: number;
      currency: string;
    };
    created_at: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter();

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    draft: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            statusColors[job.status]
          }`}
        >
          {job.status}
        </span>
      </div>

      <p className="text-muted text-sm mb-4">{job.department}</p>

      <div className="mb-6">
        <p className="text-primary font-semibold">
          {formatSalary(job.salary_range.min, job.salary_range.max, job.salary_range.currency)}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/admin/jobs/${job.id}/candidates`)}
          className="flex-1 bg-accent hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          View Candidates
        </button>
        <button
          onClick={() => router.push(`/admin/jobs/${job.id}/edit`)}
          className="flex-1 border border-border hover:bg-gray-50 text-foreground font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
