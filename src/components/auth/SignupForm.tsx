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
import { PasswordStrength } from "./PasswordStrength";
import { authApi } from "../../api/auth.api";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const signupSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  employeeId: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  password: z.string().regex(passwordRegex, "Password must be at least 8 chars and contain uppercase, lowercase, number, and special character."),
  confirmPassword: z.string(),
  terms: z.boolean().refine(v => v === true, { message: "You must accept the terms & conditions" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" }
  });

  const passwordVal = watch("password");

  const onSubmit = async (data: SignupValues) => {
    try {
      await authApi.register(data);
      toast.success("Account created! Please check your email to verify.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">Create an account</h1>
        <p className="text-sm text-muted-foreground">Enter your details to create your fleet profile</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input {...register("firstName")} className={errors.firstName ? "border-destructive" : ""} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <Input {...register("lastName")} className={errors.lastName ? "border-destructive" : ""} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input type="email" {...register("email")} className={errors.email ? "border-destructive" : ""} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Number</label>
            <Input type="tel" {...register("phone")} className={errors.phone ? "border-destructive" : ""} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Employee ID <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <Input {...register("employeeId")} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
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
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <Input type={showConfirm ? "text" : "password"} {...register("confirmPassword")} className={errors.confirmPassword ? "border-destructive" : ""} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff className="h-4 w-4 text-muted-foreground"/> : <Eye className="h-4 w-4 text-muted-foreground"/>}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <input type="checkbox" id="terms" {...register("terms")} className="mt-1 w-4 h-4 rounded shrink-0 bg-background/50 accent-primary" />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight">
            I accept the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </label>
        </div>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}

        <Button type="submit" variant="premium" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
      </div>

      <GoogleLoginButton loading={isSubmitting} />

      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link to="/login" className="underline underline-offset-4 hover:text-primary transition-colors">
          Login
        </Link>
      </p>
    </div>
  );
}
