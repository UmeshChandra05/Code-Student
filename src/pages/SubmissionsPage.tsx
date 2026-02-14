import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Code2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { getMySubmissions } from "@/lib/api";
import type { Submission } from "@/lib/api";

const SubmissionsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-submissions"],
    queryFn: () => getMySubmissions(),
  });

  // Handle array or object responses
  const submissions: Submission[] = Array.isArray(data) ? data : 
    (data?.submissions || data?.items || []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>

      <div className="glass-card rounded-xl overflow-hidden">
        {submissions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Code2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium mb-1">No submissions yet</p>
            <p className="text-sm">Start solving problems to see your submission history</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left py-3 px-4">Problem</th>
                  <th className="text-left py-3 px-4">Language</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Runtime</th>
                  <th className="text-right py-3 px-4">Memory</th>
                  <th className="text-right py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
            {submissions.map((s, i) => (
              <tr key={s.id} className="border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors scroll-reveal" style={{ animationDelay: `${i * 50}ms` }}>
                <td className="py-3 px-4">
                  <Link
                    to={`/submissions/${s.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {s.problem.title}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground capitalize">{s.language}</td>
                <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                <td className="py-3 px-4 text-right text-sm font-mono">{s.executionTime ? `${s.executionTime}ms` : "—"}</td>
                <td className="py-3 px-4 text-right text-sm font-mono">{s.memoryUsed ? `${s.memoryUsed}MB` : "—"}</td>
                <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                  {new Date(s.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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

export default SubmissionsPage;
