import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  student: any;
  token: string | null;
  login: (token: string, student: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists on mount
    console.log('[AuthContext] Checking for stored token...');
    const storedToken = localStorage.getItem('studentAccessToken');
    const storedStudent = localStorage.getItem('studentData');
    
    if (storedToken && storedStudent) {
      try {
        console.log('[AuthContext] Found stored credentials, restoring session...');
        setToken(storedToken);
        setStudent(JSON.parse(storedStudent));
        setIsAuthenticated(true);
        console.log('[AuthContext] Session restored successfully');
      } catch (error) {
        console.error('[AuthContext] Failed to parse stored student data:', error);
        localStorage.removeItem('studentAccessToken');
        localStorage.removeItem('studentData');
      }
    } else {
      console.log('[AuthContext] No stored credentials found');
    }
    setIsLoading(false);
    console.log('[AuthContext] Auth initialization complete');
  }, []);

  const login = (accessToken: string, studentData: any) => {
    console.log('[AuthContext] Logging in student:', studentData?.name || studentData?.email);
    localStorage.setItem('studentAccessToken', accessToken);
    localStorage.setItem('studentData', JSON.stringify(studentData));
    setToken(accessToken);
    setStudent(studentData);
    setIsAuthenticated(true);
    console.log('[AuthContext] Login successful');
  };

  const logout = () => {
    console.log('[AuthContext] Logging out student');
    localStorage.removeItem('studentAccessToken');
    localStorage.removeItem('studentData');
    setToken(null);
    setStudent(null);
    setIsAuthenticated(false);
    console.log('[AuthContext] Logout complete');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, student, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
