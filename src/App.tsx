import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { DailyVent } from './pages/DailyVent';
import { TriggerMatrix } from './pages/TriggerMatrix';
import { CalmCompanion } from './pages/CalmCompanion';
import { Auth } from './pages/Auth';

const ProtectedRoute = ({ children, requireExam = true }: { children: React.ReactNode, requireExam?: boolean }) => {
  const { user, loading } = useAppContext();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Loading session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireExam && !user.targetExam) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const LandingRedirect = () => {
  const { hasLoggedToday } = useAppContext();
  return hasLoggedToday ? <Navigate to="/dashboard" replace /> : <Navigate to="/daily-vent" replace state={{ remindToLog: true }} />;
};

const AppContent = () => {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Loading app...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/onboarding" element={<ProtectedRoute requireExam={false}><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/daily-vent" element={<ProtectedRoute><DailyVent /></ProtectedRoute>} />
      <Route path="/trigger-matrix" element={<ProtectedRoute><TriggerMatrix /></ProtectedRoute>} />
      <Route path="/calm-companion" element={<ProtectedRoute><CalmCompanion /></ProtectedRoute>} />
      {/* Dynamic Landing Redirect based on daily log status */}
      <Route path="/" element={user ? <LandingRedirect /> : <Navigate to="/auth" replace />} />
      <Route path="*" element={user ? <LandingRedirect /> : <Navigate to="/auth" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
