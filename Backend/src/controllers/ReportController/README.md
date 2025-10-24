# ReportController Module

This module handles all reporting functionality for the Quranic School Management System.

## Structure

```
ReportController/
├── index.js              # Main entry point - exports all functions
├── studentMarks.js        # Student marks for charts (monthly/yearly)
├── averageMarks.js        # Average marks for groups
├── studentReport.js       # Detailed student reports
├── groupReport.js         # Group reports and statistics
├── exportReports.js       # PDF export functionality
├── reportHelpers.js       # Utility functions
└── README.md             # This documentation
```

## Functions

### Student Marks (`studentMarks.js`)

- `getStudentMarks` - Get student marks for charts (monthly/yearly)

### Average Marks (`averageMarks.js`)

- `getAverageMarks` - Get average marks for all students in a group

### Student Reports (`studentReport.js`)

- `getStudentReport` - Get detailed student report with attendance, marks, and exam stats

### Group Reports (`groupReport.js`)

- `getGroupReport` - Get group report with statistics and top students

### Export Reports (`exportReports.js`)

- `exportStudentReportPDF` - Export student report as PDF (placeholder)
- `exportGroupReportPDF` - Export group report as PDF (placeholder)

### Helper Functions (`reportHelpers.js`)

- `calculateOverallAverage` - Calculate overall average from memorization and review
- `buildDateFilter` - Format date range filter for MongoDB queries
- `calculateAttendancePercentage` - Calculate attendance percentage
- `formatStudentName` - Format student name for display
- `sortMonthlyAverages` - Sort monthly averages by year and month
- `filterAveragesByPeriod` - Filter averages by month and year

## Usage

```javascript
const ReportController = require("./ReportController");

// Get student marks
const studentMarks = await ReportController.getStudentMarks(req, res);

// Get group report
const groupReport = await ReportController.getGroupReport(req, res);
```

## Dependencies

- `Student` schema
- `Teacher` schema
- `Group` schema
- `Attendance` schema
- `DailyMark` schema
- `ExamMark` schema
- `mongoose` for ObjectId operations

## Features

- **Student Marks**: Monthly and yearly mark tracking with chart data
- **Group Analytics**: Average marks and statistics for study groups
- **Detailed Reports**: Comprehensive student performance reports
- **Export Functionality**: PDF export capabilities (to be implemented)
- **Helper Utilities**: Reusable functions for common calculations

## Error Handling

All functions include proper error handling with Arabic error messages and appropriate HTTP status codes.
