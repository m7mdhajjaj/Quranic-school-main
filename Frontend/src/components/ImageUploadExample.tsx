import React, { useState } from "react";
import { uploadActivityImage, deleteImage } from "../Api/uploadApi";
import Swal from "sweetalert2";

const ImageUploadExample: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "يجب اختيار صورة فقط",
        confirmButtonColor: "#DC2626",
      });
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        confirmButtonColor: "#DC2626",
      });
      return;
    }

    try {
      setUploading(true);
      const result = await uploadActivityImage(file);

      if (result.success && result.url && result.publicId) {
        setImageUrl(result.url);
        setPublicId(result.publicId);

        await Swal.fire({
          icon: "success",
          title: "تم بنجاح",
          text: "تم رفع الصورة بنجاح",
          confirmButtonColor: "#059669",
          timer: 2000,
        });
      }
    } catch (error: any) {
      console.error("خطأ في رفع الصورة:", error);
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "حدث خطأ أثناء رفع الصورة",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!publicId) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف الصورة؟",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
    });

    if (!result.isConfirmed) return;

    try {
      setUploading(true);
      await deleteImage(publicId);

      setImageUrl("");
      setPublicId("");

      await Swal.fire({
        icon: "success",
        title: "تم الحذف",
        text: "تم حذف الصورة بنجاح",
        confirmButtonColor: "#059669",
        timer: 2000,
      });
    } catch (error: any) {
      console.error("خطأ في حذف الصورة:", error);
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "حدث خطأ أثناء حذف الصورة",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">رفع صورة</h2>

      <div className="mb-4">
        <label
          htmlFor="image-upload"
          className="block w-full p-4 border-2 border-dashed border-emerald-300 rounded-lg text-center cursor-pointer hover:border-emerald-500 transition-colors">
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />

          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
              <span className="text-emerald-600">جاري الرفع...</span>
            </div>
          ) : (
            <div>
              <svg
                className="mx-auto h-12 w-12 text-emerald-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-emerald-700">
                اضغط لاختيار صورة أو اسحبها هنا
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                PNG, JPG, GIF حتى 5MB
              </p>
            </div>
          )}
        </label>
      </div>

      {imageUrl && (
        <div className="mt-6">
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img src={imageUrl} alt="Uploaded" className="w-full h-auto" />
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg shadow-lg transition-colors disabled:opacity-50">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
          <div className="mt-2 p-3 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-700 break-all">
              <strong>رابط الصورة:</strong> {imageUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadExample;
