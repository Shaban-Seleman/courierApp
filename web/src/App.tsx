import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateOrder from './pages/CreateOrder';
import ProtectedRoute from './components/ProtectedRoute';

import OrdersPage from './pages/OrdersPage';
import CouriersPage from './pages/CouriersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MapPage from './pages/MapPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.theme === 'DARK') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.theme]);

  return (
    <Router>
      <Toaster 
         position="top-right"
         toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
         }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Application Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
                <Sidebar />
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scrollbar-hide">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/orders/new" element={<CreateOrder />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/couriers" element={<CouriersPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/map" element={<MapPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      {/* Add other protected routes here */}
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;