# Admin Routes Structure

This folder contains modular admin routes split by functionality.

## Structure

```
adminRoutes/
├── index.js           # Main router that combines all sub-routes
├── crud.routes.js     # CRUD operations (Create, Read, Update, Delete)
├── avatar.routes.js   # Avatar management (Upload, Get, Delete)
└── README.md          # This file
```

## Routes Overview

### CRUD Routes (`crud.routes.js`)
All routes protected by `protect` middleware and use `validateAdminData` for POST/PUT operations:

- `GET /` - Get all admins
- `GET /stats` - Get admin statistics
- `GET /:id` - Get admin by ID
- `POST /` - Create new admin (with validation)
- `PUT /:id` - Update admin (with validation)
- `DELETE /:id` - Delete admin

### Avatar Routes (`avatar.routes.js`)
All routes protected by `protect` middleware:

- `POST /:id/avatar` - Upload admin avatar (Cloudinary)
- `GET /:id/avatar` - Get admin avatar URL
- `DELETE /:id/avatar` - Delete admin avatar

## Validation

All CREATE and UPDATE operations use `AdminValidation.js` middleware which includes:
- ✅ Format validation (email, phone, idNumber)
- ✅ Required fields validation
- ✅ Duplicate checking across all users (Admin, Teacher, Student)
- ✅ Password hashing
- ✅ Data sanitization

## Usage

Import in main app:
```javascript
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admins', adminRoutes);
```

## Dependencies

- `express` - Router
- `cloudinary` - Avatar storage
- `multer` - File upload
- `AdminValidation` - Data validation middleware
- `authMiddleware` - Authentication middleware
- `adminController` - Business logic
