import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {

  return (
    <Router>
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
              <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
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