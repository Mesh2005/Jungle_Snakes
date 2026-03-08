import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const LoadingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-black via-jungle-900 to-jungle-poison text-white overflow-hidden px-4">
      {/* Glowing background orbs */}
      <div className="pointer-events-none absolute -top-40 -left-32 w-80 h-80 bg-jungle-lime/20 blur-3xl rounded-full animate-pulse-slow" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-96 h-96 bg-jungle-amber/10 blur-3xl rounded-full animate-pulse-slow" />

      <div className="relative flex flex-col items-center space-y-8 z-10">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-3">
            <Leaf className="w-10 h-10 text-jungle-lime animate-bounce" />
            <span className="text-3xl md:text-4xl font-extrabold tracking-widest text-jungle-lime text-shadow-glow">
              JUNGLE SNAKE
            </span>
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-jungle-400">Preparing your adventure</p>
        </div>

        {/* Progress ring + hint */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-jungle-lime/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-t-jungle-lime border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 bg-black/60 rounded-full flex items-center justify-center text-xs text-jungle-300">
              Loading
            </div>
          </div>
          <p className="text-sm text-jungle-300 text-center max-w-xs">
            Sharpening fangs, shaking the jungle trees, and waking the snakes...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;

