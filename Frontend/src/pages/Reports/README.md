# Reports Module

This module handles the reports and statistics functionality for the Quranic School Management System with comprehensive validation and modern UI components.

## Structure

```
Reports/
├── Reports.tsx           # Main Reports component
├── ReportHeader.tsx      # Page header with title and icon
├── ReportFilters.tsx     # Filter controls with validation
├── ReportChart.tsx       # Chart display component
├── useReportData.ts      # Custom hook for data management
├── index.ts             # Main exports
└── README.md            # This documentation
```

## Validation

### Frontend Validation
- **File**: `Frontend/src/Validation/reportValidation.ts`
- **Features**:
  - Month validation (1-12)
  - Year validation (2020-2030)
  - Student ID validation (MongoDB ObjectId format)
  - Date range validation
  - Input sanitization

### Backend Validation
- **File**: `Backend/src/Validation/ReportValidation.js`
- **Features**:
  - Express-validator integration
  - Query parameter validation
  - Route parameter validation
  - Date range validation
  - Input sanitization

## Components

### Reports.tsx

Main component that orchestrates all other components and manages the overall layout.

### ReportHeader.tsx

- **Purpose**: Displays the page header with title, subtitle, and icon
- **Features**: Uses shared `PageHeader` component with gradient styling
- **Props**: None (static header)

### ReportFilters.tsx

- **Purpose**: Provides filtering controls for month and year selection
- **Features**:
  - Uses shared `Card` and `Select` components
  - Responsive grid layout
  - Month and year dropdowns
- **Props**:
  - `selectedMonth`: Currently selected month
  - `selectedYear`: Currently selected year
  - `onMonthChange`: Month change handler
  - `onYearChange`: Year change handler

### ReportChart.tsx

- **Purpose**: Displays the chart and handles empty states
- **Features**:
  - Uses shared `Card` component
  - Integrates with `MarksBarChart` component
  - Handles empty states with appropriate messaging
  - Different content for students vs teachers
- **Props**:
  - `labels`: Chart labels array
  - `data`: Chart data array
  - `userRole`: User role (student/teacher)
  - `selectedMonth`: Selected month filter
  - `selectedYear`: Selected year filter

### useReportData.ts

- **Purpose**: Custom hook for managing report data and state
- **Features**:
  - Manages loading states
  - Handles user profile loading
  - Manages chart data fetching
  - Provides filter state management
- **Returns**:
  - `loading`: Loading state
  - `userRole`: Current user role
  - `userId`: Current user ID
  - `chartData`: Chart data object
  - `selectedMonth`: Selected month
  - `selectedYear`: Selected year
  - `setSelectedMonth`: Month setter
  - `setSelectedYear`: Year setter
  - `loadChartData`: Data loading function

## Shared Components Used

- **Card**: For consistent styling of filter and chart containers
- **Select**: For dropdown filters
- **PageHeader**: For page title and branding
- **LoadingSpinner**: For loading states
- **ReportsSkeleton**: For loading skeleton

## Features

### Responsive Design

- Mobile-first approach with responsive breakpoints
- Adaptive grid layouts for filters
- Responsive text sizing

### User Experience

- Loading states with skeleton components
- Empty states with helpful messaging
- Role-based content (student vs teacher views)
- Smooth transitions and animations

### Data Management

- Custom hook for centralized state management
- Automatic data reloading on filter changes
- Error handling with console logging
- Profile-based initialization

## Usage

```tsx
import Reports from "./Reports/Reports";

// Use in routing
<Route path="/reports" element={<Reports />} />;
```

## Dependencies

- React hooks (useState, useEffect, useCallback)
- Shared components from `../../components/shared`
- API functions from `../../Api/reportApi` and `../../Api/profileApi`
- Lucide React icons
- MarksBarChart component

## Error Handling

- Console error logging for debugging
- Graceful fallbacks for missing data
- Loading states to prevent UI blocking
- Empty states with helpful user messaging
