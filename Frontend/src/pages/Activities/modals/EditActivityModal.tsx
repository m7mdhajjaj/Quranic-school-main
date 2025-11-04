import React from "react";
import { Button,Modal, Input, Select, Textarea, ImageUpload, DatePicker } from "@/components/UI";
import { Edit, Tag } from "lucide-react";
import type { ActivityFormData } from "../types/activities";
import { API_BASE_URL } from "@/config/config";

interface EditActivityModalProps {
  isOpen: boolean;
  activity: ActivityFormData;
  loading: boolean;
  imagePreview: string | null;
  validationErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  activity,
  loading,
  imagePreview,
  validationErrors = {},
  onClose,
  onSubmit,
  onInputChange,
  onImageChange,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل النشاط">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 -mt-6 -mx-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Edit className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">تعديل النشاط</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title Field */}
        <div className="mb-6">
          <Input
            label="عنوان النشاط"
            name="title"
            value={activity.title}
            onChange={onInputChange}
            placeholder="أدخل عنوان النشاط"
            required
            error={validationErrors.title}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            }
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <Select
            label="التصنيف"
            name="category"
            value={activity.category}
            onChange={onInputChange}
            icon={<Tag size={20} />}
            error={validationErrors.category}
            options={[
              { value: "رحلة", label: "رحلة" },
              { value: "رياضي", label: "رياضي" },
              { value: "ثقافي", label: "ثقافي" },
              { value: "تعليمي", label: "تعليمي" },
              { value: "اجتماعي", label: "اجتماعي" },
              { value: "ديني", label: "ديني" },
              { value: "مسابقة", label: "مسابقة" },
              { value: "ورشة عمل", label: "ورشة عمل" },
              { value: "محاضرة", label: "محاضرة" },
              { value: "درس", label: "درس" },
            ]}
          />
        </div>

        {/* Date Picker */}
        <div className="mb-6">
          <DatePicker
            label="تاريخ النشاط"
            value={activity.date}
            onChange={(newDate) => {
              const event = {
                target: {
                  name: 'date',
                  value: newDate,
                },
              } as React.ChangeEvent<HTMLInputElement>;
              onInputChange(event);
            }}
            required
            error={validationErrors.date}
          />
        </div>

        {/* Description Field */}
        <div className="mb-6">
          <Textarea
            label="وصف النشاط"
            name="description"
            value={activity.description}
            onChange={onInputChange}
            placeholder="أدخل وصف النشاط"
            rows={4}
            required
            error={validationErrors.description}
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <ImageUpload
            label="صورة النشاط"
            onImageSelect={(file) => {
              const event = {
                target: {
                  name: "image",
                  files: [file],
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              onImageChange(event);
            }}
            currentImage={
              imagePreview ||
              (activity.image
                ? activity.image.startsWith("http")
                  ? activity.image
                  : `${API_BASE_URL}/${activity.image}`
                : null)
            }
            error={validationErrors.image}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            leftIcon={loading ? undefined : <Edit className="h-5 w-5" />}
            className="flex-1"
          >
            {loading ? "جاري التحديث..." : "تحديث النشاط"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
