import * as React from "react";
import { cn } from "../../lib/utils";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const getStrengthWord = () => {
    if (password.length === 0) return "";
    if (score <= 2) return "Weak";
    if (score <= 4) return "Fair";
    return "Strong";
  };

  const getBarColor = (index: number) => {
    if (score < index + 1) return "bg-white/10 dark:bg-white/5"; // Unfilled
    if (score <= 2) return "bg-destructive"; // Red
    if (score <= 4) return "bg-primary"; // Primary color / blueish
    return "bg-emerald-500"; // Green
  };

  return (
    <div className="w-full space-y-1.5 mt-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Password strength</span>
        <span className="font-medium">{getStrengthWord()}</span>
      </div>
      <div className="flex gap-1.5 h-1.5 w-full">
        <div className={cn("h-full flex-1 rounded-full transition-colors duration-300", getBarColor(0))} />
        <div className={cn("h-full flex-1 rounded-full transition-colors duration-300", getBarColor(1))} />
        <div className={cn("h-full flex-1 rounded-full transition-colors duration-300", getBarColor(2))} />
        <div className={cn("h-full flex-1 rounded-full transition-colors duration-300", getBarColor(3))} />
        <div className={cn("h-full flex-1 rounded-full transition-colors duration-300", getBarColor(4))} />
      </div>
    </div>
  );
}
