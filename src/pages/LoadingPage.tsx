import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Zap } from 'lucide-react';

const LoadingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--theme-bg-base)] relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 loader-noise-bg pointer-events-none" aria-hidden />

      {/* Moving horizontal lines (longfazers) */}
      <div className="loader-longfazers" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* Loader container – centered character-like spinner */}
      <div className="relative w-full max-w-2xl h-[380px] flex items-center justify-center">
        <div className="loader-speeder" role="status" aria-label="Loading">
          <span>
            <span />
            <span />
            <span />
            <span />
          </span>
          <div className="base">
            <span />
            <div className="face" />
          </div>
        </div>
      </div>

      {/* Centered content */}
      <div className="z-20 text-center mt-6 space-y-4 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-[var(--theme-text)] uppercase animate-pulse">
          Preparing your adventure
        </h1>
        <p className="text-[var(--theme-text-dim)] text-xs sm:text-sm font-light tracking-widest uppercase">
          Sharpening fangs, shaking the jungle trees…
        </p>

        {/* Progress bar */}
        <div className="w-56 sm:w-64 h-1 rounded-full mx-auto mt-10 overflow-hidden bg-[var(--theme-surface)] border border-[var(--theme-border)]">
          <div
            className="h-full w-1/3 rounded-full bg-[var(--theme-accent)] loader-progress-bar"
            aria-hidden
          />
        </div>
      </div>

      {/* Decorative corner – bottom left */}
      <div className="absolute bottom-8 left-6 sm:left-10 flex flex-col items-start space-y-1.5 opacity-50">
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-[var(--theme-text)] uppercase">
          <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)]" aria-hidden />
          Systems nominal
        </div>
        <div className="text-[10px] text-[var(--theme-text-dim)] uppercase tracking-tighter">
          Jungle Snake // Loading
        </div>
      </div>

      {/* Decorative corner – top right */}
      <div className="absolute top-8 right-6 sm:right-10 text-right opacity-50">
        <Cpu className="w-6 h-6 text-[var(--theme-accent)] mb-1 mx-auto sm:mx-0 sm:ml-auto block" aria-hidden />
        <div className="text-[10px] font-semibold text-[var(--theme-text)] uppercase tracking-widest">
          Latency: 14ms
        </div>
      </div>

      {/* Brand corner – top left */}
      <div className="absolute top-8 left-6 sm:left-10">
        <Link
          to="/"
          className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] rounded"
          aria-label="Jungle Snake home"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-[var(--theme-accent)] text-[var(--theme-bg-base)] rounded transition-transform group-hover:scale-110 group-focus-visible:scale-110">
            <Zap className="w-4 h-4" aria-hidden />
          </div>
          <span className="font-bold text-lg tracking-tighter text-[var(--theme-text)]">Jungle Snake</span>
        </Link>
      </div>
    </div>
  );
};

export default LoadingPage;
