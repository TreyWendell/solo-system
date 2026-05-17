import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050810] via-[#0a0f1e] to-[#050810]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(0,212,255,0.15) 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%),
              radial-gradient(circle at 60% 80%, rgba(245,158,11,0.08) 0%, transparent 40%)
            `,
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center glow-cyan-sm">
              <Zap className="h-5 w-5 text-[#00d4ff]" />
            </div>
            <span className="text-2xl font-black tracking-[0.3em] text-[#e2e8f0] glow-text-cyan">
              SYSTEM
            </span>
          </div>

          <div>
            <p className="text-[#00d4ff] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              Self Improvement RPG
            </p>
            <h1 className="text-4xl font-black text-[#e2e8f0] leading-tight mb-6">
              Level up your
              <br />
              <span className="text-[#00d4ff] glow-text-cyan">real life.</span>
            </h1>
            <p className="text-[#64748b] text-lg max-w-md">
              Complete daily quests. Build lasting habits. Watch your stats grow.
              Become the strongest version of yourself.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { stat: "7", label: "Core Stats" },
              { stat: "S", label: "Max Rank" },
              { stat: "∞", label: "Quests" },
            ].map(({ stat, label }) => (
              <div key={label} className="glass rounded-lg p-4 text-center">
                <div className="text-2xl font-black text-[#00d4ff] glow-text-cyan">{stat}</div>
                <div className="text-xs text-[#64748b] mt-1 tracking-wider uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050810]">
        {children}
      </div>
    </div>
  );
}
