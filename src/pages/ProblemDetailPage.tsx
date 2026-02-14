import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Play,
  Send,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  Maximize2,
  Clock,
  MemoryStick,
  AlertCircle,
} from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import { getProblemById, runCode, submitCode, getLanguages, addBookmark, removeBookmark, getMySubmissions } from "@/lib/api";
import type { Problem, Language, RunResult } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Map backend language values to Monaco editor language IDs
const MONACO_LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  csharp: "csharp",
  typescript: "typescript",
};

// Backend-supported Judge0 language IDs (matches exactly with backend Judge0Service LANGUAGE_IDS)
// This prevents duplicates by filtering at source - only show languages backend actually supports
const BACKEND_SUPPORTED_JUDGE0_IDS: Record<number, string> = {
  71: "python",      // Python 3.8.1
  62: "java",        // Java (OpenJDK 13.0.1)
  54: "cpp",         // C++ (GCC 9.2.0)
  50: "c",           // C (GCC 9.2.0)
  63: "javascript",  // JavaScript (Node.js 12.14.0)
  74: "typescript",  // TypeScript (3.7.4)
  60: "go",          // Go (1.13.5)
  73: "rust",        // Rust (1.40.0)
  72: "ruby",        // Ruby (2.7.0)
  68: "php",         // PHP (7.4.1)
  83: "swift",       // Swift (5.2.3)
  78: "kotlin",      // Kotlin (1.3.70)
  81: "scala",       // Scala (2.13.2)
  51: "csharp",      // C# (Mono 6.6.0.161)
};

// Normalize a language entry from Judge0 API - ONLY include languages backend supports
// This eliminates duplicates at the source by filtering on Judge0 ID
function normalizeLanguage(raw: any): Language | null {
  if (!raw || typeof raw !== 'object') return null;
  
  // Judge0 format: {id: 71, name: "Python (3.8.1)"}
  const judge0Id = Number(raw.id);
  const judge0Name = raw.name || '';
  
  // ONLY include languages that backend supports (by exact Judge0 ID)
  const backendKey = BACKEND_SUPPORTED_JUDGE0_IDS[judge0Id];
  if (!backendKey) return null; // Skip unsupported languages
  
  // Extract clean display name (e.g., "Python (3.8.1)" -> "Python")
  const displayName = judge0Name.replace(/\s*\([^)]*\)/, '').trim();
  
  return {
    id: String(judge0Id),
    name: displayName,
    value: backendKey,  // Backend expected key (python, javascript, java, etc.)
    version: '',
    isActive: true,
  };
}

const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [activeTab, setActiveTab] = useState("description");
  const [consoleTab, setConsoleTab] = useState<"testcases" | "result">("testcases");
  const [output, setOutput] = useState<null | {
    type: "run" | "submit";
    results: RunResult[];
    status?: string;
    passedCount?: number;
  }>(null);
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef<any>(null);

  // Fetch problem details
  const { data: problem, isLoading: problemLoading } = useQuery<Problem>({
    queryKey: ["problem", id],
    queryFn: () => getProblemById(id!),
    enabled: !!id,
  });

  // Fetch languages
  const { data: languagesData } = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  // Fetch submissions for this problem
  const { data: submissionsData } = useQuery({
    queryKey: ["submissions", id],
    queryFn: () => getMySubmissions({ problemId: id }),
    enabled: !!id,
  });

  // Handle array or object responses from API
  const rawLangs = (() => {
    if (!languagesData) return [];
    if (Array.isArray(languagesData)) return languagesData;
    // Try common nested structures
    const nested = languagesData?.data?.languages || languagesData?.languages
      || languagesData?.data || languagesData?.items;
    if (Array.isArray(nested)) return nested;
    return [];
  })();

  // Normalize Judge0 language format - filtered by backend-supported IDs
  // API response: [{id: 71, name: "Python (3.8.1)"}, {id: 63, name: "JavaScript (Node.js 12.14.0)"}, ...]
  // No deduplication needed - we filter by exact Judge0 ID that backend uses
  const languages: Language[] = rawLangs
    .map(normalizeLanguage)
    .filter((lang): lang is Language => lang !== null && lang.isActive);

  const submissions = Array.isArray(submissionsData) ? submissionsData :
    (submissionsData?.submissions || submissionsData?.items || []);

  // Set default language to first available language when languages load
  useEffect(() => {
    if (languages.length > 0 && !language) {
      // Prefer javascript as default, then python, then first available
      const preferred = languages.find(l => l.value === 'javascript')
        || languages.find(l => l.value === 'python')
        || languages[0];
      setLanguage(preferred.value);
    }
  }, [languages, language]);

  // Set starter code when problem loads
  useEffect(() => {
    if (problem?.starterCode) {
      setCode(problem.starterCode);
    }
  }, [problem?.starterCode]);

  // Run code mutation
  const runMutation = useMutation({
    mutationFn: () => runCode(id!, code, language),
    onSuccess: (data) => {
      // Backend response: { success: true, message: "...", data: { passedCount, totalCount, score, status, testResults, runtime, memory, isCustomInput } }
      // Note: fetchAPI helper already extracts response.data.data, so 'data' here is already the inner data object
      const resultData = data;
      if (!resultData) {
        toast.error("Invalid response from server");
        return;
      }

      const testResults = (resultData.testResults || []).map((tr: any) => ({
        ...tr,
        // Add backward compatibility aliases
        executionTime: tr.time,
        memoryUsed: tr.memory,
        error: tr.stderr || tr.compileOutput || (tr.passed ? undefined : tr.status),
      }));
      const passedCount = resultData.passedCount || 0;
      const totalCount = resultData.totalCount || 0;
      const status = resultData.status || 'UNKNOWN';

      setOutput({
        type: "run",
        results: testResults,
        passedCount,
        status
      });
      setConsoleTab("result");

      if (status === 'ACCEPTED' || passedCount === totalCount && totalCount > 0) {
        toast.success(`All ${totalCount} test cases passed!`);
      } else {
        toast.error(`${passedCount}/${totalCount} test cases passed`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to run code");
    },
  });

  // Submit code mutation
  const submitMutation = useMutation({
    mutationFn: () => submitCode(id!, code, language),
    onSuccess: (data) => {
      // Backend response: { success: true, message: "...", data: { submissionId, status, score, passedTestCases, totalTestCases, runtime, memory, testResults } }
      // Note: fetchAPI helper already extracts response.data.data, so 'data' here is already the inner data object
      const resultData = data;
      if (!resultData) {
        toast.error("Invalid response from server");
        return;
      }

      const testResults = (resultData.testResults || []).map((tr: any) => ({
        ...tr,
        // Map testCase (1-based) to testCaseIndex (0-based) for consistency
        testCaseIndex: (tr.testCase || tr.testCaseIndex || 1) - 1,
        // Add backward compatibility aliases
        executionTime: tr.time,
        memoryUsed: tr.memory,
        error: tr.stderr || tr.compileOutput || (tr.passed ? undefined : tr.status),
      }));
      const passedCount = resultData.passedTestCases || 0;
      const totalCount = resultData.totalTestCases || 0;
      const status = resultData.status || 'UNKNOWN';

      setOutput({
        type: "submit",
        results: testResults,
        status,
        passedCount
      });
      setConsoleTab("result");

      queryClient.invalidateQueries({ queryKey: ["submissions", id] });
      queryClient.invalidateQueries({ queryKey: ["problem", id] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });

      if (status === "ACCEPTED") {
        toast.success("Accepted! All test cases passed 🎉", { duration: 4000 });
      } else {
        toast.error(`${status.replace(/_/g, " ")} - ${passedCount}/${totalCount} passed`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit code");
    },
  });

  // Bookmark mutations
  const bookmarkMutation = useMutation({
    mutationFn: (isBookmarked: boolean) =>
      isBookmarked ? removeBookmark(id!) : addBookmark(id!),
    onSuccess: (_, isBookmarked) => {
      queryClient.invalidateQueries({ queryKey: ["problem", id] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success(isBookmarked ? "Bookmark removed" : "Problem bookmarked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update bookmark");
    },
  });

  const handleRun = () => {
    runMutation.mutate();
  };

  const handleSubmit = () => {
    submitMutation.mutate();
  };

  const handleBookmark = () => {
    bookmarkMutation.mutate(!!(problem as any)?.isBookmarked);
  };

  if (problemLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Problem not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            to="/problems"
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-accent rounded-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-base">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {problem.timeLimit}ms
            </span>
            <span className="flex items-center gap-1.5">
              <MemoryStick className="w-3.5 h-3.5" />
              {problem.memoryLimit}MB
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            disabled={bookmarkMutation.isPending}
            className="h-8"
          >
            {(problem as any)?.isBookmarked ? (
              <>
                <BookmarkCheck className="w-4 h-4 mr-1.5 text-primary" />
                <span className="text-xs">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 mr-1.5" />
                <span className="text-xs">Save</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className="w-[45%] border-r border-border overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-border px-5 pt-3 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
              <TabsList className="h-9 bg-muted/50">
                <TabsTrigger value="description" className="text-xs">Description</TabsTrigger>
                <TabsTrigger value="submissions" className="text-xs">
                  Submissions
                  {submissions.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                      {submissions.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="description" className="flex-1 p-5 space-y-5 m-0">
              {/* Tags */}
              {problem.tags && problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2.5 py-1 rounded-md text-xs font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: tag.color + "15",
                        color: tag.color,
                        border: `1px solid ${tag.color}30`
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {problem.description}
                </div>
              </div>

              {/* Example */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Example:</h3>
                <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Input</div>
                      <pre className="text-xs font-mono text-foreground">{problem.sampleInput}</pre>
                    </div>
                    <div className="p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Output</div>
                      <pre className="text-xs font-mono text-foreground">{problem.sampleOutput}</pre>
                    </div>
                  </div>
                  {problem.explanation && (
                    <div className="px-4 py-3 border-t border-border bg-muted/50">
                      <div className="text-xs font-medium text-muted-foreground mb-1.5">Explanation</div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{problem.explanation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Constraints:</h3>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {problem.constraints}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 p-5 m-0">
              {submissions && submissions.length > 0 ? (
                <div className="space-y-2">
                  {submissions.slice(0, 20).map((submission: any) => (
                    <div
                      key={submission.id}
                      className="rounded-lg border border-border bg-card p-3.5 hover:bg-accent/50 transition-all cursor-pointer group"
                      onClick={() => {
                        setCode(submission.code);
                        setLanguage(submission.language);
                        toast.info("Loaded submission code into editor");
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-xs font-semibold px-2 py-1 rounded-md",
                          submission.status === 'ACCEPTED'
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        )}>
                          {submission.status === 'ACCEPTED' ? (
                            <><CheckCircle2 className="w-3 h-3 inline mr-1" />Accepted</>
                          ) : (
                            <><XCircle className="w-3 h-3 inline mr-1" />{submission.status}</>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="capitalize">{submission.language}</span>
                        {submission.executionTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {submission.executionTime}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Send className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No submissions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Submit your solution to see results here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-border/50 bg-[#2d2d2d]">
            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-44 h-8 bg-[#1e1e1e] border-border/50 text-xs">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.value} value={l.value} className="text-xs">
                      <span className="flex items-center gap-2">
                        <span>{l.name}</span>
                        {l.version && <span className="text-muted-foreground text-[10px]">({l.version})</span>}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <button onClick={() => setFontSize(Math.max(10, fontSize - 1))} className="hover:text-foreground">
                  <span className="text-sm">A-</span>
                </button>
                <span className="w-px h-4 bg-border" />
                <button onClick={() => setFontSize(Math.min(20, fontSize + 1))} className="hover:text-foreground">
                  <span className="text-sm">A+</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRun}
                disabled={!language || runMutation.isPending || submitMutation.isPending}
                className="h-8 bg-[#1e1e1e] border-border/50 hover:bg-[#2d2d2d]"
              >
                {runMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span className="text-xs">Run Code</span>
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!language || runMutation.isPending || submitMutation.isPending}
                className="h-8 bg-success hover:bg-success/90"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                )}
                <span className="text-xs">Submit</span>
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              language={MONACO_LANGUAGE_MAP[language] || language}
              value={code}
              onChange={(v) => setCode(v || "")}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              theme="vs-dark"
              options={{
                fontSize,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
                fontLigatures: true,
                minimap: { enabled: true, scale: 1 },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: "on",
                renderLineHighlight: "all",
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                wrappingIndent: "indent",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                quickSuggestions: true,
              }}
            />
          </div>

          {/* Console / Test Results Panel - LeetCode-style minimal design */}
          <div className="border-t border-border/40 bg-[#1e1e1e] flex flex-col max-h-[45%] min-h-[200px]">
            <Tabs value={consoleTab} onValueChange={(v) => setConsoleTab(v as any)} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
                <TabsList className="h-7 bg-transparent border-0">
                  <TabsTrigger value="testcases" className="text-xs h-6 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">Testcase</TabsTrigger>
                  <TabsTrigger value="result" className="text-xs h-6 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">
                    <span className="mr-1">Result</span>
                    {output && (
                      <span className={cn(
                        "px-1 py-0.5 rounded text-[10px] font-medium",
                        output.passedCount === output.results.length
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      )}>
                        {output.passedCount}/{output.results.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                {output && consoleTab === "result" && (
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded",
                    output.status === 'ACCEPTED' || output.status === 'PASSED'
                      ? "bg-green-500/15 text-green-400"
                      : "bg-red-500/15 text-red-400"
                  )}>
                    {output.status || (output.passedCount === output.results.length ? 'Accepted' : 'Wrong Answer')}
                  </span>
                )}
              </div>

              <TabsContent value="testcases" className="flex-1 overflow-y-auto p-3 m-0">
                {problem.testCases && problem.testCases.length > 0 ? (
                  <div className="space-y-2">
                    {problem.testCases.filter((tc: any) => tc.isSample).map((testCase: any, idx: number) => (
                      <div key={idx} className="rounded border border-border/30 bg-[#282828] overflow-hidden">
                        <div className="px-3 py-1.5 border-b border-border/20">
                          <span className="text-[11px] font-medium text-muted-foreground">Case {idx + 1}</span>
                        </div>
                        <div className="p-2.5 space-y-2">
                          <div>
                            <div className="text-[11px] text-muted-foreground mb-1 font-medium">Input</div>
                            <pre className="text-[11px] font-mono bg-[#1e1e1e] p-2 rounded border border-border/20 leading-relaxed">
                              {testCase.input}
                            </pre>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground mb-1 font-medium">Output</div>
                            <pre className="text-[11px] font-mono bg-[#1e1e1e] p-2 rounded border border-border/20 leading-relaxed">
                              {testCase.output || testCase.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
                    No test cases available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="result" className="flex-1 overflow-y-auto p-3 m-0">
                {output && output.results.length > 0 ? (
                  <div className="space-y-2">
                    {output.results.map((result, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "rounded border overflow-hidden",
                          result.passed
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-red-500/30 bg-red-500/5"
                        )}
                      >
                        <div className={cn(
                          "px-3 py-1.5 flex items-center justify-between border-b",
                          result.passed 
                            ? "bg-green-500/10 border-green-500/20" 
                            : "bg-red-500/10 border-red-500/20"
                        )}>
                          <div className="flex items-center gap-2">
                            {result.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <span className="text-[11px] font-medium text-foreground">
                              Case {idx + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {result.executionTime && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {result.executionTime}ms
                              </span>
                            )}
                            {result.memoryUsed && (
                              <span className="flex items-center gap-0.5">
                                <MemoryStick className="w-3 h-3" />
                                {result.memoryUsed}KB
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 space-y-2 text-[11px]">
                          {result.error ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-red-400">
                                <AlertCircle className="w-3 h-3" />
                                <span className="font-medium">Error</span>
                              </div>
                              <pre className="text-[11px] bg-[#1e1e1e] p-2 rounded border border-red-500/20 text-red-400 overflow-x-auto leading-relaxed">
                                {result.error}
                              </pre>
                            </div>
                          ) : (
                            <>
                              {result.input && result.input !== "Hidden" && (
                                <div>
                                  <div className="text-muted-foreground mb-1 font-medium">Input</div>
                                  <pre className="bg-[#1e1e1e] p-2 rounded border border-border/20 font-mono overflow-x-auto leading-relaxed">
                                    {result.input}
                                  </pre>
                                </div>
                              )}
                              {result.expectedOutput && (
                                <div>
                                  <div className="text-muted-foreground mb-1 font-medium">Expected</div>
                                  <pre className="bg-[#1e1e1e] p-2 rounded border border-border/20 font-mono overflow-x-auto leading-relaxed">
                                    {result.expectedOutput}
                                  </pre>
                                </div>
                              )}
                              {result.actualOutput && (
                                <div>
                                  <div className="text-muted-foreground mb-1 font-medium">Output</div>
                                  <pre className={cn(
                                    "p-2 rounded border font-mono overflow-x-auto leading-relaxed",
                                    result.passed
                                      ? "bg-[#1e1e1e] border-border/20"
                                      : "bg-[#1e1e1e] border-red-500/20"
                                  )}>
                                    {result.actualOutput}
                                  </pre>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                      <Play className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">No results yet</p>
                    <p className="text-xs mt-1">Run your code to see test results</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
