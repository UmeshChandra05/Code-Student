import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Code2, CheckCircle2, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DifficultyBadge from "@/components/DifficultyBadge";
import { useProblems } from "@/hooks/useApi";

const statusIcon: Record<string, React.ReactNode> = {
  SOLVED: <CheckCircle2 className="w-4 h-4 text-success" />,
  ATTEMPTED: <Clock className="w-4 h-4 text-warning" />,
  UNSOLVED: <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />,
};

const ProblemsPage = () => {
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useProblems({
    search: search || undefined,
    difficulty: diffFilter !== "ALL" ? diffFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const problems = Array.isArray(data) ? data : data?.problems ?? data?.data ?? [];

  // Group problems by module
  const problemsByModule = useMemo(() => {
    const grouped = new Map<string, any[]>();
    
    problems.forEach((problem: any) => {
      const moduleName = problem.module?.name || "Uncategorized";
      if (!grouped.has(moduleName)) {
        grouped.set(moduleName, []);
      }
      grouped.get(moduleName)!.push(problem);
    });

    // Sort modules alphabetically, but keep "Uncategorized" at the end
    return Array.from(grouped.entries()).sort(([a], [b]) => {
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    });
  }, [problems]);

  const stats = useMemo(() => ({
    total: problems.length,
    solved: problems.filter((p: any) => p.status === "SOLVED").length,
    easy: problems.filter((p: any) => p.difficulty === "EASY").length,
    medium: problems.filter((p: any) => p.difficulty === "MEDIUM").length,
    hard: problems.filter((p: any) => p.difficulty === "HARD").length,
  }), [problems]);

  const toggleModule = (moduleName: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleName)) {
      newExpanded.delete(moduleName);
    } else {
      newExpanded.add(moduleName);
    }
    setExpandedModules(newExpanded);
  };

  const toggleAll = () => {
    if (expandedModules.size === problemsByModule.length) {
      setExpandedModules(new Set());
    } else {
      setExpandedModules(new Set(problemsByModule.map(([name]) => name)));
    }
  };

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
            <Button key={d} variant={diffFilter === d ? "default" : "outline"} size="sm" onClick={() => setDiffFilter(d)} className="text-xs">
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["ALL", "UNSOLVED", "ATTEMPTED", "SOLVED"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className="text-xs">
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={toggleAll} className="text-xs">
          {expandedModules.size === problemsByModule.length ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      {isLoading ? (
        <div className="glass-card rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card rounded-xl p-6 text-center text-destructive">
          <p>Failed to load problems: {(error as Error).message}</p>
        </div>
      ) : problemsByModule.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          <Code2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No problems match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {problemsByModule.map(([moduleName, moduleProblems]) => {
            const isExpanded = expandedModules.has(moduleName);
            const moduleSolved = moduleProblems.filter((p: any) => p.status === "SOLVED").length;
            
            return (
              <div key={moduleName} className="glass-card rounded-xl overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(moduleName)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <h2 className="text-lg font-semibold">{moduleName}</h2>
                    <Badge variant="outline" className="text-xs">
                      {moduleSolved}/{moduleProblems.length} solved
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {moduleProblems.length} {moduleProblems.length === 1 ? "problem" : "problems"}
                  </div>
                </button>

                {/* Module Problems Table */}
                {isExpanded && (
                  <table className="w-full border-t border-border/50">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider bg-background/30">
                        <th className="text-left py-3 px-4 w-10">Status</th>
                        <th className="text-left py-3 px-4">Title</th>
                        <th className="text-left py-3 px-4">Tags</th>
                        <th className="text-left py-3 px-4">Difficulty</th>
                        <th className="text-right py-3 px-4">Acceptance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moduleProblems.map((problem: any) => (
                        <tr
                          key={problem.id}
                          className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors"
                        >
                          <td className="py-3.5 px-4">{statusIcon[problem.status] ?? statusIcon.UNSOLVED}</td>
                          <td className="py-3.5 px-4">
                            <Link to={`/problems/${problem.id}`} className="font-medium hover:text-primary transition-colors">
                              {problem.title}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {(problem.tags ?? []).map((tag: any) => (
                                <span
                                  key={tag.id}
                                  className="px-2 py-0.5 rounded-md text-xs font-medium"
                                  style={{ backgroundColor: (tag.color || "#888") + "18", color: tag.color || "#888" }}
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
                            {problem.acceptance != null ? `${problem.acceptance}%` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;
