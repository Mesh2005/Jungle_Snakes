import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoadingPage from './pages/LoadingPage';
import Settings from './pages/Settings';
import VerifyEmail from './pages/VerifyEmail';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { playClickSound } from './utils/clickSound';
import AFKScreen from './components/AFKScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen pt-20 text-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const VerifiedOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, emailVerified, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen pt-20 text-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!emailVerified && !isAdmin) return <Navigate to="/verify-email" replace />;
  return children;
};



const AppContent = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const hideNavbarOn = ['/', '/login', '/signup'];
  const shouldHideNavbar = hideNavbarOn.includes(location.pathname);

  // Play click sound when user taps/clicks a button or link (respects Settings > Sound)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('button, a, [role="button"]');
      if (interactive && !target.closest('input, select, textarea')) {
        playClickSound();
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-[var(--theme-text)] font-sans selection:bg-[var(--theme-selection-bg)] selection:text-[var(--theme-selection-text)] overflow-auto transition-colors duration-300">
      <AFKScreen onAction={() => console.log('User is back!')} />
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/game" element={<VerifiedOnlyRoute><GamePage /></VerifiedOnlyRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/achievements" element={
          <ProtectedRoute>
            <Achievements />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;
