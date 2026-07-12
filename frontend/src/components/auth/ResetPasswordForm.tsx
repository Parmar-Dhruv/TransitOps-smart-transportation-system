import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { PasswordStrength } from "./PasswordStrength";
import { authApi } from "../../api/auth.api";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const resetSchema = z.object({
  password: z.string().regex(passwordRegex, "Password must be at least 8 chars and contain uppercase, lowercase, number, and special character."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema)
  });

  const passwordVal = watch("password");

  const onSubmit = async (data: ResetValues) => {
    try {
      await authApi.resetPassword(data);
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Create a fresh, secure password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} {...register("password")} className={errors.password ? "border-destructive" : ""} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground"/> : <Eye className="h-4 w-4 text-muted-foreground"/>}
            </button>
          </div>
          <PasswordStrength password={passwordVal} />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm New Password</label>
          <div className="relative">
            <Input type={showConfirm ? "text" : "password"} {...register("confirmPassword")} className={errors.confirmPassword ? "border-destructive" : ""} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff className="h-4 w-4 text-muted-foreground"/> : <Eye className="h-4 w-4 text-muted-foreground"/>}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" variant="premium" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Password
        </Button>
      </form>
    </div>
  );
}
