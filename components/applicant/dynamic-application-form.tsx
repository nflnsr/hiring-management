"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WebcamCapture from "./webcam-capture";

interface DynamicApplicationFormProps {
  job: {
    id: string;
    title: string;
    application_form: {
      sections: Array<{
        title: string;
        fields: Array<{
          key: string;
          validation: { required: boolean };
        }>;
      }>;
    };
  };
  jobId: string;
}

export default function DynamicApplicationForm({ job, jobId }: DynamicApplicationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  const section = job.application_form.sections[0];
  const visibleFields = section.fields.filter((f) => f.key !== "photo_profile");
  const photoField = section.fields.find((f) => f.key === "photo_profile");
  const photoRequired = photoField?.validation.required || false;

  const fieldLabels: Record<string, string> = {
    full_name: "Full Name",
    email: "Email Address",
    phone_number: "Phone Number",
    gender: "Gender",
    domicile: "Domicile",
    linkedin_link: "LinkedIn Profile URL",
    date_of_birth: "Date of Birth",
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    section.fields.forEach((field) => {
      if (field.validation.required) {
        if (field.key === "photo_profile") {
          if (!formData.photo_profile) {
            newErrors.photo_profile = "Profile photo is required";
          }
        } else if (!formData[field.key]?.trim()) {
          newErrors[field.key] = `${fieldLabels[field.key]} is required`;
        }
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const candidate = {
      id: `cand_${Date.now()}`,
      job_id: jobId,
      attributes: visibleFields.map((field) => ({
        key: field.key,
        label: fieldLabels[field.key],
        value: formData[field.key] || "",
      })),
      applied_at: new Date().toISOString(),
    };

    const candidates = JSON.parse(localStorage.getItem("candidates") || "[]");
    candidates.push(candidate);
    localStorage.setItem("candidates", JSON.stringify(candidates));

    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      router.push("/jobs");
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
        <p className="text-muted mb-6">
          Your application has been submitted successfully. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {photoField && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground">
            Profile Photo{" "}
            {photoField.validation.required && <span className="text-red-600">*</span>}
          </label>
          {formData.photo_profile ? (
            <div className="flex items-center gap-4">
              <img
                src={formData.photo_profile || "/placeholder.svg"}
                alt="Profile"
                className="w-24 h-24 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setShowWebcam(!showWebcam)}
                className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retake Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowWebcam(!showWebcam)}
              className="w-full px-4 py-3 border-2 border-dashed border-accent text-accent rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              📷 Capture Photo with Hand Gesture
            </button>
          )}
          {showWebcam && (
            <WebcamCapture
              onPhotoCapture={(photoData) => {
                handleChange("photo_profile", photoData);
                setShowWebcam(false);
              }}
              onCancel={() => setShowWebcam(false)}
            />
          )}
          {errors.photo_profile && <p className="text-red-600 text-sm">{errors.photo_profile}</p>}
        </div>
      )}

      <div className="space-y-6">
        {visibleFields.map((field) => {
          if (field.key === "photo_profile") return null;

          return (
            <div key={field.key} className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                {fieldLabels[field.key] || field.key}
                {field.validation.required && <span className="text-red-600">*</span>}
              </label>

              {field.key === "gender" ? (
                <select
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors[field.key] ? "border-error" : "border-border"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : field.key === "date_of_birth" ? (
                <input
                  type="date"
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors[field.key] ? "border-error" : "border-border"
                  }`}
                />
              ) : field.key === "email" ? (
                <input
                  type="email"
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors[field.key] ? "border-error" : "border-border"
                  }`}
                  placeholder={`Enter ${fieldLabels[field.key]}`}
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors[field.key] ? "border-error" : "border-border"
                  }`}
                  placeholder={`Enter ${fieldLabels[field.key]}`}
                />
              )}

              {errors[field.key] && <p className="text-red-600 text-sm">{errors[field.key]}</p>}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent hover:bg-accent-600 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
