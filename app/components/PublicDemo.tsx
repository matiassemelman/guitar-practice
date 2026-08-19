import { DEMO_DATA } from '@/lib/demo-data';

const statCards = [
  { label: 'Current streak', value: `${DEMO_DATA.stats.currentStreak} days` },
  { label: 'This week', value: `${DEMO_DATA.stats.weeklyMinutes} min` },
  { label: 'Average quality', value: `${DEMO_DATA.stats.weeklyAverageQuality}/5` },
  { label: 'Total sessions', value: String(DEMO_DATA.stats.totalSessions) },
];

export default function PublicDemo() {
  return (
    <main className="min-h-screen">
      <div className="max-w-[1440px] mx-auto p-5 md:p-8 space-y-6">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="rounded-full border border-neon-green/50 bg-neon-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-neon-green">
                Public portfolio demo
              </span>
              <span className="text-sm text-gray-400">Read-only · synthetic data</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
              Deliberate Guitar
            </h1>
            <p className="max-w-3xl text-gray-300 text-lg">
              A full-stack practice system that turns focused session history
              into structured analysis and actionable coaching.
            </p>
          </div>
          <a
            href="https://github.com/matiassemelman/guitar-practice"
            className="inline-flex items-center justify-center rounded-lg border border-neon-cyan/60 px-5 py-3 font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/10"
          >
            View source code ↗
          </a>
        </header>

        <section className="glass-card rounded-2xl border-neon-cyan/30 p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['01', 'Capture', 'Log a micro-objective, technical focus and outcome.'],
              ['02', 'Structure', 'Turn session history into a constrained JSON analysis.'],
              ['03', 'Coach', 'Generate feedback from the structured evidence, not raw intuition.'],
            ].map(([number, title, copy]) => (
              <div key={number} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-bold tracking-[0.2em] text-neon-magenta">{number}</p>
                <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm text-gray-400">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 md:p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-neon-cyan">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neon-magenta">Practice history</p>
                <h2 className="mt-1 text-2xl font-semibold">Recent deliberate sessions</h2>
              </div>
              <span className="text-sm text-gray-500">Sample dataset</span>
            </div>

            {DEMO_DATA.sessions.map((session) => (
              <article key={session.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-neon-cyan">
                      {session.date} · {session.focus}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{session.objective}</h3>
                  </div>
                  <div className="rounded-lg border border-neon-magenta/30 bg-neon-magenta/10 px-3 py-2 text-sm text-neon-magenta">
                    {session.duration} min
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <Metric label="Target" value={`${session.target} BPM`} />
                  <Metric label="Achieved" value={`${session.achieved} BPM`} />
                  <Metric label="Quality" value={`${session.quality}/5`} />
                </div>
                <p className="mt-4 border-l-2 border-neon-cyan/40 pl-3 text-sm text-gray-400">
                  {session.reflection}
                </p>
              </article>
            ))}
          </div>

          <div className="space-y-6">
            <section className="glass-card rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-neon-yellow">Today&apos;s habits</p>
              <div className="mt-4 space-y-3">
                {DEMO_DATA.habits.map((habit) => (
                  <div key={habit.label} className="flex items-center justify-between rounded-lg bg-black/30 p-3">
                    <div className="flex items-center gap-3">
                      <span className={habit.done ? 'text-neon-green' : 'text-gray-600'}>
                        {habit.done ? '●' : '○'}
                      </span>
                      <span className="text-gray-200">{habit.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">{habit.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl border-neon-magenta/30 p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-neon-magenta">Two-step AI coaching</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{DEMO_DATA.analysis.headline}</h2>
                </div>
                <span className="text-2xl" aria-hidden="true">✦</span>
              </div>
              <p className="mt-4 text-gray-300">{DEMO_DATA.analysis.summary}</p>
              <div className="mt-5 space-y-2">
                {DEMO_DATA.analysis.evidence.map((item) => (
                  <p key={item} className="flex gap-3 text-sm text-gray-400">
                    <span className="text-neon-cyan">→</span>
                    <span>{item}</span>
                  </p>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-neon-yellow/25 bg-neon-yellow/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neon-yellow">
                  Next experiment
                </p>
                <p className="mt-2 text-sm text-gray-300">{DEMO_DATA.analysis.experiment}</p>
              </div>
            </section>
          </div>
        </section>

        <footer className="border-t border-white/10 py-5 text-sm text-gray-500">
          This public build stores no personal data and makes no database or AI
          requests. The production implementation is available in the source
          repository; the owner tracker runs in a protected environment.
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/30 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-200">{value}</p>
    </div>
  );
}
