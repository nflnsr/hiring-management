"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Check, Info, Download } from "lucide-react";
import WebcamCapture from "@/components/applicant/webcam-capture";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  department: string;
  application_form: {
    sections: Array<{
      title: string;
      fields: Array<{
        key: string;
        validation: { required: boolean };
      }>;
    }>;
  };
}

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWebcam, setShowWebcam] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "applicant") {
      router.push("/");
      return;
    }

    const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
    const foundJob = jobs.find((j: any) => j.id === jobId);
    if (foundJob) {
      setJob(foundJob);
      const initialForm: Record<string, string> = {};
      foundJob.application_form.sections[0].fields.forEach((field: any) => {
        initialForm[field.key] = "";
      });
      setFormData(initialForm);
    }
    setLoading(false);
  }, [jobId, router]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoCapture = (imageData: string) => {
    setPhotoData(imageData);
    setShowWebcam(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setPhotoData(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatFieldName = (key: string) => {
    return key
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    const newErrors: Record<string, string> = {};

    job.application_form.sections[0].fields.forEach((field: any) => {
      if (field.key === "photo_profile") {
        if (field.validation.required && !photoData) {
          newErrors[field.key] = "Photo Profile is required";
        }
      } else if (field.validation.required && !formData[field.key]) {
        newErrors[field.key] = `${formatFieldName(field.key)} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      console.log("[v0] Validation errors:", newErrors);
      setErrors(newErrors);
      return;
    }

    const candidate = {
      id: `cand_${Date.now()}`,
      job_id: jobId,
      ...formData,
      photoData,
      applied_at: new Date().toISOString(),
    };

    const candidates = JSON.parse(localStorage.getItem("candidates") || "[]");
    candidates.push(candidate);
    localStorage.setItem("candidates", JSON.stringify(candidates));
    setSubmitted(true);

    setTimeout(() => {
      router.push("/jobs");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground text-lg">Job not found</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600">Redirecting to jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">
            Apply {job.title} at {job.company || job.department}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>This field required to fill</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <span className="text-red-600 font-semibold text-sm">* Required</span>
        </div>

        {job.application_form.sections[0].fields.some((f) => f.key === "photo_profile") && (
          <div className="mb-8">
            <label className="block text-gray-900 font-medium mb-4">
              Photo Profile
              {job.application_form.sections[0].fields.find((f) => f.key === "photo_profile")
                ?.validation.required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-teal-200 to-teal-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {photoData ? (
                  <img
                    src={photoData || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Take a Picture
                </button>

                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {errors.photo_profile && (
                <span className="text-red-600 text-sm flex items-center gap-1">
                  <span>✕</span> {errors.photo_profile}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {job.application_form.sections[0].fields
            .filter((f) => f.key !== "photo_profile")
            .map((field: any) => {
              const isMandatory = field.validation.required;
              const displayName = formatFieldName(field.key);

              return (
                <div key={field.key}>
                  <label className="block text-gray-900 font-medium mb-2">
                    {displayName}
                    {isMandatory && <span className="text-red-600 ml-1">*</span>}
                  </label>

                  {field.key === "gender" ? (
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="Female"
                          checked={formData[field.key] === "Female"}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">She/her (Female)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="Male"
                          checked={formData[field.key] === "Male"}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">He/him (Male)</span>
                      </label>
                    </div>
                  ) : field.key === "domicile" ? (
                    <select
                      value={formData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors[field.key] ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Choose your domicile</option>
                      <option>Jakarta</option>
                      <option>Surabaya</option>
                      <option>Bandung</option>
                      <option>Medan</option>
                    </select>
                  ) : field.key === "date_of_birth" ? (
                    <input
                      type="date"
                      value={formData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors[field.key] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  ) : field.key === "phone_number" ? (
                    <div className="flex gap-2">
                      <select className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                        <option>+62</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="81XXXXXXXXX"
                        value={formData[field.key] || ""}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          errors[field.key] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                  ) : field.key === "linkedin_link" ? (
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors[field.key] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  ) : (
                    <input
                      type={field.key === "email" ? "email" : "text"}
                      placeholder={`Enter your ${displayName.toLowerCase()}`}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors[field.key] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  )}
                  {errors[field.key] && (
                    <span className="text-red-600 text-sm mt-1 block">{errors[field.key]}</span>
                  )}
                </div>
              );
            })}
        </div>

        <button
          type="submit"
          className="w-full mt-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
        >
          Submit
        </button>
      </form>

      {showWebcam && (
        <WebcamCapture onPhotoCapture={handlePhotoCapture} onCancel={() => setShowWebcam(false)} />
      )}
    </div>
  );
}
