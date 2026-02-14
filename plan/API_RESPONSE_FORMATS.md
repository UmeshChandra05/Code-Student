# API Response Formats - ACTUAL TESTED RESPONSES

**Date:** February 13, 2026  
**Source:** Real backend testing with live APIs  

---

## 🔐 Authentication

### Student Login
**POST** `/api/student/login`  
**Body:** `{ "username": "email@domain.com", "password": "password" }`

**Response Format:**
```json
{
  "success": true,
  "message": "Login Successful undefined",
  "data": {
    "user": {
      "studentId": "2172260001",
      "firstName": "User",
      "lastName": "",
      "email": "email@domain.com",
      "phoneNo": "1234567890",
      "groupId": "26G001",
      "xp": 10,
      "level": 1,
      "group": { "groupId": "...", "groupName": "...", ... },
      "enrollments": [ { "courseId": "C001", "title": "HTML", ... } ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "expiresAt": "2026-02-13T11:32:34.693Z"
  }
}
```

**Authentication Requirements:**
- **Authorization Header:** `Bearer <accessToken>`
- **Cookie:** `studentRefreshToken` (signed, HttpOnly, set automatically on login)
- ⚠️ **BOTH are required** for subsequent API calls!

---

## 💻 Languages API

### Get Supported Languages
**GET** `/api/student/coding/languages`  
**Headers:** `Authorization: Bearer <token>` + Cookie  

**Response Format:**
```json
{
  "success": true,
  "message": "Languages fetched",
  "data": [
    { "id": 45, "name": "Assembly (NASM 2.14.02)" },
    { "id": 46, "name": "Bash (5.0.0)" },
    { "id": 47, "name": "Basic (FBC 1.07.1)" },
    { "id": 50, "name": "C (GCC 9.2.0)" },
    { "id": 54, "name": "C++ (GCC 9.2.0)" },
    { "id": 51, "name": "C# (Mono 6.6.0.161)" },
    { "id": 60, "name": "Go (1.13.5)" },
    { "id": 62, "name": "Java (OpenJDK 13.0.1)" },
    { "id": 63, "name": "JavaScript (Node.js 12.14.0)" },
    { "id": 78, "name": "Kotlin (1.3.70)" },
    { "id": 68, "name": "PHP (7.4.1)" },
    { "id": 71, "name": "Python (3.8.1)" },
    { "id": 72, "name": "Ruby (2.7.0)" },
    { "id": 73, "name": "Rust (1.40.0)" },
    { "id": 81, "name": "Scala (2.13.2)" },
    { "id": 83, "name": "Swift (5.2.3)" },
    { "id": 74, "name": "TypeScript (3.7.4)" }
  ]
}
```

**Language Object Structure:**
```typescript
interface Language {
  id: number;     // Judge0 language ID
  name: string;   // Display name with version (e.g., "Python (3.8.1)")
}
```

**Total Languages:** 47 (as of test execution)

---

## 📝 Problems API

### Get All Problems
**GET** `/api/student/coding/problems`  
**Headers:** `Authorization: Bearer <token>` + Cookie  

**Response Format:**
```json
{
  "success": true,
  "message": "Problems fetched successfully",
  "data": {
    "problems": [
      {
        "id": "d7d46ef3-2ec9-4ff2-b425-f37a2b805469",
        "title": "Two Sum v2",
        "slug": "two-sum-v2",
        "difficulty": "EASY",
        "acceptedCount": 0,
        "submissionCount": 0,
        "module": {
          "id": "f80e15aa-b2b4-4b5a-94df-2e94370a36ec",
          "name": "Arrays"
        },
        "tags": [],
        "status": "UNSOLVED",
        "isBookmarked": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

**Problem Object:**
```typescript
interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  acceptedCount: number;
  submissionCount: number;
  module: { id: string; name: string } | null;
  tags: Array<any>;
  status: "UNSOLVED" | "ATTEMPTED" | "SOLVED";
  isBookmarked: boolean;
}
```

---

## 🔍 Frontend Implementation Requirements

### 1. Languages API ✅ TESTED
**Endpoint:** GET `/api/student/coding/languages`

**Frontend Adaptation Needed:**
- **Current Issue:** `FALLBACK_LANGUAGES` hardcoded array
- **Fix Required:** Remove fallback, use API data directly
- **Response Path:** `response.data.data` (array of languages)
- **Fields:** Each language has `{ id: number, name: string }`

**Frontend Code Changes:**
```typescript
// ❌ REMOVE THIS:
const FALLBACK_LANGUAGES = [ ... ];
const languages = active.length > 0 ? active : FALLBACK_LANGUAGES;

// ✅ USE THIS:
const languages = response.data.data;  // Direct array from API
// If empty or error, show proper error message, don't fallback!
```

### 2. Run Code API ⚠️ NOT TESTED YET

**Endpoint:** POST `/api/student/coding/problems/:problemId/run`  
**Body:** 
```json
{
  "code": "print('Hello')",
  "language": "python",
  "customInput": "optional custom input"  
}
```

**Expected Response Structure** (from code inspection):
```json
{
  "success": true,
  "message": "Code executed",
  "data": {
    "status": "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | ...,
    "passedCount": 2,
    "totalCount": 2,
    "runtime": 123,
    "memory": 5024,
    "testResults": [
      {
        "testCase": 1,
        "passed": true,
        "status": "ACCEPTED",
        "input": "...",
        "expectedOutput": "...",
        "actualOutput": "..."
      }
    ],
    "isCustomInput": false
  }
}
```

### 3. Submit Code API ⚠️ NOT TESTED YET

**Endpoint:** POST `/api/student/coding/problems/:problemId/submit`  
**Body:**
```json
{
  "code": "def solution(): ...",
  "language": "python",
  "contestId": "optional-contest-id"
}
```

**Expected Response Structure** (from code inspection):
```json
{
  "success": true,
  "message": "Code submitted successfully",
  "data": {
    "submissionId": "uuid",
    "status": "ACCEPTED" | "WRONG_ANSWER" | ...,
    "score": 100,
    "passedTestCases": 4,
    "totalTestCases": 4,
    "runtime": 245,
    "memory": 6144,
    "testResults": [
      {
        "testCase": 1,
        "passed": true,
        "status": "ACCEPTED"
        // Hidden test cases don't show input/output
      }
    ]
  }
}
```

---

## 📋 Action Items

### Critical Fixes Required:

1. **Remove FALLBACK_LANGUAGES** in `ProblemDetailPage.tsx` (lines 48-63)
   - Delete hardcoded array
   - Use API data directly from `response.data.data`
   - Add proper error handling if API returns empty/fails

2. **Fix Language Object Mapping**
   - API returns: `{ id: number, name: string }`
   - Frontend expects: Needs conversion to internal format
   - Create proper mapping function

3. **Handle Empty Language List**
   - Show error message: "Unable to load languages"
   - Disable editor until languages load
   - Add retry button

4. **Update Run/Submit Response Handling**
   - Verify exact response paths in actual testing
   - Update frontend to match exact structure
   - Handle all possible status codes

5. **Remove All Fallback Logic**
   - Search for any other fallback patterns
   - Replace with proper error states
   - Never show dummy data to users

---

## 🧪 Test Coverage

| Endpoint | Status | Response Documented |
|----------|--------|-------------------|
| Student Login | ✅ Tested | Yes - Complete |
| Admin Login | ✅ Tested | Yes - Complete |
| Get Languages | ✅ Tested | Yes - Complete |
| Get Problems | ✅ Tested | Yes - Complete |
| Get Problem Details | ❌ Not Tested | No - Need problem with test cases |
| Run Code | ❌ Not Tested | No - Need valid problem |
| Submit Code | ❌ Not Tested | No - Need valid problem |

**Next Steps:** Create test problem with test cases to test run/submit endpoints.

