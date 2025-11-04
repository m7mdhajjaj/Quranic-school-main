import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/utils/toastUtils";
import { createActivity, updateActivity } from "@/Api/activityApi";
import { useActivitiesSocket } from '../../Socket';
import {
  validateActivityForm,
  validateImageFile,
} from '../../Validation/activityValidation';

// Import refactored components, hooks, and types
import type { Activity, ActivityFormData } from './types/activities';
import { useActivitiesData } from './hooks/useActivitiesData';
import { ActivityHeaderComponent } from './components/ActivityHeaderComponent';
import { ActivityListComponent } from './components/ActivityListComponent';
import {
  AddActivityModal,
  EditActivityModal,
  showDeleteActivityModal,
} from './modals';
import FilterButtons, {
  type FilterButton,
} from "@/components/Filters/FilterButtons";
import SearchInput from "@/components/Filters/SearchInput";
import { EmptyState } from "@/components/UI/EmptyState";
import { Alert } from "@/components/UI/Alert";

const ActivitiesPage = () => {
  // Socket Connection Hook
  const { lastUpdate: socketLastUpdate } = useActivitiesSocket();

  // Data Hook
  const {
    activities,
    loading,
    setLoading,
    error,
    setError,
    isTeacherOrAdmin,
    refetchActivities,
  } = useActivitiesData();

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('الكل');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [currentActivity, setCurrentActivity] = useState<ActivityFormData>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    category: 'رحلة',
  });

  // Refetch on socket update
  useEffect(() => {
    if (!socketLastUpdate) return;
    refetchActivities();
  }, [socketLastUpdate, refetchActivities]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: 'ease-in-out',
    });
  }, []);

  // Handlers
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate image using validation file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        showErrorToast(validation.message || 'خطأ في الصورة');
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setCurrentActivity({
          ...currentActivity,
          image: imageUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCurrentActivity({ ...currentActivity, [name]: value });

    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const openAddModal = () => {
    setCurrentActivity({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      category: 'رحلة',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setValidationErrors({}); // Clear validation errors
    setIsAddModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setCurrentActivity({
      _id: activity._id,
      title: activity.title,
      description: activity.description,
      date: activity.date,
      image: activity.image || '',
      category: activity.category || 'رحلة',
    });
    setSelectedImage(null);
    setImagePreview(activity.image || null);
    setValidationErrors({}); // Clear validation errors
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleSubmit = async () => {
    // Validate form data
    const errors = await validateActivityForm({
      title: currentActivity.title,
      description: currentActivity.description,
      date: currentActivity.date,
      category: currentActivity.category,
      selectedFile: selectedImage,
    });

    // Check if there are validation errors
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      showErrorToast(firstError);
      return;
    }

    setLoading(true);

    try {
      // Create FormData to send to backend (backend will handle Cloudinary upload)
      const formData = new FormData();
      formData.append('title', currentActivity.title);
      formData.append('description', currentActivity.description);
      formData.append('date', currentActivity.date);
      formData.append('category', currentActivity.category || 'رحلة');

      // Add the image file if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      if (currentActivity._id) {
        // Edit mode
        await updateActivity(currentActivity._id, formData);
        showSuccessToast('تم تحديث النشاط بنجاح ✓');
      } else {
        // Add mode
        await createActivity(formData);
        showSuccessToast('تم إضافة النشاط بنجاح ✓');
      }

      closeModals();

      // Refetch activities without showing loader
      await refetchActivities(false);
    } catch (err) {
      console.error('Error saving activity:', err);
      setError('حدث خطأ أثناء حفظ النشاط');
      showErrorToast('حدث خطأ أثناء حفظ النشاط، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (_id: string) => {
    await showDeleteActivityModal({
      activityId: _id,
      onSuccess: () => refetchActivities(false),
    });
  };

  // Filter logic
  const filteredActivities = activities.filter((activity) => {
    // فلتر حسب التصنيف
    const matchesCategory = filter === 'الكل' || activity.category === filter;

    // فلتر حسب البحث
    const matchesSearch =
      !searchTerm ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categories = [
    'الكل',
    ...Array.from(new Set(activities.map((a) => a.category))),
  ];

  const filterButtons: FilterButton[] = categories.map((category) => ({
    value: category || '',
    label: category || '',
    count:
      category === 'الكل'
        ? activities.length
        : activities.filter((a) => a.category === category).length,
  }));

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl"
    >
      <div className="container mx-auto">
        {/* Header */}
        <ActivityHeaderComponent
          isTeacherOrAdmin={isTeacherOrAdmin}
          onAddClick={openAddModal}
        />

        {/* Search Input */}
        <div className="mb-6 max-w-2xl mx-auto">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث في الأنشطة..."
            size="md"
          />
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex justify-center">
          <FilterButtons
            buttons={filterButtons}
            activeValue={filter}
            onChange={setFilter}
            variant="pills"
          />
        </div>

        {/* Activity List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Activity List */}
            {filteredActivities.length > 0 ? (
              <ActivityListComponent
                activities={filteredActivities}
                isTeacherOrAdmin={isTeacherOrAdmin}
                onEdit={openEditModal}
                onDelete={handleDeleteActivity}
              />
            ) : (
              <EmptyState
                title="لا توجد أنشطة بهذا التصنيف"
                description={
                  filter === 'الكل'
                    ? 'لم يتم إضافة أي أنشطة بعد'
                    : `لا توجد أنشطة في تصنيف "${filter}"`
                }
                action={
                  isTeacherOrAdmin
                    ? {
                        label: 'إضافة نشاط جديد',
                        onClick: openAddModal,
                      }
                    : undefined
                }
              />
            )}
          </>
        )}

        {/* Error Alert */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8">
            <Alert
              variant="danger"
              title="حدث خطأ!"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </div>
        )}

        {/* Modals */}
        <AddActivityModal
          isOpen={isAddModalOpen}
          activity={currentActivity}
          loading={loading}
          imagePreview={imagePreview}
          validationErrors={validationErrors}
          onClose={closeModals}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onImageChange={handleImageChange}
        />

        <EditActivityModal
          isOpen={isEditModalOpen}
          activity={currentActivity}
          loading={loading}
          imagePreview={imagePreview}
          validationErrors={validationErrors}
          onClose={closeModals}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onImageChange={handleImageChange}
        />
      </div>
    </div>
  );
};

export default ActivitiesPage;
