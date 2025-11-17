"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Info, Download } from "lucide-react";
import WebcamCapture from "@/components/applicant/webcam-capture";
const WebcamCaptureAny: any = WebcamCapture as any;

interface JobField {
  key: string;
  label: string;
  required: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  fields: JobField[];
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWebcam, setShowWebcam] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const storedJobs = localStorage.getItem("jobs");
    if (storedJobs) {
      const jobs = JSON.parse(storedJobs);
      const foundJob = jobs.find((j: any) => j.id === jobId);
      if (foundJob) {
        const fields = foundJob.fields.filter((f: any) => f.required !== false);
        setJob({ ...foundJob, fields });
        const initialData: Record<string, any> = {};
        fields.forEach((field: any) => {
          initialData[field.key] = "";
        });
        setFormData(initialData);
      }
    }
  }, [jobId]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    job?.fields.forEach((field) => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const application = {
        id: Date.now().toString(),
        jobId,
        ...formData,
        photoData,
        submittedAt: new Date().toISOString(),
      };
      const stored = localStorage.getItem("applications") || "[]";
      const applications = JSON.parse(stored);
      applications.push(application);
      localStorage.setItem("applications", JSON.stringify(applications));
      setSubmitted(true);
      setTimeout(() => router.push("/applicant"), 2000);
    }
  };

  const handlePhotoCapture = (imageData: string) => {
    setPhotoData(imageData);
    setShowWebcam(false);
  };

  if (!job) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              />
            </svg>
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
            Apply {job.title} at {job.company}
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

        {job.fields.some((f) => f.key === "photo_profile") && (
          <div className="mb-8">
            <label className="block text-gray-900 font-medium mb-4">Photo Profile</label>
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-teal-200 to-teal-100 flex items-center justify-center overflow-hidden">
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
              <button
                type="button"
                onClick={() => setShowWebcam(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                <Download className="w-4 h-4" />
                Take a Picture
              </button>
              {errors.photo_profile && (
                <span className="text-red-600 text-sm">{errors.photo_profile}</span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {job.fields
            .filter((f) => f.key !== "photo_profile")
            .map((field) => (
              <div key={field.key}>
                <label className="block text-gray-900 font-medium mb-2">
                  {field.label}
                  {field.required && <span className="text-red-600 ml-1">*</span>}
                </label>

                {field.key === "gender" ? (
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="Female"
                        checked={formData[field.key] === "Female"}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">She/her (Female)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="Male"
                        checked={formData[field.key] === "Male"}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">He/him (Male)</span>
                    </label>
                  </div>
                ) : field.key === "domicile" ? (
                  <select
                    value={formData[field.key] || ""}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
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
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors[field.key] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                ) : field.key === "phone_number" ? (
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg">
                      <option>+62</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="81XXXXXXXXX"
                      value={formData[field.key] || ""}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
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
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors[field.key] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                ) : (
                  <input
                    type={field.key === "email" ? "email" : "text"}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    value={formData[field.key] || ""}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors[field.key] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                )}
                {errors[field.key] && (
                  <span className="text-red-600 text-sm mt-1 block">{errors[field.key]}</span>
                )}
              </div>
            ))}
        </div>

        <button
          type="submit"
          className="w-full mt-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
        >
          Submit
        </button>
      </form>
      {showWebcam && (
        <WebcamCaptureAny onCapture={handlePhotoCapture} onClose={() => setShowWebcam(false)} />
      )}
    </div>
  );
}
