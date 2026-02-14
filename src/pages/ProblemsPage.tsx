import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Code2, CheckCircle2, Clock, Bookmark, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DifficultyBadge from "@/components/DifficultyBadge";
import { getProblems } from "@/lib/api";
import type { Problem } from "@/lib/api";

const statusIcon = {
  SOLVED: <CheckCircle2 className="w-4 h-4 text-success" />,
  ATTEMPTED: <Clock className="w-4 h-4 text-warning" />,
  UNSOLVED: <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />,
};

const ProblemsPage = () => {
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data, isLoading, error } = useQuery({
    queryKey: ["problems", diffFilter, statusFilter],
    queryFn: () => getProblems({
      difficulty: diffFilter !== "ALL" ? (diffFilter as any) : undefined,
      status: statusFilter !== "ALL" ? (statusFilter  as any) : undefined,
    }),
  });

  // Handle different response formats - backend might return array or object with problems property
  const problems: Problem[] = useMemo(() => {
    if (!data) return [];
    
    // If it's already an array, use it directly
    if (Array.isArray(data)) return data;
    
    // If it's an object with a problems property (pagination), use that
    if (data && typeof data === 'object' && 'problems' in data && Array.isArray(data.problems)) {
      return data.problems;
    }
    
    // If it's an object with items property (another common pattern)
    if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
      return data.items;
    }
    
    console.error('Unexpected problems data format:', data);
    return [];
  }, [data]);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [problems, search]);

  const stats = useMemo(() => ({
    total: problems.length,
    solved: problems.filter((p) => p.status === "SOLVED").length,
    easy: problems.filter((p) => p.difficulty === "EASY").length,
    medium: problems.filter((p) => p.difficulty === "MEDIUM").length,
    hard: problems.filter((p) => p.difficulty === "HARD").length,
  }), [problems]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
          <p className="text-muted-foreground mt-1">
            {stats.solved}/{stats.total} solved
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="difficulty-easy border px-3 py-1">{stats.easy} Easy</Badge>
          <Badge variant="outline" className="difficulty-medium border px-3 py-1">{stats.medium} Medium</Badge>
          <Badge variant="outline" className="difficulty-hard border px-3 py-1">{stats.hard} Hard</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <div className="flex gap-1.5">
          {["ALL", "EASY", "MEDIUM", "HARD"].map((d) => (
            <Button
              key={d}
              variant={diffFilter === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDiffFilter(d)}
              className="text-xs"
            >
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["ALL", "UNSOLVED", "ATTEMPTED", "SOLVED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="text-xs"
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Problem List */}
      <div className="glass-card rounded-xl overflow-hidden">
        {problems.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Code2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium mb-1">No problems available</p>
            <p className="text-sm">Check back later for coding challenges</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium mb-1">No problems match your filters</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4 w-10">Status</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Tags</th>
                  <th className="text-left py-3 px-4">Difficulty</th>
                  <th className="text-right py-3 px-4">Acceptance</th>
                </tr>
              </thead>
              <tbody>
            {filtered.map((problem, i) => (
              <tr
                key={problem.id}
                className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors scroll-reveal"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className="py-3.5 px-4">{problem.status ? statusIcon[problem.status] : statusIcon.UNSOLVED}</td>
                <td className="py-3.5 px-4">
                  <Link
                    to={`/problems/${problem.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {problem.title}
                  </Link>
                  {problem.module?.name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{problem.module.name}</p>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ backgroundColor: tag.color + "18", color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </td>
                <td className="py-3.5 px-4 text-right text-sm text-muted-foreground">
                  {problem.acceptance ? `${problem.acceptance}%` : "—"}
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default ProblemsPage;
