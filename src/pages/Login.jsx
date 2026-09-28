import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginViaEmailPassword, loginWithGoogle } from "@/lib/firebaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, ArrowLeft, X } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await loginViaEmailPassword(email, password);
      if (user.emailVerified === false) {
        setShowBanner(true);
      } else {
        navigate("/account");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/account");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-o29-ink font-medium hover:underline">
            Create one
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

      {showBanner && (
        <div className="mb-4 p-3 border border-o29-rule bg-o29-bone-2 text-sm text-o29-ink flex items-start justify-between gap-3">
          <span>Please verify your email — check your inbox for the verification link.</span>
          <button onClick={() => setShowBanner(false)} aria-label="Dismiss" className="flex-shrink-0 min-w-11 min-h-11 flex items-center justify-center -m-3">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <p id="login-error" role="alert" className="mb-4 p-3 text-xs text-o29-ink border border-o29-rule bg-o29-bone-2">
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
              aria-describedby={error ? "login-error" : undefined}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="flex min-h-hit items-center text-xs text-o29-ink hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-o29-slate" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              aria-describedby={error ? "login-error" : undefined}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
