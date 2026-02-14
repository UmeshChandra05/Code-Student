import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Clock, Users, Trophy, Calendar, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DifficultyBadge from "@/components/DifficultyBadge";
import { getContestById, getContestLeaderboard, registerForContest } from "@/lib/api";
import type { Contest, LeaderboardEntry } from "@/lib/api";
import { toast } from "sonner";

const ContestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: contest, isLoading: contestLoading } = useQuery<Contest>({
    queryKey: ["contest", id],
    queryFn: () => getContestById(id!),
    enabled: !!id,
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["contest-leaderboard", id],
    queryFn: () => getContestLeaderboard(id!),
    enabled: !!id,
  });

  // Handle array or object responses
  const leaderboard: LeaderboardEntry[] = Array.isArray(leaderboardData) ? leaderboardData : 
    (leaderboardData?.leaderboard || leaderboardData?.items || []);

  const registerMutation = useMutation({
    mutationFn: () => registerForContest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest", id] });
      toast.success("Successfully registered for contest");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register");
    },
  });

  if (contestLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <p className="text-muted-foreground">Contest not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link to="/contests" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Contests
      </Link>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{contest.title}</h1>
              <Badge variant="outline" className={`bg-${contest.status.toLowerCase()}/15 text-${contest.status.toLowerCase()} border-${contest.status.toLowerCase()}/30`}>
                {contest.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{contest.description}</p>
            <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(contest.startTime).toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {contest.duration} min</span>
              {contest.participants !== undefined && (
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {contest.participants} participants</span>
              )}
            </div>
          </div>
          {contest.status === "SCHEDULED" && (
            <Button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Registering..." : "Register"}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="problems">
        <TabsList>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          {contest.rules && <TabsTrigger value="rules">Rules</TabsTrigger>}
        </TabsList>

        <TabsContent value="problems" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            {contest.problems && contest.problems.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left py-3 px-4 w-16">#</th>
                    <th className="text-left py-3 px-4">Problem</th>
                    <th className="text-left py-3 px-4">Difficulty</th>
                    <th className="text-right py-3 px-4">Points</th>
                    {contest.status !== "SCHEDULED" && <th className="text-right py-3 px-4">Solved By</th>}
                  </tr>
                </thead>
                <tbody>
                  {contest.problems.map((p) => (
                    <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-primary">{p.label}</td>
                      <td className="py-3 px-4">
                        <Link to={`/problems/${p.id}`} className="font-medium hover:text-primary transition-colors">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4"><DifficultyBadge difficulty={p.difficulty} /></td>
                      <td className="py-3 px-4 text-right font-semibold">{p.points}</td>
                      {contest.status !== "SCHEDULED" && <td className="py-3 px-4 text-right text-muted-foreground">{p.solved || 0}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>No problems added yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            {leaderboard.length > 0 ? (
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
                  {leaderboard.map((entry) => (
                    <tr key={entry.rank} className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        {entry.rank <= 3 ? (
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {entry.rank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground ml-2">{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{entry.name}</td>
                      <td className="py-3 px-4 text-right font-semibold">{entry.score}</td>
                      <td className="py-3 px-4 text-right">{entry.solvedCount}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{entry.penalty} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                {leaderboardLoading ? <Loader2 className="w-8 h-8 mx-auto animate-spin" /> : <p>No entries yet</p>}
              </div>
            )}
          </div>
        </TabsContent>

        {contest.rules && (
          <TabsContent value="rules" className="mt-4">
            <div className="glass-card rounded-xl p-6">
              <pre className="whitespace-pre-wrap text-sm">{contest.rules}</pre>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ContestDetailPage;
