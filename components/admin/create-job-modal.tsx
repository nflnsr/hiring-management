"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: any) => void;
}

const PROFILE_FIELDS = [
  { key: "full_name", label: "Full name" },
  { key: "photo_profile", label: "Photo Profile" },
  { key: "gender", label: "Gender" },
  { key: "domicile", label: "Domicile" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Phone number" },
  { key: "linkedin_link", label: "LinkedIn link" },
  { key: "date_of_birth", label: "Date of birth" },
];

export default function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    status: "active" as "active" | "inactive" | "draft",
    salary_min: "7000000",
    salary_max: "8000000",
  });

  const [profileConfig, setProfileConfig] = useState<
    Record<string, "mandatory" | "optional" | "off">
  >(
    PROFILE_FIELDS.reduce((acc, field) => {
      acc[field.key] = "mandatory";
      return acc;
    }, {} as Record<string, "mandatory" | "optional" | "off">)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.department || !formData.salary_min || !formData.salary_max) {
      alert("Please fill in all required fields");
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const newJob = {
      id: `job_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      department: formData.department,
      status: formData.status,
      salary_range: {
        min: Number.parseInt(formData.salary_min),
        max: Number.parseInt(formData.salary_max),
        currency: "IDR",
      },
      application_form: {
        sections: [
          {
            title: "Minimum Profile Information Required",
            fields: PROFILE_FIELDS.filter((f) => profileConfig[f.key] !== "off").map((field) => ({
              key: field.key,
              validation: { required: profileConfig[field.key] === "mandatory" },
            })),
          },
        ],
      },
      created_at: dateStr,
    };

    onJobCreated(newJob);
    setFormData({
      title: "",
      description: "",
      department: "",
      status: "active",
      salary_min: "7000000",
      salary_max: "8000000",
    });
    setProfileConfig(
      PROFILE_FIELDS.reduce((acc, field) => {
        acc[field.key] = "mandatory";
        return acc;
      }, {} as Record<string, "mandatory" | "optional" | "off">)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Job Opening</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Job Name<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Ex. Front End Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white border border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Job Type<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground"
            >
              <option value="">Select job type</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Job Description<span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Ex."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground min-h-28"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Job Status<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "active" | "inactive" | "draft",
                })
              }
              className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Job Salary</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Minimum Estimated Salary
                </label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">Rp</span>
                  <Input
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    className="bg-white border border-border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Maximum Estimated Salary
                </label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">Rp</span>
                  <Input
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    className="bg-white border border-border"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-4">
              Minimum Profile Information Required
            </label>
            <div className="space-y-3">
              {PROFILE_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex justify-between items-center pb-3 border-b border-border last:border-0"
                >
                  <span className="text-sm text-foreground">{field.label}</span>
                  <div className="flex gap-2">
                    {["mandatory", "optional", "off"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setProfileConfig((prev) => ({ ...prev, [field.key]: option as any }))
                        }
                        className={`px-4 py-1 rounded-full text-sm font-medium border transition-colors ${
                          profileConfig[field.key] === option
                            ? "border-primary bg-white text-primary"
                            : "border-gray-300 bg-white text-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border border-border text-foreground hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Publish Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
