import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Clock, Users, Trophy, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import DifficultyBadge from "@/components/DifficultyBadge";
import { useContest, useContestLeaderboard, useRegisterForContest } from "@/hooks/useApi";

const statusStyle: Record<string, string> = {
  LIVE: "bg-success/15 text-success border-success/30",
  SCHEDULED: "bg-secondary/15 text-secondary border-secondary/30",
  COMPLETED: "bg-muted text-muted-foreground border-border",
};

const ContestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: contest, isLoading, error } = useContest(id!);
  const { data: leaderboardData } = useContestLeaderboard(id!);
  const registerMut = useRegisterForContest();

  const leaderboard = Array.isArray(leaderboardData) ? leaderboardData : leaderboardData?.leaderboard ?? [];
  const problems = contest?.problems ?? [];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-12 text-destructive">
        <p>Failed to load contest: {(error as Error)?.message || "Not found"}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link to="/contests" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Lab Exams
      </Link>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{contest.title}</h1>
              <Badge variant="outline" className={statusStyle[contest.status] ?? ""}>
                {contest.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{contest.description}</p>
            <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(contest.startTime).toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {contest.duration} min</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {contest._count?.registrations ?? 0} participants</span>
            </div>
          </div>
          {contest.status === "SCHEDULED" && (
            <Button onClick={() => registerMut.mutate(id!)} disabled={registerMut.isPending}>
              {registerMut.isPending ? "Registering..." : "Register"}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="problems">
        <TabsList>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="problems" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            {problems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No problems added yet</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left py-3 px-4 w-16">#</th>
                    <th className="text-left py-3 px-4">Problem</th>
                    <th className="text-left py-3 px-4">Difficulty</th>
                    <th className="text-right py-3 px-4">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((p: any) => (
                    <tr key={p.id || p.problemId} className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-primary">{p.label ?? ""}</td>
                      <td className="py-3 px-4">
                        <Link to={`/problems/${p.problemId || p.problem?.id || p.id}?contestId=${id}`} className="font-medium hover:text-primary transition-colors">
                          {p.problem?.title || p.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <DifficultyBadge difficulty={p.problem?.difficulty || p.difficulty} />
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">{p.points ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No leaderboard data yet</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left py-3 px-4 w-16">Rank</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-right py-3 px-4">Score</th>
                    <th className="text-right py-3 px-4">Solved</th>
                    <th className="text-right py-3 px-4">Penalty</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry: any, i: number) => (
                    <tr key={entry.id || i} className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        {i < 3 ? (
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {i + 1}
                          </span>
                        ) : (
                          <span className="text-muted-foreground ml-2">{i + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{entry.student?.name || entry.name || "—"}</td>
                      <td className="py-3 px-4 text-right font-semibold">{entry.totalScore ?? entry.score ?? 0}</td>
                      <td className="py-3 px-4 text-right">{entry.problemsSolved ?? entry.solved ?? 0}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{entry.totalPenalty ?? entry.penalty ?? 0} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <div className="glass-card rounded-xl p-6">
            <pre className="whitespace-pre-wrap text-sm">{contest.rules || "No rules specified."}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContestDetailPage;
