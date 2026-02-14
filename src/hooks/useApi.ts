import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProblems,
  fetchProblem,
  runCode,
  submitCode,
  fetchBookmarks,
  addBookmark,
  removeBookmark,
  fetchMySubmissions,
  fetchSubmission,
  fetchMyProgress,
  fetchContests,
  fetchActiveContests,
  fetchContest,
  registerForContest,
  fetchContestLeaderboard,
  fetchMyContests,
  fetchLanguages,
} from "@/lib/api";

// ─── Problems ───
export function useProblems(params?: Parameters<typeof fetchProblems>[0]) {
  return useQuery({
    queryKey: ["problems", params],
    queryFn: () => fetchProblems(params),
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: () => fetchProblem(id),
    enabled: !!id,
  });
}

// ─── Code Execution ───
export function useRunCode(problemId: string) {
  return useMutation({
    mutationFn: (body: { code: string; language: string; customInput?: string }) =>
      runCode(problemId, body),
  });
}

export function useSubmitCode(problemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { code: string; language: string; contestId?: string }) =>
      submitCode(problemId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["problems"] });
    },
  });
}

// ─── Bookmarks ───
export function useBookmarks(params?: Parameters<typeof fetchBookmarks>[0]) {
  return useQuery({
    queryKey: ["bookmarks", params],
    queryFn: () => fetchBookmarks(params),
  });
}

export function useAddBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => addBookmark(problemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => removeBookmark(problemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

// ─── Submissions ───
export function useMySubmissions(params?: Parameters<typeof fetchMySubmissions>[0]) {
  return useQuery({
    queryKey: ["submissions", params],
    queryFn: () => fetchMySubmissions(params),
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
    enabled: !!id,
  });
}

// ─── Progress ───
export function useMyProgress() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: fetchMyProgress,
  });
}

// ─── Contests ───
export function useContests(params?: Parameters<typeof fetchContests>[0]) {
  return useQuery({
    queryKey: ["contests", params],
    queryFn: () => fetchContests(params),
  });
}

export function useActiveContests() {
  return useQuery({
    queryKey: ["contests", "active"],
    queryFn: fetchActiveContests,
  });
}

export function useContest(id: string) {
  return useQuery({
    queryKey: ["contest", id],
    queryFn: () => fetchContest(id),
    enabled: !!id,
  });
}

export function useRegisterForContest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contestId: string) => registerForContest(contestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contests"] }),
  });
}

export function useContestLeaderboard(contestId: string) {
  return useQuery({
    queryKey: ["contest", contestId, "leaderboard"],
    queryFn: () => fetchContestLeaderboard(contestId),
    enabled: !!contestId,
  });
}

export function useMyContests() {
  return useQuery({
    queryKey: ["my-contests"],
    queryFn: fetchMyContests,
  });
}

// ─── Languages ───
export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
    staleTime: Infinity,
  });
}
