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
    queryKey: ["my-contests"],
    queryFn: getMyContests,
  });

  // Handle array or object responses
  const contests: Contest[] = Array.isArray(data) ? data : 
    (data?.contests || data?.items || []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const liveContests = contests.filter((c) => c.status === "LIVE");
  const scheduledContests = contests.filter((c) => c.status === "SCHEDULED");
  const completedContests = contests.filter((c) => c.status === "COMPLETED");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Contests</h1>
          <p className="text-muted-foreground mt-1">
            Contests you've registered for or participated in
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <span className="w-1.5 h-1.5 rounded-full bg-success mr-2" />
            {liveContests.length} Live
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
            {scheduledContests.length} Upcoming
          </Badge>
          <Badge variant="outline">
            {completedContests.length} Completed
          </Badge>
        </div>
      </div>

      {contests.length === 0 ? (
        <div className="glass-card rounded-xl p-16 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1">No contests yet</p>
          <p className="text-sm mb-4">Register for contests to see them here</p>
          <Button asChild variant="default" size="sm">
            <Link to="/contests">Browse Contests</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live Contests */}
          {liveContests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live Now
              </h2>
              <div className="grid gap-4">
                {liveContests.map((contest, i) => (
                  <ContestCard key={contest.id} contest={contest} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Contests */}
          {scheduledContests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Upcoming</h2>
              <div className="grid gap-4">
                {scheduledContests.map((contest, i) => (
                  <ContestCard key={contest.id} contest={contest} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Contests */}
          {completedContests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Past Contests</h2>
              <div className="grid gap-4">
                {completedContests.map((contest, i) => (
                  <ContestCard key={contest.id} contest={contest} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Contest Card Component
const ContestCard = ({ contest, index }: { contest: Contest; index: number }) => {
  return (
    <div
      className="glass-card rounded-xl p-5 hover-lift scroll-reveal"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/contests/${contest.id}`}
              className="text-lg font-semibold hover:text-primary transition-colors"
            >
              {contest.title}
            </Link>
            <Badge variant="outline" className={statusStyle[contest.status]}>
              {contest.status === "LIVE" && (
                <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
              )}
              {contest.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {contest.description}
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(contest.startTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {contest.duration} min
            </span>
            {contest.participants !== undefined && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {contest.participants} participants
              </span>
            )}
            {contest.problems && (
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                {contest.problems.length} problems
              </span>
            )}
            {contest.totalPoints !== undefined && (
              <span className="flex items-center gap-1.5 font-medium text-warning">
                🏆 {contest.totalPoints} points
              </span>
            )}
          </div>

          {contest.status === "COMPLETED" && (
            <div className="mt-3 flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs font-medium text-success">Participated</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Your Score:</span>
                <span className="font-semibold text-primary">
                  {contest.studentScore || 0} / {contest.totalPoints || 0}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-success">
                  {contest.solvedCount || 0} / {contest.problems?.length || 0} solved
                </span>
              </div>
            </div>
          )}
        </div>
        <div>
          {contest.status === "LIVE" && (
            <Button size="sm" asChild>
              <Link to={`/contests/${contest.id}`}>Enter Contest</Link>
            </Button>
          )}
          {contest.status === "SCHEDULED" && (
            <Button size="sm" variant="outline" asChild>
              <Link to={`/contests/${contest.id}`}>View Details</Link>
            </Button>
          )}
          {contest.status === "COMPLETED" && (
            <Button size="sm" variant="ghost" asChild>
              <Link to={`/contests/${contest.id}`}>View Results</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyContestsPage;
