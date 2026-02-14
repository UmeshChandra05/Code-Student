import axios from "axios";

// Base URL from environment variable or default
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - automatically add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("studentAccessToken");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log all requests for debugging
    console.log('[API Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization,
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('[API Response]', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    
    // Log error details
    console.error('[API Error]', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status,
      statusText: error.response?.statusText,
      message,
      fullError: error.response?.data,
      errorObject: error
    });

    // Handle auth failures - backend may return 400 or 401 for auth issues
    const isAuthError = status === 401 ||
      (status === 400 && (message.includes('Not Authorized') || message.includes('Session Expired')));

    if (isAuthError) {
      console.warn('[Auth Error] Clearing session and redirecting to login');
      // Unauthorized - clear token and redirect
      localStorage.removeItem("studentAccessToken");
      localStorage.removeItem("studentData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth - Student Login
export const studentLogin = async (email: string, password: string) => {
  try {
    console.log('[Student Login] Attempting login with email:', email);
    // Backend expects 'username' field (can be email or studentId)
    const response = await api.post("/api/student/login", {
      username: email,
      password
    });
    console.log('[Student Login] Login successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Student Login] Login failed:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.response?.data
    });
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      "Login failed"
    );
  }
};

// Types
export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  explanation?: string;
  timeLimit: number;
  memoryLimit: number;
  starterCode: string;
  solutionCode?: string;
  tags: Tag[];
  module?: Module;
  moduleId: string;
  isActive: boolean;
  testCases?: TestCase[];
  status?: 'UNSOLVED' | 'ATTEMPTED' | 'SOLVED';
  acceptance?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  isActive: boolean;
}

export interface Module {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  isHidden: boolean;
  isSample: boolean;
  order: number;
  weight: number;
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  rules?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  startTime: string;
  endTime: string;
  duration: number;
  maxAttempts?: number;
  penaltyTime?: number;
  showLeaderboard: boolean;
  freezeTime?: number;
  accessCode?: string;
  isActive: boolean;
  problems?: ContestProblem[];
  participants?: number;
}

export interface ContestProblem {
  id: string;
  label: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  solved?: number;
}

export interface Submission {
  id: string;
  code: string;
  language: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  executionTime?: number;
  memoryUsed?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  submittedAt: string;
  problem: {
    id: string;
    title: string;
  };
  contestId?: string;
}

// Backend testResult structure (from Judge0Service.executeWithTestCases)
export interface RunResult {
  testCaseIndex: number;       // Test case index (0-based)
  testCase?: number;            // Test case number (1-based) - from submit response
  passed: boolean;              // Whether test case passed
  status: string;               // Status description (e.g., "Accepted", "Wrong Answer")
  statusId: number;             // Judge0 status ID (3=ACCEPTED, 4=WRONG_ANSWER, 5=TLE, 6=CE, 7-12=RE)
  stdout?: string;              // Standard output
  stderr?: string;              // Standard error
  compileOutput?: string;       // Compilation output (for compilation errors)
  time: number;                 // Execution time in milliseconds
  memory: number;               // Memory usage in KB
  expectedOutput?: string;      // Expected output (may be hidden for non-sample test cases)
  actualOutput?: string;        // Actual output from execution
  input?: string;               // Input (only for sample test cases)
  
  // For backward compatibility with UI code
  executionTime?: number;       // Alias for time
  memoryUsed?: number;          // Alias for memory
  error?: string;               // Combined error message
}

// Backend Progress structure (from StudentCodingController.getMyProgress)
export interface Progress {
  solved: number;                // Problems solved (ACCEPTED status)
  attempted: number;             // Problems attempted (includes solved)
  total: number;                 // Total active problems
  unsolved: number;              // Problems not attempted
  solvedByDifficulty: Array<{    // Breakdown by difficulty
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    count: number;
  }>;
}

export interface Language {
  id: string;
  name: string;
  value: string;
  version: string;
  isActive: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  score: number;
  penalty: number;
  solvedCount: number;
}

// Backend Bookmark structure (from StudentCodingController.getBookmarks)
export interface Bookmark {
  id: string;           // Problem ID
  title: string;        // Problem title
  slug: string;         // Problem slug
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];       // Problem tags
}

// API Helper
async function fetchAPI(endpoint: string, options: { method?: string; data?: any; params?: any } = {}) {
  try {
    const response = await api({
      url: endpoint,
      method: options.method || 'GET',
      data: options.data,
      params: options.params,
    });
    
    // Return data - let consumers handle the structure
    // Backend might return { success, message, data } or just data directly
    return response.data.data || response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      'Request failed';
    
    console.error('[API fetchAPI Failed]', {
      endpoint,
      method: options.method || 'GET',
      errorMessage,
      errorData: error.response?.data,
      status: error.response?.status
    });
    
    throw new Error(errorMessage);
  }
}

// ==================== STUDENT ENDPOINTS ====================

// Problems
export const getProblems = async (params?: {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  moduleId?: string;
  tagId?: string;
  status?: 'UNSOLVED' | 'ATTEMPTED' | 'SOLVED';
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return fetchAPI('/api/student/coding/problems', { params });
};

export const getProblemById = async (id: string) => {
  return fetchAPI(`/api/student/coding/problems/${id}`);
};

// Code Execution
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

// Bookmarks
export const getBookmarks = async (params?: { page?: number; limit?: number }) => {
  return fetchAPI('/api/student/coding/bookmarks', { params });
};

export const addBookmark = async (problemId: string) => {
  return fetchAPI(`/api/student/coding/bookmarks/${problemId}`, {
    method: 'POST',
  });
};

export const removeBookmark = async (problemId: string) => {
  return fetchAPI(`/api/student/coding/bookmarks/${problemId}`, {
    method: 'DELETE',
  });
};

// Progress & Submissions
export const getMyProgress = async () => {
  return fetchAPI('/api/student/coding/my-progress');
};

export const getMySubmissions = async (params?: {
  problemId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return fetchAPI('/api/student/coding/my-submissions', { params });
};

export const getSubmissionById = async (id: string) => {
  return fetchAPI(`/api/student/coding/my-submissions/${id}`);
};

// Contests
export const getContests = async (params?: { status?: string; page?: number; limit?: number }) => {
  return fetchAPI('/api/student/coding/contests', { params });
};

export const getActiveContests = async () => {
  return fetchAPI('/api/student/coding/contests/active');
};

export const getContestById = async (id: string) => {
  return fetchAPI(`/api/student/coding/contests/${id}`);
};

export const registerForContest = async (id: string, accessCode?: string) => {
  return fetchAPI(`/api/student/coding/contests/${id}/register`, {
    method: 'POST',
    ...(accessCode && { data: { accessCode } }),
  });
};

export const getContestLeaderboard = async (id: string, params?: { page?: number; limit?: number }) => {
  return fetchAPI(`/api/student/coding/contests/${id}/leaderboard`, { params });
};

export const getMyContests = async () => {
  return fetchAPI('/api/student/coding/my-contests');
};

// Languages
export const getLanguages = async () => {
  return fetchAPI('/api/student/coding/languages');
};

// Auth helpers
export const setAuthToken = (token: string) => {
  localStorage.setItem('studentAccessToken', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('studentAccessToken');
};

export const getAuthToken = () => {
  return localStorage.getItem('studentAccessToken');
};
