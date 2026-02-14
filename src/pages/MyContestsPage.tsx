import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Calendar, Clock, Users, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyContests } from "@/lib/api";
import type { Contest } from "@/lib/api";

const statusStyle: Record<string, string> = {
  LIVE: "bg-success/15 text-success border-success/30 animate-pulse-glow",
  SCHEDULED: "bg-secondary/15 text-secondary border-secondary/30",
  COMPLETED: "bg-muted text-muted-foreground border-border",
};

const MyContestsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-exams"],
    queryFn: getMyContests,
  });

  // Handle array or object responses
  const exams: Contest[] = Array.isArray(data) ? data : 
    (data?.contests || data?.items || []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const liveExams = exams.filter((c) => c.status === "LIVE");
  const scheduledExams = exams.filter((c) => c.status === "SCHEDULED");
  const completedExams = exams.filter((c) => c.status === "COMPLETED");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Lab Exams</h1>
          <p className="text-muted-foreground mt-1">
            Lab exams you've participated in
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <span className="w-1.5 h-1.5 rounded-full bg-success mr-2" />
            {liveExams.length} Live
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
            {scheduledExams.length} Upcoming
          </Badge>
          <Badge variant="outline">
            {completedExams.length} Completed
          </Badge>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="glass-card rounded-xl p-16 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1">No lab exams yet</p>
          <p className="text-sm mb-4">Browse available lab exams to get started</p>
          <Button asChild variant="default" size="sm">
            <Link to="/contests">Browse Lab Exams</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live Exams */}
          {liveExams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live Now
              </h2>
              <div className="grid gap-4">
                {liveExams.map((exam, i) => (
                  <ExamCard key={exam.id} exam={exam} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Exams */}
          {scheduledExams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Upcoming</h2>
              <div className="grid gap-4">
                {scheduledExams.map((exam, i) => (
                  <ExamCard key={exam.id} exam={exam} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Exams */}
          {completedExams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Past Lab Exams</h2>
              <div className="grid gap-4">
                {completedExams.map((exam, i) => (
                  <ExamCard key={exam.id} exam={exam} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Exam Card Component
const ExamCard = ({ exam, index }: { exam: Contest; index: number }) => {
  return (
    <div
      className="glass-card rounded-xl p-5 hover-lift scroll-reveal"
      style={{ animationDelay: `${index * 80}ms` }}
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
              {exam.status === "LIVE" && (
                <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
              )}
              {exam.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {exam.description}
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(exam.startTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {exam.duration} min
            </span>
            {exam.participants !== undefined && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {exam.participants} participants
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

          {exam.status === "COMPLETED" && (
            <div className="mt-3 flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs font-medium text-success">Participated</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Your Score:</span>
                <span className="font-semibold text-primary">
                  {exam.studentScore || 0} / {exam.totalPoints || 0}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-success">
                  {exam.solvedCount || 0} / {exam.problems?.length || 0} solved
                </span>
              </div>
            </div>
          )}
        </div>
        <div>
          {exam.status === "LIVE" && (
            <Button size="sm" asChild>
              <Link to={`/contests/${exam.id}`}>Enter Exam</Link>
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
  );
};

export default MyContestsPage;
