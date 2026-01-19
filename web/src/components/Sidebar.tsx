import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Settings, Map, BarChart3, LogOut, PlusCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';

const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const role = user?.role;

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['ADMIN', 'CUSTOMER', 'DRIVER'] },
    { icon: PlusCircle, label: 'New Shipment', path: '/orders/new', roles: ['CUSTOMER'] },
    { icon: Map, label: 'Live Map', path: '/map', roles: ['ADMIN', 'CUSTOMER'] },
    { icon: Package, label: 'Orders', path: '/orders', roles: ['ADMIN', 'CUSTOMER'] },
    { icon: Users, label: 'Couriers', path: '/couriers', roles: ['ADMIN'] },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['ADMIN'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['ADMIN', 'CUSTOMER', 'DRIVER'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          CourierApp
        </h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems
          .filter(item => !item.roles || (role && item.roles.includes(role)))
          .map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
