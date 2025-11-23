import type { INews } from "@/Api/newsApi";

export type { INews };

export interface NewsHeaderProps {
  isTeacherOrAdmin: boolean;
  onAddNews: () => void;
  socketConnected?: boolean;
  socketId?: string | null;
  socketLastUpdate?: Date | null;
}

export interface NewsCardProps {
  news: INews;
  index: number;
  isTeacherOrAdmin: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  onEdit: (news: INews) => void;
  onDelete: (id: string) => void;
}

export interface NewsModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  isLoading: boolean;
  newNews: Partial<INews>;
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fieldErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface NewsEmptyStateProps {
  hasError: boolean;
  error: string | null;
  hasNews: boolean;
  isFiltered: boolean;
  isTeacherOrAdmin: boolean;
  onRetry: () => void;
  onAddNews: () => void;
}

export interface NewsFiltersProps {
  searchTerm: string;
  sortOrder: 'newest' | 'oldest';
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}
