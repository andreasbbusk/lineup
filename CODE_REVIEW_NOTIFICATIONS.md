# Code Review: Notifications Feature

## 🔴 Critical Issues

### 1. **Bug: `getUnreadCount()` Returns Wrong Value**
**Location:** `frontend/app/modules/features/notifications/api.ts:49-74`

**Issue:** The function only returns `1` or `0`, not the actual count. The comment even says "A proper count endpoint would be better."

**Impact:** The notification badge will show "1" even when there are multiple unread notifications.

**Fix:** Either:
- Create a proper count endpoint on the backend
- Or fix the frontend to actually count all notifications (it already fetches them)

### 2. **Missing Database Function**
**Location:** `backend/src/entities/notifications/notifications.service.ts:259`

**Issue:** Code calls `authedSupabase.rpc("delete_notification", ...)` but the SQL function file was deleted.

**Impact:** Delete operations will fail.

**Fix:** Recreate the SQL function or use an alternative approach.

## ⚠️ High Priority Issues

### 3. **Code Duplication: Sorting Logic**
**Location:** `frontend/app/modules/features/notifications/components/notifications-page.tsx`

**Issue:** The same sorting logic is repeated 4 times (lines 38-42, 52-56, 62-65, 71-74):
```typescript
.sort((a, b) => {
  const dateA = new Date(a.createdAt).getTime();
  const dateB = new Date(b.createdAt).getTime();
  return dateB - dateA;
})
```

**Fix:** Extract to a utility function:
```typescript
const sortByCreatedAtDesc = (a: NotificationResponse, b: NotificationResponse) => {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};
```

### 4. **Inconsistent Query Invalidation**
**Location:** Multiple files

**Issue:** 
- `useMarkAsRead` uses `exact: false` implicitly (line 23, 35)
- `useDeleteNotification` explicitly uses `exact: false` (lines 104, 110, 120, 176)
- Other mutations use `exact: false` inconsistently

**Fix:** Standardize on `exact: false` for all notification query invalidations.

### 5. **Console.log in Production Code**
**Locations:**
- `frontend/app/modules/features/notifications/api.ts` (lines 112, 123, 132, 138, 145, 151)
- `frontend/app/modules/features/notifications/hooks/useNotificationMutations.ts` (lines 155, 164)
- `backend/src/entities/notifications/notifications.service.ts` (lines 264, 272, 282, 294)

**Issue:** Debug logging should not be in production code.

**Fix:** 
- Remove or wrap in `if (process.env.NODE_ENV === 'development')`
- Use a proper logging library for backend

### 6. **Missing Error User Feedback**
**Location:** `frontend/app/modules/features/notifications/components/notification-item.tsx:105-108`

**Issue:** Errors are only logged to console, users don't see feedback.

**Fix:** Add toast/notification for user-facing errors.

## 🔵 Medium Priority Issues

### 7. **Performance: Unnecessary Date Parsing**
**Location:** `frontend/app/modules/features/notifications/components/notifications-page.tsx`

**Issue:** `new Date().getTime()` is called multiple times for the same notifications during sorting.

**Fix:** Memoize sorted arrays or parse dates once.

### 8. **Performance: `getUnreadCount()` Fetches All Notifications**
**Location:** `frontend/app/modules/features/notifications/api.ts:49-74`

**Issue:** Fetches all unread notifications just to count them. The backend should provide a count endpoint.

**Fix:** Create `/notifications/count` endpoint that returns just the count.

### 9. **Type Safety: Optional Chaining Overuse**
**Location:** Multiple files

**Issue:** Some places use optional chaining where the value should be guaranteed.

**Example:** `notification.id` is checked but then used with `!` assertion later.

**Fix:** Add proper type guards or assertions.

### 10. **Missing Error Boundary**
**Location:** Notification components

**Issue:** No error boundary to catch and display errors gracefully.

**Fix:** Add React error boundary around notification components.

## 🟢 Low Priority / Optimization Opportunities

### 11. **Consolidate Query Key Constants**
**Location:** Multiple files

**Issue:** Query keys like `["notifications"]` are hardcoded in multiple places.

**Fix:** Create constants:
```typescript
export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  grouped: (unreadOnly?: boolean) => ["notifications", "grouped", unreadOnly] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};
```

### 12. **Extract Optimistic Update Logic**
**Location:** `frontend/app/modules/features/notifications/hooks/useNotificationMutations.ts`

**Issue:** Similar optimistic update patterns in `useMarkAsRead` and `useDeleteNotification`.

**Fix:** Extract common logic to helper functions.

### 13. **Backend: Remove Debug Logging**
**Location:** `backend/src/entities/notifications/notifications.service.ts`

**Issue:** Console.log statements should use proper logging.

**Fix:** Use a logging library (e.g., winston, pino) or at least wrap in environment check.

### 14. **Inconsistent Error Handling in Mutations**
**Location:** Various mutation hooks

**Issue:** Some mutations have `onError` callbacks, others don't. Some rollback, others don't.

**Fix:** Standardize error handling pattern across all mutations.

### 15. **Type Safety: Notification Type Guards**
**Location:** `frontend/app/modules/features/notifications/components/notifications-page.tsx:84`

**Issue:** Runtime check for `entityId` with console.error, but no type narrowing.

**Fix:** Use TypeScript type guards for better type safety.

## 📋 Summary

**Critical:** 2 issues (must fix)
**High Priority:** 4 issues (should fix soon)
**Medium Priority:** 3 issues (nice to have)
**Low Priority:** 5 issues (optimization)

**Total Issues Found:** 14

## Recommended Action Plan

1. **Immediate:** Fix `getUnreadCount()` bug and recreate database function
2. **This Sprint:** Remove console.logs, add error feedback, consolidate sorting
3. **Next Sprint:** Performance optimizations, type safety improvements
4. **Backlog:** Error boundaries, query key constants, logging library


