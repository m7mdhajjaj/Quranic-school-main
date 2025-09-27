# 🔧 Debug Guide for 401 Unauthorized Error

## Quick Diagnosis Steps

### 1. Check if Backend Server is Running
```bash
# Navigate to Backend directory
cd Backend

# Start the server
npm start
```

The server should show:
```
Server running on port 5005
Connected to MongoDB
```

### 2. Run Health Check
```bash
# In Backend directory
node health-check.js
```

### 3. Test API Endpoint Manually
Open browser and navigate to: `http://localhost:5005/api/auth/me`
- ✅ **Expected**: 401 error (server is running)
- ❌ **Problem**: Connection refused (server not running)

### 4. Check Frontend Configuration
The frontend should connect to: `http://localhost:5005/api`
- Verify in `Frontend/src/config.ts`
- Check browser Network tab for actual request URL

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptom**: `ERR_NETWORK` or `ECONNREFUSED` in browser console

**Solution**:
```bash
cd Backend
npm install  # if packages missing
npm start
```

### Issue 2: Wrong API URL
**Symptom**: 404 errors or wrong endpoint calls

**Solution**: Check `Frontend/src/config.ts`:
```typescript
export const API_URL = "http://localhost:5005/api";
```

### Issue 3: CORS Issues
**Symptom**: CORS policy errors in browser

**Solution**: Verify CORS settings in `Backend/src/app.js`:
```javascript
const allowedOrigins = ["http://localhost:5173"];
```

### Issue 4: JWT Secret Missing
**Symptom**: Server crashes or JWT errors

**Solution**: Check `Backend/.env`:
```
JWT_SECRET=quranic-school-secret-key
```

### Issue 5: MongoDB Connection
**Symptom**: Server starts but database errors

**Solution**: Verify MongoDB URI in `Backend/.env`

## Debugging Commands

### Check if port 5005 is in use:
```bash
# Windows
netstat -ano | findstr :5005

# Linux/Mac  
lsof -i :5005
```

### Test API manually:
```bash
# Test server is running
curl http://localhost:5005/api/auth/me

# Test login endpoint
curl -X POST http://localhost:5005/api/auth/login -H "Content-Type: application/json" -d '{"studentId":"test","idNumber":"test"}'
```

## Browser Debugging

1. **Open Developer Tools** (F12)
2. **Go to Network Tab**
3. **Try to login**
4. **Check the failed request**:
   - Status code (401, 404, 500, etc.)
   - Request URL (should be `http://localhost:5005/api/auth/login`)
   - Response body (error message)

## Quick Fix Commands

### Start Backend:
```bash
cd Backend
npm start
```

### Start Frontend:
```bash
cd Frontend  
npm run dev
```

### Reset Everything:
```bash
# Stop all processes
# Clear browser cache/localStorage
# Restart both servers
```

## Environment Variables Check

Create/verify `Backend/.env`:
```env
PORT=5005
MONGODB_URI=mongodb+srv://mohdhajjaj70_db_user:mohd258970@quranicschool.hnp9bpv.mongodb.net/quranicSchool?retryWrites=true&w=majority&appName=quranicschool
JWT_SECRET=quranic-school-secret-key
CORS_ORIGINS=http://localhost:5173
```

## Still Having Issues?

1. **Check server logs** for detailed error messages
2. **Check browser console** for JavaScript errors  
3. **Verify network connectivity** between frontend and backend
4. **Test with different credentials** to rule out data issues
5. **Try clearing browser cache and localStorage**