import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { NoHomeYetPage } from './pages/NoHomeYetPage';
import { TasksPage } from './pages/TasksPage';
import { ScoreBoardPage } from './pages/ScoreBoardPage';
import { CalendarPage } from './pages/CalendarPage';
import { RankingPage } from './pages/RankingPage';
import { RewardsPage } from './pages/RewardsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ManageTasksPage } from './pages/ManageTasksPage';
import { ManageMembersPage } from './pages/ManageMembersPage';
import { PendingInvitesPage } from './pages/PendingInvitesPage';

// Componente para proteger rotas autenticadas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/no-home"
            element={
              <ProtectedRoute>
                <NoHomeYetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/:homeId"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/:homeId/scoreboard"
            element={
              <ProtectedRoute>
                <ScoreBoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/:homeId/manage-tasks"
            element={
              <ProtectedRoute>
                <ManageTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/:homeId/manage-members"
            element={
              <ProtectedRoute>
                <ManageMembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invites"
            element={
              <ProtectedRoute>
                <PendingInvitesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/:homeId/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/:homeId/ranking"
            element={
              <ProtectedRoute>
                <RankingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/:homeId/rewards"
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/:homeId/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
