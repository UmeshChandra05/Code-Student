import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock, Users, Trophy, Calendar, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DifficultyBadge from "@/components/DifficultyBadge";
import { getContestById, getContestLeaderboard } from "@/lib/api";
import type { Contest, LeaderboardEntry } from "@/lib/api";

const ContestDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: exam, isLoading: examLoading } = useQuery<Contest>({
    queryKey: ["exam", id],
    queryFn: () => getContestById(id!),
    enabled: !!id,
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["exam-leaderboard", id],
    queryFn: () => getContestLeaderboard(id!),
    enabled: !!id,
  });

  // Handle array or object responses
  const leaderboard: LeaderboardEntry[] = Array.isArray(leaderboardData) ? leaderboardData : 
    (leaderboardData?.leaderboard || leaderboardData?.items || []);

  if (examLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <p className="text-muted-foreground">Lab exam not found</p>
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
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <Badge variant="outline" className={`bg-${exam.status.toLowerCase()}/15 text-${exam.status.toLowerCase()} border-${exam.status.toLowerCase()}/30`}>
                {exam.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{exam.description}</p>
            <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(exam.startTime).toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {exam.duration} min</span>
              {exam.participants !== undefined && (
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {exam.participants} participants</span>
              )}
            </div>
          </div>

        </div>
      </div>

      <Tabs defaultValue="problems">
        <TabsList>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          {exam.rules && <TabsTrigger value="rules">Rules</TabsTrigger>}
        </TabsList>

        <TabsContent value="problems" className="mt-4">
          <div className="glass-card rounded-xl overflow-hidden">
            {exam.problems && exam.problems.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left py-3 px-4 w-16">#</th>
                    <th className="text-left py-3 px-4">Problem</th>
                    <th className="text-left py-3 px-4">Difficulty</th>
                    <th className="text-right py-3 px-4">Points</th>
                    {exam.status !== "SCHEDULED" && <th className="text-right py-3 px-4">Solved By</th>}
                  </tr>
                </thead>
                <tbody>
                  {exam.problems.map((p) => (
                    <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-primary">{p.label}</td>
                      <td className="py-3 px-4">
                        <Link to={`/problems/${p.id}`} className="font-medium hover:text-primary transition-colors">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4"><DifficultyBadge difficulty={p.difficulty} /></td>
                      <td className="py-3 px-4 text-right font-semibold">{p.points}</td>
                      {exam.status !== "SCHEDULED" && <td className="py-3 px-4 text-right text-muted-foreground">{p.solved || 0}</td>}
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

        {exam.rules && (
          <TabsContent value="rules" className="mt-4">
            <div className="glass-card rounded-xl p-6">
              <pre className="whitespace-pre-wrap text-sm">{exam.rules}</pre>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ContestDetailPage;
