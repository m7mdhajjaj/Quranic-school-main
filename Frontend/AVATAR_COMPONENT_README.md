# Reusable Avatar Component

A flexible and reusable Avatar component that supports different sizes, genders, loading states, and interactive features.

## Features

- **Multiple Sizes**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- **Gender-based Theming**: Different color schemes for male/female users
- **Loading State**: Built-in skeleton loading animation
- **Fallback Support**: Shows user initials or custom icon when no image
- **Interactive**: Supports clickable avatars and edit functionality
- **Accessibility**: Full ARIA support and keyboard navigation
- **Customizable**: Border styles, custom classes, and more

## Usage

### Basic Usage

```tsx
import Avatar from './components/Avatar';

// Simple avatar with image
<Avatar
  src="path/to/image.jpg"
  userName="أحمد محمد"
  size="md"
/>

// Avatar with fallback (shows initials)
<Avatar
  userName="فاطمة علي"
  gender="female"
  size="lg"
/>
```

### Header Usage (Small)

```tsx
<Avatar
  src={avatarUrl}
  userName={user.firstName}
  gender={userGender}
  size="md"
  clickable={true}
  onClick={handleProfileClick}
/>
```

### Profile Page Usage (Large)

```tsx
<Avatar
  src={avatarUrl}
  previewSrc={avatarFile ? URL.createObjectURL(avatarFile) : null}
  userName={user.firstName}
  gender={getUserGender(user)}
  size="3xl"
  border="ring"
  showEditButton={isEditing}
  onEditClick={() => document.getElementById('avatar-input')?.click()}
/>
```

### Modal Usage

```tsx
<Avatar
  src={user.imageUrl}
  userName={user.firstName}
  gender={getUserGender(user)}
  size="2xl"
  border="thick"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| null` | - | Avatar image URL |
| `previewSrc` | `string \| null` | - | Alternative image for preview (editing) |
| `alt` | `string` | `'صورة المستخدم'` | Alt text for the image |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'md'` | Size of the avatar |
| `userName` | `string` | - | User's name for fallback initial |
| `gender` | `'male' \| 'female'` | `'male'` | User's gender for color theming |
| `loading` | `boolean` | `false` | Whether to show loading state |
| `clickable` | `boolean` | `false` | Whether the avatar is clickable |
| `onClick` | `() => void` | - | Click handler |
| `className` | `string` | `''` | Additional CSS classes |
| `showEditButton` | `boolean` | `false` | Show camera edit button |
| `onEditClick` | `() => void` | - | Edit button click handler |
| `fallbackIcon` | `React.ReactNode` | - | Custom fallback icon |
| `border` | `'none' \| 'thin' \| 'thick' \| 'ring'` | `'thick'` | Border style |

## Size Reference

- `xs`: 24px (6 x 6)
- `sm`: 32px (8 x 8)
- `md`: 40px (10 x 10)
- `lg`: 48px (12 x 12)
- `xl`: 64px (16 x 16)
- `2xl`: 80px (20 x 20)
- `3xl`: 96px-112px (24 x 24 - 28 x 28, responsive)

## Accompanying Hook: useAvatar

The `useAvatar` hook provides avatar state management:

```tsx
import { useAvatar, getUserGender } from '../hooks/useAvatar';

const { avatarUrl, avatarLoading } = useAvatar({
  userId: user?._id,
  userRole: user?.role,
});

const userGender = getUserGender(user);
```

## Migration from Old Avatar Code

### Before (Header)

```tsx
// Old complex avatar rendering logic
const renderUserAvatar = () => {
  if (avatarLoading) return <AvatarSkeleton />;
  return (
    <button className="complex-classes...">
      {avatarUrl ? (
        <img src={avatarUrl} className="..." />
      ) : (
        <span>{initials}</span>
      )}
    </button>
  );
};
```

### After (Header)

```tsx
// Simple Avatar component usage
<Avatar
  src={avatarUrl}
  userName={currentUser?.firstName}
  gender={userGender}
  loading={avatarLoading}
  size="md"
  clickable={true}
  onClick={handleAvatarClick}
/>
```

### Before (Profile)

```tsx
// Old profile avatar with manual edit button
<div className="avatar-container">
  <div className="avatar-wrapper">
    {avatarFile ? (
      <img src={URL.createObjectURL(avatarFile)} />
    ) : avatarUrl ? (
      <img src={avatarUrl} />
    ) : (
      <UserIcon />
    )}
  </div>
  {isEditing && (
    <button onClick={handleEdit}>
      <Camera />
    </button>
  )}
</div>
```

### After (Profile)

```tsx
// Simplified with Avatar component
<Avatar
  src={avatarUrl}
  previewSrc={avatarFile ? URL.createObjectURL(avatarFile) : null}
  userName={user.firstName}
  gender={getUserGender(user)}
  size="3xl"
  border="ring"
  showEditButton={isEditing}
  onEditClick={handleEditClick}
/>
```

## Benefits

1. **Consistency**: Same avatar appearance across the entire app
2. **Maintainability**: Single component to maintain instead of multiple implementations
3. **Accessibility**: Built-in ARIA support and keyboard navigation
4. **Performance**: Optimized loading states and image handling
5. **Flexibility**: Easy to customize for different use cases
6. **Type Safety**: Full TypeScript support

## Files Modified

- `src/components/Avatar.tsx` (new)
- `src/hooks/useAvatar.ts` (new)
- `src/components/Header.tsx` (updated)
- `src/pages/Profile.tsx` (updated)
- `src/components/UserInfoModal.tsx` (updated)