import PrivateTracker from '@/app/components/PrivateTracker';
import PublicDemo from '@/app/components/PublicDemo';
import { getAppMode } from '@/lib/app-mode.mjs';

export const dynamic = 'force-dynamic';

export default function Home() {
  const mode = getAppMode();

  if (mode === 'private') {
    return <PrivateTracker />;
  }

  if (mode === 'demo') {
    return <PublicDemo />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="glass-card max-w-xl rounded-2xl p-8 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-neon-yellow mb-3">
          Safe mode
        </p>
        <h1 className="text-3xl font-bold gradient-text mb-4">
          Deliberate Guitar
        </h1>
        <p className="text-gray-300">
          La aplicación está temporalmente deshabilitada porque su modo de
          ejecución no fue configurado.
        </p>
      </section>
    </main>
  );
}
