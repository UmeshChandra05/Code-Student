import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Code2, Trophy, TrendingUp, CheckCircle2, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyProgress, getProblems, getActiveContests } from "@/lib/api";
import type { Progress, Problem, Contest } from "@/lib/api";

const DashboardPage = () => {
  const { data: progress } = useQuery<Progress>({
    queryKey: ["progress"],
    queryFn: getMyProgress,
  });

  const { data: problemsData } = useQuery({
    queryKey: ["problems-attempted"],
    queryFn: () => getProblems({ status: "ATTEMPTED", limit: 3 }),
  });

  const { data: contestsData } = useQuery({
    queryKey: ["active-contests"],
    queryFn: getActiveContests,
  });

  // Handle array or object responses
  const problems: Problem[] = Array.isArray(problemsData) ? problemsData : 
    (problemsData?.problems || problemsData?.items || []);
  const contests: Contest[] = Array.isArray(contestsData) ? contestsData : 
    (contestsData?.contests || contestsData?.items || []);
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero */}
      <div className="glass-card rounded-2xl p-8 glow-effect">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Code2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">
              Keep up the momentum and solve more problems!
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 hover-lift">
          <CheckCircle2 className="w-5 h-5 text-success mb-2" />
          <p className="text-3xl font-bold">{progress?.solved || 0}</p>
          <p className="text-sm text-muted-foreground">Problems Solved</p>
        </div>
        <div className="glass-card rounded-xl p-5 hover-lift">
          <Trophy className="w-5 h-5 text-warning mb-2" />
          <p className="text-3xl font-bold">{contests.length}</p>
          <p className="text-sm text-muted-foreground">Active Contests</p>
        </div>
        <div className="glass-card rounded-xl p-5 hover-lift">
          <TrendingUp className="w-5 h-5 text-secondary mb-2" />
          <p className="text-3xl font-bold">{progress?.attempted || 0}</p>
          <p className="text-sm text-muted-foreground">Attempted</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <h2 className="font-semibold mb-3">Continue Solving</h2>
          <div className="space-y-2">
            {problems.length > 0 ? (
              problems.slice(0, 3).map((p, i) => (
                <Link
                  key={i}
                  to={`/problems/${p.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">{p.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.difficulty}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No attempted problems yet</p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
            <Link to="/problems">
              View All Problems <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h2 className="font-semibold mb-3">Upcoming Contests</h2>
          <div className="space-y-2">
            {contests.length > 0 ? (
              contests.slice(0, 2).map((c, i) => (
                <Link
                  key={i}
                  to={`/contests/${c.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-warning" />
                    <span className="text-sm">{c.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming contests</p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
            <Link to="/contests">
              View All Contests <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
