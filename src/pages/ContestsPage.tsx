import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Users, Trophy, Lock, Globe, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getContests } from "@/lib/api";
import type { Contest } from "@/lib/api";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  LIVE: "bg-success/15 text-success border-success/30 animate-pulse-glow",
  SCHEDULED: "bg-secondary/15 text-secondary border-secondary/30",
  COMPLETED: "bg-muted text-muted-foreground border-border",
};

const ContestsPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["exams"],
    queryFn: () => getContests(),
  });

  // Handle array or object responses and filter out DRAFT exams
  const allExams: Contest[] = Array.isArray(data) ? data :
    (data?.contests || data?.items || []);

  // Students shouldn't see DRAFT exams (admin-only)
  const exams = allExams.filter(c => c.status !== 'DRAFT');

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">Failed to load lab exams</div>
          <p className="text-muted-foreground">{(error as Error)?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Exams</h1>
          <p className="text-muted-foreground mt-1">Test your skills with timed coding challenges</p>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="glass-card rounded-xl p-16 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1">No lab exams available</p>
          <p className="text-sm">Check back later for upcoming lab exams</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam, i) => (
            <div
              key={exam.id}
              className="glass-card rounded-xl p-5 hover-lift scroll-reveal"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/contests/${exam.id}`}
                      className="text-lg font-semibold hover:text-primary transition-colors"
                    >
                      {exam.title}
                    </Link>
                    <Badge variant="outline" className={statusStyle[exam.status]}>
                      {exam.status === "LIVE" && <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />}
                      {exam.status}
                    </Badge>
                    {exam.visibility === "PRIVATE" ? (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
                  <div className="flex items-center gap-5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(exam.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.duration} min
                    </span>
                    {exam.participants !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {exam.participants}
                      </span>
                    )}
                    {exam.problems && (
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5" />
                        {exam.problems.length} problems
                      </span>
                    )}
                    {exam.totalPoints !== undefined && (
                      <span className="flex items-center gap-1.5 font-medium text-warning">
                        🏆 {exam.totalPoints} points
                      </span>
                    )}
                  </div>
                  {exam.status === "COMPLETED" && exam.isRegistered && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Your Score:</span>
                      <span className="font-semibold text-primary">
                        {exam.studentScore || 0} / {exam.totalPoints || 0} points
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-success">
                        {exam.solvedCount || 0} / {exam.problems?.length || 0} solved
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  {exam.status === "LIVE" && (
                    <Button size="sm" asChild>
                      <Link to={`/contests/${exam.id}`}>Enter</Link>
                    </Button>
                  )}
                  {exam.status === "SCHEDULED" && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/contests/${exam.id}`}>View Details</Link>
                    </Button>
                  )}
                  {exam.status === "COMPLETED" && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/contests/${exam.id}`}>View Results</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestsPage;
