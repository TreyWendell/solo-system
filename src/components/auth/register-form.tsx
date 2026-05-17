"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, AtSign, Zap } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { registerUser } from "@/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    try {
      const result = await registerUser(formData);

      if (!result.success) {
        setErrors({ general: result.error });
        return;
      }

      // Auto sign in after registration
      const loginResult = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (loginResult?.error) {
        toast.error("Account created but could not sign in. Please log in.");
        router.push("/login");
      } else {
        toast.success("Welcome to the System, Hunter. Your journey begins now.");
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
          <span className="text-xl font-black tracking-[0.3em] text-[#e2e8f0]">SYSTEM</span>
        </div>
        <h2 className="text-3xl font-black text-[#e2e8f0] mb-2">Create Account</h2>
        <p className="text-[#64748b]">Begin your ascent, Hunter.</p>
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
          name="displayName"
          type="text"
          label="Display Name"
          placeholder="Shadow Monarch"
          icon={<User className="h-4 w-4" />}
          autoComplete="name"
          error={errors.displayName}
        />

        <Input
          name="username"
          type="text"
          label="Username"
          placeholder="sung_jinwoo"
          icon={<AtSign className="h-4 w-4" />}
          autoComplete="username"
          required
          error={errors.username}
        />

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
          autoComplete="new-password"
          required
          error={errors.password}
        />

        <p className="text-xs text-[#64748b]">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>

        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          Begin Journey
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#64748b]">
        Already a hunter?{" "}
        <Link href="/login" className="text-[#00d4ff] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
