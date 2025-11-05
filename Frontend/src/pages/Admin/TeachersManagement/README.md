# Teachers Management Structure

## Overview

هذه الصفحة تم تقسيمها باستخدام نفس بنية صفحة Students Management للحفاظ على الاتساق في المشروع.

## Structure

```
TeachersManagement/
├── index.tsx                 # Main page component
├── types.ts                  # TypeScript types and interfaces
├── components/               # Page-specific components
│   ├── TeachersHeader.tsx
│   ├── TeachersFilters.tsx
│   ├── TeachersBulkActions.tsx
│   ├── TeachersStatsCards.tsx
│   ├── TeachersToolbar.tsx
│   └── index.ts
└── hooks/                    # Custom hooks for state management
    ├── useTeachersData.ts    # Data fetching and loading
    ├── useTeachersFilters.ts # Filtering and sorting logic
    ├── useTeachersActions.ts # CRUD operations
    ├── useTeachersStats.ts   # Statistics calculations
    └── index.ts
```

## Features

### 1. Data Management (useTeachersData)

- Fetches teachers from API
- Handles loading states
- Error handling with retry logic
- Socket.io integration for real-time updates

### 2. Filters (useTeachersFilters)

- Search by name, email, phone
- Filter by gender
- Filter by groups (with/without)
- Age range filter
- Pagination
- Sorting

### 3. Actions (useTeachersActions)

- Add new teacher
- Edit existing teacher
- Delete teacher (with validation)
- Bulk delete
- Export to CSV
- Sound effects integration

### 4. Statistics (useTeachersStats)

- Total count
- Gender breakdown
- Average age
- Groups statistics

## Shared Components

The page reuses the following components from the Students folder:

- `StudentGridView` - Grid layout view
- `StudentTableView` - Table layout view

These components work with teachers data because they accept generic student-like objects.

## UI Components Used

From `@/components/UI`:

- `Button`
- `EmptyState`
- `LoadingSpinner`
- `StatCard`
- `ResponsivePagination`
- `Table`

## Socket Integration

Uses `useTeachersSocket` hook for real-time updates:

- Teacher created
- Teacher updated
- Teacher deleted
- Heartbeat every 30 seconds

## Forms

Uses `EnhancedTeacherForm` component for add/edit operations.

## Notes

- الصفحة القديمة محفوظة في `TeachersManagement.tsx.backup`
- جميع الوظائف الحالية محفوظة
- الشكل الحالي محفوظ
- تم استخدام نفس الـ UI Components
- الكود أكثر تنظيماً وسهولة للصيانة
