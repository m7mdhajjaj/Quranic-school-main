# Chat System - Group Conversations Feature

## Overview
Enhanced the chat system to automatically show teacher's students and groups, with auto-creation of group conversations.

## What Changed

### Backend Changes

#### 1. ChatService.js
- **Modified `getContacts()`**: Now returns `{ contacts: [], groups: [] }`
  - Students: Get teacher + classmates + their group
  - Teachers: Get all students + teachers + admins + their groups
  - Admins: Get all users + all groups
  
- **Added `initializeTeacherGroupConversations(teacherId)`**: 
  - Auto-creates group conversations for teacher's groups
  - Participants: teacher + all students in each group
  - Skips if conversation already exists
  
- **Added `initializeAdminGroupConversations(adminId)`**:
  - Auto-creates group conversations for ALL groups
  - Participants: teacher + all students + admin
  - Skips if conversation already exists

#### 2. ChatController.js
- **Modified `getContacts()`**: Returns new format with contacts and groups
- **Added `initializeGroupConversations()`**: Handles POST /chat/initialize-groups

#### 3. chatRoutes.js
- **Added route**: `POST /chat/initialize-groups` (teachers/admins only)

### Frontend Changes

#### 1. useChatContacts.ts Hook
```typescript
// Now returns:
{
  contacts: Contact[],  // Individual users
  groups: Group[],      // Teacher's groups or student's group
  loading: boolean,
  error: string | null
}
```

#### 2. useGroupConversations.ts Hook (NEW)
```typescript
// New hook for initializing group conversations
{
  initializeGroupConversations: () => Promise<any>,
  loading: boolean,
  error: string | null
}
```

#### 3. ChatSidebar.tsx Component
- **Added two-tab view**:
  - "المحادثات" tab: Shows existing conversations
  - "جهات الاتصال" tab: Shows contacts + groups
- **Groups section**: Displays teacher's groups with green avatars
- **Contacts section**: Displays individual users
- **Click to start chat**: Opens conversation when clicking contact/group

#### 4. ChatLayout.tsx Component
- **Auto-initialization**: Automatically calls `initializeGroupConversations()` when teacher/admin opens chat
- **Refresh**: Re-fetches conversations after initialization
- **New chat handling**: `handleStartNewChat()` opens existing or creates temporary conversation

## How It Works

### For Teachers:
1. Teacher opens chat page
2. System auto-calls `POST /chat/initialize-groups`
3. Creates conversations for all teacher's groups
4. Teacher sees:
   - In "المحادثات" tab: All their conversations (DM + group chats)
   - In "جهات الاتصال" tab: All students, teachers, admins, and their groups

### For Admins:
1. Admin opens chat page
2. System auto-calls `POST /chat/initialize-groups`
3. Creates conversations for ALL groups in system
4. Admin is added as participant to each group
5. Admin sees:
   - In "المحادثات" tab: All conversations (can monitor all groups)
   - In "جهات الاتصال" tab: All users and all groups

### For Students:
1. Student opens chat page
2. No initialization needed (students don't create groups)
3. Student sees:
   - In "المحادثات" tab: Their conversations (teacher DM + group chat)
   - In "جهات الاتصال" tab: Teacher, classmates, and their group

## API Usage

### Get Contacts with Groups
```bash
GET /api/chat/contacts
Authorization: Bearer <token>

Response:
{
  "contacts": [
    { "_id": "...", "firstName": "محمد", "role": "student", ... }
  ],
  "groups": [
    { "_id": "...", "name": "الحلقة الأولى", "description": "...", ... }
  ]
}
```

### Initialize Group Conversations
```bash
POST /api/chat/initialize-groups
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Created 3 group conversations",
  "conversations": [
    { "conversationId": "...", "groupName": "الحلقة الأولى", "participantsCount": 12 }
  ]
}
```

## User Experience

### Teacher View:
1. Opens chat
2. Sees all their groups automatically created as conversations
3. Can click on any group to send messages to all students
4. Can start DM with individual students
5. Can chat with other teachers and admins

### Admin View:
1. Opens chat
2. Sees ALL groups in system
3. Can monitor and participate in any group conversation
4. Can chat with any user (students, teachers, other admins)

### Student View:
1. Opens chat
2. Sees their group conversation
3. Can chat with teacher
4. Can chat with classmates in same group

## Files Modified

### Backend:
- `Backend/src/services/ChatService.js`
- `Backend/src/controllers/ChatController.js`
- `Backend/src/routes/ChatRoutes/chatRoutes.js`
- `Backend/CHAT_API_DOCS.md`
- `Backend/CHAT_GROUP_INIT_EXAMPLE.md` (NEW)

### Frontend:
- `Frontend/src/pages/chat/hooks/useChatContacts.ts`
- `Frontend/src/pages/chat/hooks/useGroupConversations.ts` (NEW)
- `Frontend/src/pages/chat/components/ChatSidebar.tsx`
- `Frontend/src/pages/chat/components/ChatLayout.tsx`

## Testing

### Test Teacher Flow:
1. Login as teacher
2. Navigate to /chat
3. Check console: should see "Created X group conversations"
4. Check "جهات الاتصال" tab: should see all groups
5. Click a group: should open group conversation
6. Send message: all students should receive

### Test Admin Flow:
1. Login as admin
2. Navigate to /chat
3. Check "جهات الاتصال" tab: should see ALL groups
4. Should be able to participate in any group

### Test Student Flow:
1. Login as student
2. Navigate to /chat
3. Check "جهات الاتصال" tab: should see their group
4. Should see teacher and classmates

## Notes

- Group conversations are created once and reused
- If conversation exists, it won't be recreated
- Teacher can message all students in group at once
- Students see group messages in real-time
- Admin has full access to all groups for monitoring
- Role-based permissions still enforced (students can only see their group)
