"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Zap } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleDemoLogin() {
    setDemoLoading(true);
    setErrors({});
    try {
      const result = await signIn("credentials", {
        email: "demo@demo.com",
        password: "demodemo",
        redirect: false,
      });
      if (result?.error) {
        setErrors({ general: "Demo account unavailable. Please try again later." });
      } else {
        toast.success("Welcome, Hunter. This is a demo account.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setDemoLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Invalid email or password" });
      } else {
        toast.success("Welcome back, Hunter.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center lg:text-left">
        <div className="flex items-center gap-2 mb-6 lg:hidden justify-center">
          <Zap className="h-6 w-6 text-[#00d4ff]" />
          <span className="text-xl font-black tracking-[0.3em] text-[#e2e8f0]">ASCEND</span>
        </div>
        <h2 className="text-3xl font-black text-[#e2e8f0] mb-2">Welcome back</h2>
        <p className="text-[#64748b]">Continue your journey, Hunter.</p>
      </div>

      {/* Demo access */}
      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={demoLoading || loading}
        className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded border border-[#00d4ff]/30 bg-[#00d4ff]/5 text-sm font-semibold text-[#00d4ff] hover:bg-[#00d4ff]/10 hover:border-[#00d4ff]/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className="h-4 w-4" />
        {demoLoading ? "Entering system..." : "Try Demo Account"}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1e2d4a]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-[#050810] text-[#64748b] uppercase tracking-wider">or sign in</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 rounded border border-[#ef4444]/30 bg-[#ef4444]/5 text-sm text-[#ef4444]"
          >
            {errors.general}
          </motion.div>
        )}

        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="hunter@example.com"
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          required
          error={errors.email}
        />

        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          autoComplete="current-password"
          required
          error={errors.password}
        />

        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-[#00d4ff] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          Access System
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#64748b]">
        New hunter?{" "}
        <Link href="/register" className="text-[#00d4ff] hover:underline font-medium">
          Create account
        </Link>
      </p>
    </motion.div>
  );
}
