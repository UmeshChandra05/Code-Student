import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Users, Trophy, Lock, Globe, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getContests, registerForContest } from "@/lib/api";
import type { Contest } from "@/lib/api";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  LIVE: "bg-success/15 text-success border-success/30 animate-pulse-glow",
  SCHEDULED: "bg-secondary/15 text-secondary border-secondary/30",
  COMPLETED: "bg-muted text-muted-foreground border-border",
};

const ContestsPage = () => {
  const queryClient = useQueryClient();
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contests"],
    queryFn: () => getContests(),
  });

  const registerMutation = useMutation({
    mutationFn: (contestId: string) => registerForContest(contestId),
    onSuccess: () => {
      toast.success("Registered for contest successfully!");
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      setRegisteringId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to register");
      setRegisteringId(null);
    },
  });

  const handleRegister = (contest: Contest) => {
    if (contest.visibility === "PRIVATE") {
      const code = prompt("Enter access code for this private contest:");
      if (!code) return;
      setRegisteringId(contest.id);
      registerForContest(contest.id, code)
        .then(() => {
          toast.success("Registered for contest successfully!");
          queryClient.invalidateQueries({ queryKey: ["contests"] });
        })
        .catch((err: any) => toast.error(err.message || "Failed to register"))
        .finally(() => setRegisteringId(null));
    } else {
      setRegisteringId(contest.id);
      registerMutation.mutate(contest.id);
    }
  };

  // Handle array or object responses and filter out DRAFT contests
  const allContests: Contest[] = Array.isArray(data) ? data :
    (data?.contests || data?.items || []);

  // Students shouldn't see DRAFT contests (admin-only)
  const contests = allContests.filter(c => c.status !== 'DRAFT');

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
          <div className="text-red-500 text-xl font-semibold">Failed to load contests</div>
          <p className="text-muted-foreground">{(error as Error)?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
          <p className="text-muted-foreground mt-1">Compete and climb the leaderboard</p>
        </div>
      </div>

      {contests.length === 0 ? (
        <div className="glass-card rounded-xl p-16 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1">No contests available</p>
          <p className="text-sm">Check back later for upcoming coding contests</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contests.map((contest, i) => (
            <div
              key={contest.id}
              className="glass-card rounded-xl p-5 hover-lift scroll-reveal"
              style={{ animationDelay: `${i * 80}ms` }}
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
                      {contest.status === "LIVE" && <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />}
                      {contest.status}
                    </Badge>
                    {contest.visibility === "PRIVATE" ? (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{contest.description}</p>
                  <div className="flex items-center gap-5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(contest.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {contest.duration} min
                    </span>
                    {contest.participants !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {contest.participants}
                      </span>
                    )}
                    {contest.problems && (
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5" />
                        {contest.problems.length} problems
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {contest.status === "LIVE" && (
                    <Button size="sm" asChild>
                      <Link to={`/contests/${contest.id}`}>Enter</Link>
                    </Button>
                  )}
                  {contest.status === "SCHEDULED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={registeringId === contest.id}
                      onClick={() => handleRegister(contest)}
                    >
                      {registeringId === contest.id ? (
                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Registering...</>
                      ) : (
                        "Register"
                      )}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestsPage;
