# Arrangement Page Structure 📊

This document describes the modular structure of the Arrangement (Ranking) page.

## 📁 Folder Structure

```
Arrangement/
├── types/
│   └── arrangement.ts          # TypeScript interfaces
├── utils/
│   └── arrangementHelpers.ts   # Helper functions
├── hooks/
│   └── useRankingData.ts       # Custom hook for data fetching
├── components/
│   ├── SocketIndicator.tsx     # Socket connection indicator
│   ├── FilterPanel.tsx         # Year/Month/Group filters
│   ├── PageHeader.tsx          # Page title and period display
│   ├── Podium.tsx              # Olympic-style top 3 podium
│   ├── RankingTable.tsx        # All students ranking table
│   ├── EmptyState.tsx          # No data state
│   └── CriteriaCards.tsx       # Ranking criteria cards
└── ArrangementPage.tsx         # Main orchestrator component
```

## 🎯 Components Overview

### 1. **Types** (`types/arrangement.ts`)

- `StudentWithAverage`: Student data with averages
- `Group`: Group information
- `User`: User authentication data
- Component Props interfaces

### 2. **Utils** (`utils/arrangementHelpers.ts`)

Helper functions for:

- `getFullName()`: Format student full name
- `getMonthName()`: Convert month number to Arabic name
- `getMedalColor()`: Get medal color by rank (Gold/Silver/Bronze)
- `generateAvailableYears()`: Generate years array
- `getCurrentPeriod()`: Get current month/year
- `formatAverage()`: Format average with 1 decimal place

### 3. **Hooks** (`hooks/useRankingData.ts`)

Custom hook for data management:

- Fetches ranking data from API
- Handles loading and error states
- Auto-refetches on dependency changes
- Returns: `{ students, loading, error, refetch }`

### 4. **Components**

#### SocketIndicator

- Shows real-time connection status
- Only visible in development mode
- Displays Socket ID and last update time

#### FilterPanel

- Year selector (current year - 5 years)
- Month selector (1-12)
- Group selector (for teachers with multiple groups)
- Fixed group display (for students and single-group teachers)

#### PageHeader

- Page title and description
- Current period badge with student count
- AOS animations

#### Podium

- Olympic-style podium for top 3 students
- Gold/Silver/Bronze medals
- Different heights for each position
- Student name and average display

#### RankingTable

- All students in table format
- Columns: Rank, Student, Overall Average, Memorization Average, Review Average, Total Marks
- Top 3 highlighted with emerald background
- Medal colors for ranks

#### EmptyState

- Shows when no students have averages
- Custom message with current month/year
- Icon and styled card

#### CriteriaCards

- 3 cards explaining ranking criteria:
  1. Memorization (حفظ)
  2. Review (مراجعة)
  3. Overall Average (معدل إجمالي)
- Icons and descriptions

### 5. **Main Page** (`ArrangementPage.tsx`)

Orchestrator component that:

- Manages user authentication via localStorage
- Handles Socket connection for real-time updates
- Manages year/month/group selection
- Fetches and displays ranking data
- Initializes AOS animations

## 🔄 Data Flow

```
ArrangementPage
    ↓
useRankingData (hook)
    ↓
getRankingByAverages (API)
    ↓
Display Components (Podium, Table, etc.)
```

## 🎨 Features

1. **Real-time Updates**: Socket integration for live data refresh
2. **Role-based Display**:
   - Students: See their own group only
   - Teachers: Select from their groups
   - Admins: See all groups
3. **Responsive Design**: Mobile-friendly layout
4. **Animations**: AOS library for smooth transitions
5. **Medal System**: Gold/Silver/Bronze for top 3
6. **Olympic Podium**: Visual ranking display
7. **Period Selection**: Year and month filters
8. **Empty States**: Handled gracefully

## 🛠️ Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- AOS (Animate On Scroll)
- Socket.io (real-time updates)
- Custom Hooks

## 📝 Usage Example

```tsx
import Arrangement from "./pages/Arrangement";

// In your router
<Route path="/arrangement" element={<Arrangement />} />;
```

## 🔧 Customization

### Change Medal Colors

Edit `getMedalColor()` in `utils/arrangementHelpers.ts`:

```typescript
export const getMedalColor = (rank: number): string => {
  if (rank === 1) return "#FFD700"; // Gold
  if (rank === 2) return "#C0C0C0"; // Silver
  if (rank === 3) return "#CD7F32"; // Bronze
  return "#E5E7EB"; // Gray
};
```

### Modify Year Range

Edit `generateAvailableYears()` in `utils/arrangementHelpers.ts`:

```typescript
export const generateAvailableYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    // Change range here
    years.push(i);
  }
  return years;
};
```

## 🐛 Troubleshooting

### Socket Not Connecting

- Check `useArrangementSocket()` hook is properly initialized
- Verify Socket server is running
- Check browser console for connection errors

### Data Not Loading

- Verify API endpoint is correct
- Check user authentication token
- Ensure group permissions are set correctly

### No Students Displayed

- Check if marks exist for selected month/year
- Verify group filter is correct
- Check API response in network tab

## 📚 Related Files

- API: `Frontend/src/Api/rankingApi.ts`
- Socket: `Frontend/src/Socket/index.ts`
- Backend: `Backend/src/controllers/RankingController/`
- Routes: `Backend/src/routes/rankingRoutes.js`

---

**Created**: December 2024  
**Pattern**: Modular Component Architecture  
**Similar Pages**: Warnings, Test
