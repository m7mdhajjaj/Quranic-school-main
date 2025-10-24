# ReportRoutes Module

This module handles all reporting routes for the Quranic School Management System.

## Structure

```
ReportRoutes/
├── index.js              # Main entry point - combines all routes
├── studentMarksRoutes.js  # Student marks routes
├── averageMarksRoutes.js  # Average marks routes
├── studentReportRoutes.js  # Student report routes
├── groupReportRoutes.js    # Group report routes
├── exportRoutes.js         # Export functionality routes
├── routeHelpers.js         # Route helper functions
└── README.md              # This documentation
```

## Routes

### Student Marks Routes (`studentMarksRoutes.js`)

- `GET /student-marks` - Get student marks for charts (monthly/yearly)

### Average Marks Routes (`averageMarksRoutes.js`)

- `GET /average-marks` - Get average marks for all students in a group

### Student Report Routes (`studentReportRoutes.js`)

- `GET /student/:studentId` - Get detailed student report

### Group Report Routes (`groupReportRoutes.js`)

- `GET /group/:groupId` - Get group report with statistics

### Export Routes (`exportRoutes.js`)

- `GET /student/:studentId/export` - Export student report as PDF
- `GET /group/:groupId/export` - Export group report as PDF

## Helper Functions (`routeHelpers.js`)

- `validateStudentId` - Validate student ID parameter
- `validateGroupId` - Validate group ID parameter
- `validateDateRange` - Validate date range parameters
- `validateMonthYear` - Validate month and year parameters
- `extractReportParams` - Extract and validate query parameters

## Usage

```javascript
const ReportRoutes = require("./ReportRoutes");

// Use in main app
app.use("/api/reports", ReportRoutes);
```

## Middleware

All routes are protected with the `protect` middleware for authentication.

## Query Parameters

### Student Marks

- `studentId` (required) - Student ID
- `month` (optional) - Month filter
- `year` (optional) - Year filter

### Average Marks

- `groupName` (optional) - Group name filter
- `month` (optional) - Month filter
- `year` (optional) - Year filter

### Student Report

- `studentId` (required) - Student ID from URL params
- `startDate` (optional) - Start date filter
- `endDate` (optional) - End date filter

### Group Report

- `groupId` (required) - Group ID from URL params
- `startDate` (optional) - Start date filter
- `endDate` (optional) - End date filter

## Error Handling

All routes include proper error handling with Arabic error messages and appropriate HTTP status codes.

## Dependencies

- `express` - Web framework
- `protect` middleware - Authentication middleware
- `ReportController` - Controller functions
