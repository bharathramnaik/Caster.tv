import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import Navbar from './components/Navbar';

const ParticleBackground = lazy(() => import('./components/three/ParticleBackground'));
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateMatch from './pages/CreateMatch';
import ControlPanel from './pages/ControlPanel';
import Overlay from './pages/Overlay';
import Scoreboard from './pages/Scoreboard';
import Teams from './pages/Teams';
import PointsTable from './pages/PointsTable';
import NotFound from './pages/NotFound';
import TemplateEditor from './components/TemplateEditor';
import SceneManager from './components/SceneManager';
import LiveControlPanel from './components/LiveControlPanel';
import TemplateLibrary from './pages/TemplateLibrary';
import DataIntegrations from './pages/DataIntegrations';
import ProductionSwitcher from './pages/ProductionSwitcher';
import StreamingDashboard from './pages/StreamingDashboard';
import Analytics from './pages/Analytics';
import SparkBot from './components/spark/SparkBot';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={null}>
            <ParticleBackground />
          </Suspense>
          <BrowserRouter>
            <Navbar />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/match/new" element={<CreateMatch />} />
                <Route path="/control/:matchId" element={<ControlPanel />} />
                <Route path="/overlay/:matchId" element={<Overlay />} />
                <Route path="/score/:matchId" element={<Scoreboard />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/points" element={<PointsTable />} />
                <Route path="/editor" element={<TemplateEditor />} />
                <Route path="/editor/:templateId" element={<TemplateEditor />} />
                <Route path="/scenes" element={<SceneManager />} />
                <Route path="/scenes/:sceneId" element={<SceneManager />} />
                <Route path="/live" element={<LiveControlPanel />} />
                <Route path="/library" element={<TemplateLibrary />} />
                <Route path="/switcher" element={<ProductionSwitcher />} />
                <Route path="/streaming" element={<StreamingDashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/integrations" element={<DataIntegrations />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <SparkBot />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
