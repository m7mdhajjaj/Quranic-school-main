# Chat Controller

## 📁 File Structure

```
chatController/
├── index.js              # Main entry point - exports all functions
├── message.controller.js # Message operations (get, create, mark as read)
└── user.controller.js    # User operations (get teachers/students)
```

## 📝 Functions

### Message Controller (`message.controller.js`)
- **getUserMessages**: Get all messages for a specific user
- **getGroupMessages**: Get group messages for a specific group
- **getConversation**: Get conversation between two users
- **createMessage**: Create a new message (direct or group)
- **markAsRead**: Mark messages as read
- **getUnreadCount**: Get unread message count for a user

### User Controller (`user.controller.js`)
- **getTeachers**: Get all teachers for a student to chat with
- **getStudents**: Get all students for a teacher

## 🔄 Import Usage

```javascript
const chatController = require('./controllers/chatController');

// All functions are available through chatController
chatController.getUserMessages();
chatController.createMessage();
chatController.getTeachers();
```

## ✅ Benefits of This Structure
- **Separation of Concerns**: Message operations separate from user operations
- **Easy Maintenance**: Each file has a clear, focused responsibility
- **Scalability**: Easy to add new features without cluttering files
- **Consistent**: Follows the same pattern as other controllers in the project
