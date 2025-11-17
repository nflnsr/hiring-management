"use client"

import { useRouter } from "next/navigation"

interface JobCardProps {
  job: {
    id: string
    title: string
    department: string
    status: "active" | "inactive" | "draft"
    salary_range: {
      min: number
      max: number
      currency: string
    }
    created_at: string
  }
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter()

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
    return `${formatter.format(min)} - ${formatter.format(max)}`
  }

  return (
    <div
      className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/jobs/${job.id}/apply`)}
    >
      <h3 className="text-lg font-semibold text-foreground mb-2">{job.title}</h3>
      <p className="text-muted text-sm mb-4">{job.department}</p>

      <div className="mb-6">
        <p className="text-primary font-semibold">
          {formatSalary(job.salary_range.min, job.salary_range.max, job.salary_range.currency)}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          router.push(`/jobs/${job.id}/apply`)
        }}
        className="w-full bg-accent hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Apply Now
      </button>
    </div>
  )
}
