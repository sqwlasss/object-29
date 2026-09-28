import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, loginWithGoogle, sendEmailVerification } from "@/lib/firebaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const user = await registerUser({ email, password });
      setRegisteredUser(user);
      setShowVerifyScreen(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await sendEmailVerification(registeredUser);
      toast({
        title: "Verification email sent",
        description: "Check your inbox for the verification link.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  };

  if (showVerifyScreen) {
    return (
      <AuthLayout
        icon={Mail}
        title="Check your inbox"
        subtitle={`We emailed a verification link to ${email}`}
      >
        {error && (
          <p id="register-resend-error" role="alert" className="mb-4 p-3 text-xs text-o29-ink border border-o29-rule bg-o29-bone-2">
            {error}
          </p>
        )}
        <p className="text-sm text-o29-slate text-center">
          Click the link in the email to verify your account, then log in.
        </p>
        <div className="mt-6">
          <Button className="w-full h-12 font-medium" onClick={handleResend} disabled={loading}>
            {loading ? "Sending…" : "Resend email"}
          </Button>
        </div>
        <p className="text-center text-sm text-o29-slate mt-4">
          Already verified?{" "}
          <Link to="/login" className="text-o29-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-o29-ink font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-o29-slate hover:text-o29-ink transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-o29-rule" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-o29-bone px-3 text-o29-slate">or</span>
        </div>
      </div>

      {error && (
        <p id="register-error" role="alert" className="mb-4 p-3 text-xs text-o29-ink border border-o29-rule bg-o29-bone-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-o29-slate" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              aria-describedby={error ? "register-error" : undefined}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-o29-slate" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              aria-describedby={error ? "register-error" : undefined}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-o29-slate" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              aria-describedby={error ? "register-error" : undefined}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
