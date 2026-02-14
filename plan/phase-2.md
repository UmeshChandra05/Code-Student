# Phase 2: Strict API Compliance Verification & Fixes

**Module:** code-mastery-suite  
**Date:** February 13, 2026  
**Status:** CRITICAL ISSUES FOUND - REQUIRES FIXES

---

## 🚨 CRITICAL VIOLATIONS FOUND

### ❌ VIOLATION 1: FALLBACK_LANGUAGES (HARDCODED DATA)

**Location:** `src/pages/ProblemDetailPage.tsx` lines 48-63

**Code:**
```typescript
const FALLBACK_LANGUAGES: Language[] = [
  { id: "javascript", name: "JavaScript", value: "javascript", version: "Node.js 18", isActive: true },
  { id: "python", name: "Python", value: "python", version: "3.10", isActive: true },
  // ... more hardcoded languages
];
```

**Usage (Line 130):**
```typescript
return active.length > 0 ? active : FALLBACK_LANGUAGES;
```

**Violation:** 
- Uses hardcoded fallback language list
- Violates: "NO FALLBACK POLICY - If API fails → show proper error. DO NOT fallback to dummy data"
- Violates: "Languages MUST come dynamically from API ONLY"

**Required Fix:**
- Remove FALLBACK_LANGUAGES completely
- If API returns no languages OR fails, show proper error
- DO NOT allow any hardcoded language list

---

### ⚠️ ISSUE 2: Languages API Response Format NOT DOCUMENTED

**API Documentation:** Section 14.1 shows:
```
GET /api/student/coding/languages
Auth: Bearer {{STUDENT_TOKEN}}
```

**Problem:** NO response format example provided in documentation!

**Current Code Handles Multiple Formats:**
```typescript
const rawLangs = (() => {
  if (!languagesData) return [];
  if (Array.isArray(languagesData)) return languagesData;
  const nested = languagesData?.data?.languages || languagesData?.languages
    || languagesData?.data || languagesData?.items;
  if (Array.isArray(nested)) return nested;
  return [];
})();
```

**Question for Clarification:**
What is the EXACT response format from `/api/student/coding/languages`?

Expected formats could be:
1. `{ success: true, data: [languages] }`
2. `{ success: true, data: { languages: [languages] } }`
3. Direct array: `[languages]`
4. Other?

**What is the structure of each language object?**
- `{ id, name, value, version, isActive }`?
- `{ id, name, slug, version, active }`?
- Other?

**Action:** NEED CLARIFICATION BEFORE PROCEEDING

---

### ✅ Monaco Editor Integration - VERIFIED CORRECT

**Location:** `src/pages/ProblemDetailPage.tsx` lines 520-550

**Uses:** `@monaco-editor/react` (Official React wrapper)

**Configuration:**
```typescript
<Editor
  height="100%"
  language={MONACO_LANGUAGE_MAP[language] || language}
  value={code}
  onChange={(v) => setCode(v || "")}
  theme="vs-dark"
  options={{
    fontSize,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    fontLigatures: true,
    minimap: { enabled: true, scale: 1 },
    // ... IntelliSense enabled
    // ... Syntax highlighting enabled
    // ... All required features enabled
  }}
/>
```

**Features Verified:**
- ✅ Monaco Editor properly integrated
- ✅ IntelliSense enabled via `quickSuggestions: true`
- ✅ Syntax highlighting via language prop
- ✅ Theme matching (vs-dark)
- ✅ Language switching support
- ✅ Font size controls
- ✅ Proper options configuration
- ✅ No blank state issues

**Language Mapping:**
```typescript
const MONACO_LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  go: "go",
  // ... etc
};
```

**Status:** ✅ CORRECT - No changes needed

---

## 📋 API Endpoint Verification

### Run Code Endpoint

**API Documentation (Section 10.3):**
```
POST /api/student/coding/problems/{{PROBLEM_ID}}/run
Body: {
  "code": "<code>",
  "language": "javascript",
  "customInput": "..." // optional
}
```

**Current Implementation:**
```typescript
export const runCode = async (problemId: string, code: string, language: string, customInput?: string) => {
  return fetchAPI(`/api/student/coding/problems/${problemId}/run`, {
    method: 'POST',
    data: {
      code,
      language,
      ...(customInput && { customInput }),
    },
  });
};
```

**Usage in Component:**
```typescript
const runMutation = useMutation({
  mutationFn: () => runCode(id!, code, language),
  onSuccess: (data) => {
    const results = data?.results || data?.data?.results || data?.testResults || [];
    // ...
  }
});
```

**Status:** ✅ CORRECT - Matches API documentation

**Question:** What is the EXACT response format for runCode?
- Is it `{ success, data: { results: [...] } }`?
- Or direct: `{ results: [...] }`?
- Or other?

---

### Submit Code Endpoint

**API Documentation (Section 10.4):**
```
POST /api/student/coding/problems/{{PROBLEM_ID}}/submit
Body: {
  "code": "<code>",
  "language": "python",
  "contestId": "..." // optional
}
```

**Current Implementation:**
```typescript
export const submitCode = async (problemId: string, code: string, language: string, contestId?: string) => {
  return fetchAPI(`/api/student/coding/problems/${problemId}/submit`, {
    method: 'POST',
    data: {
      code,
      language,
      ...(contestId && { contestId }),
    },
  });
};
```

**Status:** ✅ CORRECT - Matches API documentation

**Question:** What is the EXACT response format for submitCode?
- Expected: `{ success, data: { submissionId, status, results, testCasesPassed, totalTestCases } }`?
- Or other?

---

## 🔧 REQUIRED FIXES

### Fix 1: Remove FALLBACK_LANGUAGES

**File:** `src/pages/ProblemDetailPage.tsx`

**Changes Required:**

1. **Remove hardcoded FALLBACK_LANGUAGES** (lines 48-63)

2. **Replace language list logic** (lines 121-131):

**BEFORE:**
```typescript
const languages: Language[] = (() => {
  const normalized = rawLangs.map(normalizeLanguage).filter(Boolean) as Language[];
  const active = normalized.filter(l => l.isActive);
  return active.length > 0 ? active : FALLBACK_LANGUAGES;
})();
```

**AFTER:**
```typescript
const languages: Language[] = (() => {
  const normalized = rawLangs.map(normalizeLanguage).filter(Boolean) as Language[];
  const active = normalized.filter(l => l.isActive);
  return active;
})();
```

3. **Add proper error handling when no languages:**

```typescript
// Show error if no languages available
if (languages.length === 0 && !isLoadingLanguages) {
  return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <div className="text-center">
        <p className="text-lg font-semibold">No Programming Languages Available</p>
        <p className="text-sm text-muted-foreground mt-1">
          Unable to load supported languages. Please contact administrator.
        </p>
      </div>
    </div>
  );
}
```

---

### Fix 2: Add Comprehensive Logging

**Location:** `src/pages/ProblemDetailPage.tsx`

Add logging for:
- Language API call result
- Run code API call
- Submit code API call
- Each response structure

```typescript
// After language fetch
useEffect(() => {
  console.log('[ProblemDetailPage] Languages data received:', {
    raw: languagesData,
    processed: rawLangs,
    normalized: languages,
    count: languages.length
  });
}, [languagesData, languages]);

// In runMutation onSuccess
onSuccess: (data) => {
  console.log('[ProblemDetailPage] Run code response:', data);
  // ... existing code
}

// In submitMutation onSuccess
onSuccess: (data) => {
  console.log('[ProblemDetailPage] Submit code response:', data);
  // ... existing code
}
```

---

## ❓ CLARIFICATION NEEDED

Before proceeding with fixes, need clarification on:

### 1. Languages API Response Format
```
GET /api/student/coding/languages
```

**Question:** What is the EXACT response structure?

**Options:**
A) `{ success: true, message: "...", data: [{ id, name, value, version, isActive }, ...] }`
B) `{ success: true, data: { languages: [...] } }`
C) Direct array: `[{ id, name, value, version, isActive }, ...]`
D) Other format?

**Language Object Structure:**
- Confirmed fields: `id`, `name`, `value`, `version`, `isActive`?
- Or different field names?

---

### 2. Run Code Response Format
```
POST /api/student/coding/problems/:id/run
```

**Question:** What is the EXACT response structure?

**Options:**
A) `{ success: true, data: { results: [{ input, expectedOutput, actualOutput, passed, executionTime, error }] } }`
B) `{ results: [...] }`
C) `{ testResults: [...] }`
D) Other?

---

### 3. Submit Code Response Format
```
POST /api/student/coding/problems/:id/submit
```

**Question:** What is the EXACT response structure?

**Expected:**
```json
{
  "success": true,
  "data": {
    "submissionId": "...",
    "status": "ACCEPTED | WRONG_ANSWER | ...",
    "results": [...],
    "testCasesPassed": 5,
    "totalTestCases": 5,
    "executionTime": 123,
    "memoryUsed": 45
  }
}
```

Is this correct or different?

---

## 🎯 Next Steps

1. **AWAIT CLARIFICATION** on API response formats
2. **Remove FALLBACK_LANGUAGES** immediately
3. **Add proper error handling** for missing languages
4. **Add comprehensive logging** for debugging
5. **Test with real backend** to verify response structures
6. **Update phase-2.md** with findings

---

## 📝 Phase 2 Checklist

### Critical Fixes
- [ ] Remove FALLBACK_LANGUAGES hardcoded array
- [ ] Add proper error handling when languages API fails
- [ ] Add logging for language API responses
- [ ] Verify language object structure matches API
- [ ] Test language switching works correctly

### API Response Verification Needed
- [ ] Get exact languages API response format
- [ ] Get exact run code API response format
- [ ] Get exact submit code API response format
- [ ] Update code to match EXACT formats
- [ ] Remove all response format guessing

### Testing Required
- [ ] Test with backend running
- [ ] Verify languages load correctly
- [ ] Verify run code works correctly
- [ ] Verify submit code works correctly
- [ ] Verify proper errors shown when API fails

---

**WAITING FOR CLARIFICATION ON API RESPONSE FORMATS BEFORE PROCEEDING**

**Status:** ⏸️ PAUSED - Need API response format confirmation
