import { Milk } from "lucide-react";

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "h-8 w-8",
    default: "h-10 w-10",
    large: "h-14 w-14",
  };

  const textClasses = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} rounded-xl bg-primary flex items-center justify-center`}>
        <Milk className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <span className={`font-display font-bold text-foreground ${textClasses[size]}`}>
          Doodh Dairy
        </span>
        {size !== "small" && (
          <span className="text-xs text-muted-foreground">Fresh & Pure</span>
        )}
      </div>
    </div>
  );
}
