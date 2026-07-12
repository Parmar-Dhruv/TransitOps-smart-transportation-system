import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { authApi } from "../../api/auth.api";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotValues) => {
    try {
      await authApi.forgotPassword(data.email);
      toast.success("Password reset link has been sent.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Check your email</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          We've sent a password reset link to your email address. Please click the link to reset your password.
        </p>
        <Link to="/login" className="w-full mt-4">
          <Button variant="outline" className="w-full">Return to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we will send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Email Address</label>
          <Input 
            type="email" 
            placeholder="name@example.com" 
            {...register("email")}
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" variant="premium" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link to="/login" className="text-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to login
        </Link>
      </div>
    </div>
  );
}
