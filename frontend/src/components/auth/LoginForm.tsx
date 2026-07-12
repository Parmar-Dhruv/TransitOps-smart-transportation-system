import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/auth.api";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false }
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      const res = await authApi.login(data);
      const payload = res.data.data;
      login(payload.token, payload.refreshToken || "mock-refresh", payload.user);
      toast.success("Successfully logged in");
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials";
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Email</label>
          <Input 
            type="email" 
            placeholder="name@example.com" 
            {...register("email")}
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              {...register("password")}
              className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="rememberMe" {...register("rememberMe")} className="rounded border-input bg-background/50 text-primary w-4 h-4 cursor-pointer" />
          <label htmlFor="rememberMe" className="text-sm font-medium cursor-pointer">Remember me</label>
        </div>

        <Button type="submit" variant="premium" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <GoogleLoginButton loading={isSubmitting} />

      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Don't have an account?{" "}
        <Link to="/signup" className="underline underline-offset-4 hover:text-primary transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
