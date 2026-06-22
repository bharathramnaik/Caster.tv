import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { I18nProvider } from './i18n/index.jsx';
import Navbar from './components/Navbar';
import SkipToContent from './components/a11y/SkipToContent';

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
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SparkBot from './components/spark/SparkBot';
import BugBoard from './pages/BugBoard';
import AIGenerator from './pages/AIGenerator';
import SceneBuilder from './pages/SceneBuilder';

function AppContent() {
  const location = useLocation();
  const isOverlay = location.pathname.startsWith('/overlay/');

  return (
    <>
      {!isOverlay && <SkipToContent />}
      {!isOverlay && <Navbar />}
      <div id="main-content" tabIndex="-1" className={isOverlay ? 'page-content overlay-mode' : 'page-content'} style={{ outline: 'none' }}>
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
          <Route path="/analytics/advanced" element={<AnalyticsDashboard />} />
          <Route path="/integrations" element={<DataIntegrations />} />
          <Route path="/bugs" element={<BugBoard />} />
          <Route path="/ai-generator" element={<AIGenerator />} />
          <Route path="/scene-builder" element={<SceneBuilder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isOverlay && <SparkBot />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <I18nProvider>
            <Suspense fallback={null}>
              <ParticleBackground />
            </Suspense>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </I18nProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
