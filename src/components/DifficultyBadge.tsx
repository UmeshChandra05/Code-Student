import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  className?: string;
}

const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border";
  const variants = {
    EASY: "difficulty-easy",
    MEDIUM: "difficulty-medium",
    HARD: "difficulty-hard",
  };

  return (
    <span className={cn(base, variants[difficulty], className)}>
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </span>
  );
};

export default DifficultyBadge;
