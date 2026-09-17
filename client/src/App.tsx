import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import Result from './pages/Result';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import HowItWorks from './pages/HowItWorks';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyzer />} />
            <Route path="/result" element={<Result />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            {/* Fallback */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <div className="text-6xl mb-4">🌿</div>
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Page Not Found</h2>
                <p className="text-[var(--color-text-muted)] mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary animate-pulse-glow">Go Home</a>
              </div>
            } />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#334155',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#059669', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  );
}
