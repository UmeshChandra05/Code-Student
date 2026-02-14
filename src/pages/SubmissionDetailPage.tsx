import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock, MemoryStick, Code2, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import DifficultyBadge from "@/components/DifficultyBadge";
import { getSubmissionById } from "@/lib/api";
import type { Submission } from "@/lib/api";

const SubmissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: submission, isLoading } = useQuery<Submission>({
    queryKey: ["submission", id],
    queryFn: () => getSubmissionById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <div className="text-center text-muted-foreground">
          <Code2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1">Submission not found</p>
          <Link to="/submissions" className="text-sm text-primary hover:underline">
            ← Back to submissions
          </Link>
        </div>
      </div>
    );
  }

  const statusIcons = {
    ACCEPTED: <CheckCircle2 className="w-5 h-5 text-success" />,
    WRONG_ANSWER: <XCircle className="w-5 h-5 text-destructive" />,
    TIME_LIMIT_EXCEEDED: <Clock className="w-5 h-5 text-warning" />,
    RUNTIME_ERROR: <AlertTriangle className="w-5 h-5 text-destructive" />,
    COMPILATION_ERROR: <XCircle className="w-5 h-5 text-destructive" />,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link
        to="/submissions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Submissions
      </Link>

      {/* Submission Header */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{submission.problem.title}</h1>
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(submission.submittedAt).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {statusIcons[submission.status]}
            <StatusBadge status={submission.status} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="glass-card rounded-lg p-4 bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase">Language</span>
            </div>
            <p className="font-semibold capitalize">{submission.language}</p>
          </div>

          <div className="glass-card rounded-lg p-4 bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase">Runtime</span>
            </div>
            <p className="font-semibold font-mono">
              {submission.executionTime ? `${submission.executionTime}ms` : "—"}
            </p>
          </div>

          <div className="glass-card rounded-lg p-4 bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <MemoryStick className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase">Memory</span>
            </div>
            <p className="font-semibold font-mono">
              {submission.memoryUsed ? `${submission.memoryUsed}MB` : "—"}
            </p>
          </div>

          <div className="glass-card rounded-lg p-4 bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase">Test Cases</span>
            </div>
            <p className="font-semibold">
              {submission.testCasesPassed !== undefined && submission.totalTestCases !== undefined
                ? `${submission.testCasesPassed}/${submission.totalTestCases}`
                : "—"}
            </p>
          </div>
        </div>

        {submission.contestId && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <span className="text-primary font-semibold">Contest Submission</span>
              <span className="text-muted-foreground ml-2">
                This submission was made during a contest
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Code Display */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-muted/30">
          <h2 className="font-semibold">Submitted Code</h2>
          <Badge variant="outline" className="font-mono text-xs">
            {submission.language}
          </Badge>
        </div>
        <div className="p-6 overflow-x-auto bg-background/50">
          <pre className="text-sm font-mono">
            <code>{submission.code}</code>
          </pre>
        </div>
      </div>

      {/* Problem Info */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold mb-4">Problem Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Problem</span>
            <Link
              to={`/problems/${submission.problem.id}`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {submission.problem.title}
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Submission ID</span>
            <span className="text-sm font-mono text-muted-foreground">{submission.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailPage;
