import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DifficultyBadge from "@/components/DifficultyBadge";
import { getBookmarks, removeBookmark } from "@/lib/api";
import type { Bookmark as BookmarkType } from "@/lib/api";
import { toast } from "sonner";

const BookmarksPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });

  // Backend returns: { bookmarks: [...], pagination: {...} }
  const bookmarks: BookmarkType[] = Array.isArray(data) ? data : 
    (data?.bookmarks || []);

  const deleteMutation = useMutation({
    mutationFn: (problemId: string) => removeBookmark(problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmark removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove bookmark");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Bookmark className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
      </div>

      {bookmarks.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No bookmarks yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {bookmarks.map((b, i) => (
            <div key={b.id} className="glass-card rounded-xl p-4 flex items-center justify-between hover-lift scroll-reveal" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-4">
                <DifficultyBadge difficulty={b.difficulty} />
                <div>
                  <Link to={`/problems/${b.id}`} className="font-medium hover:text-primary transition-colors">
                    {b.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.tags.length > 0 ? b.tags.join(', ') : 'No tags'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive"
                onClick={() => deleteMutation.mutate(b.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
