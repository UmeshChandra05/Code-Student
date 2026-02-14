# Required Endpoints — Student Module (`code-mastery-suite`)

> Audit of all student-facing API endpoints from `coding-platform-api-endpoints.md` against the current student UI.
> Organized by: **✅ Used** (has UI) | **⚠️ Available but No Dedicated UI** | **🔧 Enhancement Opportunities**

---

## Endpoint Coverage Summary

| Category | Total Endpoints | Used in UI | No UI Yet |
|----------|:-:|:-:|:-:|
| Authentication | 1 | 1 | 0 |
| Problems | 2 | 2 | 0 |
| Code Execution | 2 | 2 | 0 |
| Bookmarks | 3 | 3 | 0 |
| Progress & Submissions | 3 | 3 | 0 |
| Contests | 6 | 6 | 0 |
| Languages | 1 | 1 | 0 |
| **Totals** | **18** | **18** | **0** |

> All 18 student endpoints are mapped in the API layer **and** used in the UI. No orphaned endpoints.

---

## ✅ Endpoints Currently Used

### Authentication
| Method | Endpoint | UI Location |
|--------|----------|-------------|
| `POST` | `/api/student/login` | `LoginPage.tsx` — Login form |

### Problems
| Method | Endpoint | UI Location |
|--------|----------|-------------|
| `GET` | `/api/student/coding/problems` | `ProblemsPage.tsx` — Problem list, `DashboardPage.tsx` — Continue Solving |
| `GET` | `/api/student/coding/problems/:id` | `ProblemDetailPage.tsx` — Full problem + code editor |

### Code Execution
| Method | Endpoint | UI Location |
|--------|----------|-------------|
| `POST` | `/api/student/coding/problems/:id/run` | `ProblemDetailPage.tsx` — "Run Code" button |
| `POST` | `/api/student/coding/problems/:id/submit` | `ProblemDetailPage.tsx` — "Submit" button |

### Bookmarks
| Method | Endpoint | UI Location |
|--------|----------|-------------|
| `POST` | `/api/student/coding/bookmarks/:problemId` | `ProblemDetailPage.tsx` — Bookmark button |
| `DELETE` | `/api/student/coding/bookmarks/:problemId` | `BookmarksPage.tsx` — Remove, `ProblemDetailPage.tsx` — Unbookmark |
| `GET` | `/api/student/coding/bookmarks` | `BookmarksPage.tsx` — Bookmarks list |

### Progress & Submissions
| Method | Endpoint | UI Location |
|--------|----------|-------------|
| `GET` | `/api/student/coding/my-progress` | `ProgressPage.tsx` — Stats + breakdown, `DashboardPage.tsx` — Quick stats |
| `GET` | `/api/student/coding/my-submissions` | `SubmissionsPage.tsx` — Submissions table, `ProblemDetailPage.tsx` — Submissions tab |
| `GET` | `/api/student/coding/my-submissions/:id` | `SubmissionDetailPage.tsx` — Full submission detail |

### Contests
| Method | Endpoint | UI Location |
|--------|----------|-------------|
| `GET` | `/api/student/coding/contests` | `ContestsPage.tsx` — Contest list |
| `GET` | `/api/student/coding/contests/active` | `DashboardPage.tsx` — Active contests |
| `GET` | `/api/student/coding/contests/:id` | `ContestDetailPage.tsx` — Contest detail + problems + leaderboard |
| `POST` | `/api/student/coding/contests/:id/register` | `ContestsPage.tsx` — Register button, `ContestDetailPage.tsx` — Register button |
| `GET` | `/api/student/coding/contests/:id/leaderboard` | `ContestDetailPage.tsx` — Leaderboard tab |
| `GET` | `/api/student/coding/my-contests` | `MyContestsPage.tsx` — My registered contests |

### Languages
| Method | Endpoint | UI Location |
|--------|----------|-------------|
| `GET` | `/api/student/coding/languages` | `ProblemDetailPage.tsx` — Language selector |

---

## ⚠️ Endpoints with No Dedicated UI

**None** — All 18 student endpoints have corresponding UI implementations.

---

## 🔧 Enhancement Opportunities

### 1. Problem Filtering & Search Enhancements
**Priority:** Medium
- **Module-based filtering**: The `getProblems` API supports `moduleId` and `tagId` query params, but the UI only filters by `difficulty` and `status`. Add:
  - Module dropdown filter
  - Tag multi-select filter
  - Server-side search via the `search` param (currently client-side only)
  - Pagination controls (API supports `page` + `limit`)

### 2. Custom Input for Code Execution
**Priority:** Medium
- The `runCode` API supports a `customInput` parameter, but the UI has no text area for entering custom test input
- Add a "Custom Input" tab next to "Test Cases" in the code editor panel

### 3. Contest Submission Flow
**Priority:** High
- When solving problems **during a contest**, the `submitCode` API accepts a `contestId` parameter
- Currently there's no *explicit* contest-mode problem-solving flow — students navigate from `ContestDetailPage → /problems/:id` but the `contestId` is **not passed** to the submit API
- **Fix needed:** Thread `contestId` through the problem detail page (via URL param or context) so submissions during a contest are properly tracked

### 4. Submissions Filtering
**Priority:** Low
- The `getMySubmissions` API supports `problemId` and `status` filters, but `SubmissionsPage.tsx` fetches all without pagination or filters
- Add:
  - Status filter dropdown
  - Problem search/filter
  - Pagination

### 5. Leaderboard Pagination
**Priority:** Low
- `getContestLeaderboard` supports `page` and `limit` params
- Currently fetches all entries without pagination
- Add pagination for large contests

### 6. Bookmark Pagination
**Priority:** Low
- `getBookmarks` supports `page` and `limit` params
- Currently fetches all bookmarks without pagination

### 7. Student Profile / Settings
**Priority:** Medium — **No endpoints exist for this yet**
The module currently lacks:
- Profile viewing/editing
- Password change
- Notification preferences
- Theme settings (dark/light stored server-side)

> **Note:** These endpoints would need to be added to the backend first.

### 8. Contest Problem Solving UX
**Priority:** High
When a student enters a LIVE contest, the flow should:
- Show a timer counting down to contest end
- Navigate to problems within the contest context
- Track which problems are solved vs. unsolved in-contest
- Show real-time rank updates

Currently the contest detail page shows problems but clicking them navigates to the generic problem page without contest context.

### 9. Progress Page Enhancements
**Priority:** Medium
- Streak tracking (requires backend: `currentStreak`, `longestStreak`)
- Topic/tag-based progress breakdown
- Comparison with other students (percentile)
- Achievement badges/milestones

### 10. Keyboard Shortcuts
**Priority:** Low
- `Ctrl+Enter` → Run code
- `Ctrl+Shift+Enter` → Submit code
- `Ctrl+S` → Save bookmark
- `Ctrl+B` → Toggle sidebar
