import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateUserProfile, changeUserPassword } from '../store/slices/authSlice';
import { User, Mail, Phone, Lock, Bell, Shield, LogOut, Map, Sun, Moon, Palette, Truck, Settings as SettingsIcon } from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';
import { driverService } from '../services/driverService';
import { systemConfigService, SystemConfig } from '../services/systemConfigService';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'notifications' | 'app_prefs' | 'vehicle' | 'system'>('profile');

    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [appPrefs, setAppPrefs] = useState({
        defaultCity: user?.defaultCity || 'Dar es Salaam',
        defaultLatitude: user?.defaultLatitude || -6.7924,
        defaultLongitude: user?.defaultLongitude || 39.2083,
        theme: user?.theme || 'LIGHT'
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [notifications, setNotifications] = useState({
        email: user?.emailNotifications ?? true,
        sms: user?.smsNotifications ?? false,
        push: user?.pushNotifications ?? true
    });

    // Driver Specific
    const [vehicleData, setVehicleData] = useState({
        vehicleType: '',
        licensePlate: ''
    });

    // Admin Specific
    const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([]);

    useEffect(() => {
        if (activeSection === 'vehicle' && user?.role === 'DRIVER') {
            loadDriverProfile();
        } else if (activeSection === 'system' && user?.role === 'ADMIN') {
            loadSystemConfigs();
        }
    }, [activeSection, user]);

    const loadDriverProfile = async () => {
        try {
            const profile = await driverService.getProfile();
            setVehicleData({
                vehicleType: profile.vehicleType || '',
                licensePlate: profile.licensePlate || ''
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load vehicle details');
        }
    };

    const loadSystemConfigs = async () => {
        try {
            const configs = await systemConfigService.getAllConfigs();
            setSystemConfigs(configs);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load system configurations');
        }
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        toast.success('Logged out successfully');
    };

    const handleUpdateNotification = async (key: 'email' | 'sms' | 'push', value: boolean) => {
        if (!user) return;
        const newNotifications = { ...notifications, [key]: value };
        setNotifications(newNotifications);
        
        try {
             await dispatch(updateUserProfile({ 
                userId: user.id, 
                data: { 
                    emailNotifications: newNotifications.email,
                    smsNotifications: newNotifications.sms,
                    pushNotifications: newNotifications.push
                } 
            })).unwrap();
            toast.success('Notification preferences updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update preferences');
            // Revert state on failure
            setNotifications({ ...notifications, [key]: !value });
        }
    };

    const handleUpdateAppPrefs = async () => {
        if (!user) return;
        try {
            await dispatch(updateUserProfile({ 
                userId: user.id, 
                data: { 
                    defaultCity: appPrefs.defaultCity,
                    defaultLatitude: appPrefs.defaultLatitude,
                    defaultLongitude: appPrefs.defaultLongitude,
                    theme: appPrefs.theme
                } 
            })).unwrap();
            toast.success('Application preferences updated!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update application preferences.');
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            await dispatch(updateUserProfile({ 
                userId: user.id, 
                data: { fullName: profileData.fullName, phone: profileData.phone } 
            })).unwrap();
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile.');
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match!");
            return;
        }
        try {
            await dispatch(changeUserPassword({
                userId: user.id,
                data: { 
                    currentPassword: passwords.current,
                    newPassword: passwords.new,
                    confirmPassword: passwords.confirm
                }
            })).unwrap();
            toast.success('Password changed successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to change password. Please check your current password.');
        }
    };

    const handleUpdateVehicle = async () => {
        try {
            await driverService.updateProfile(vehicleData);
            toast.success('Vehicle details updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update vehicle details');
        }
    };

    const handleUpdateSystemConfig = async (key: string, value: string) => {
        try {
            await systemConfigService.updateConfig(key, value);
            toast.success('Configuration updated');
            // Refresh local state to confirm (optional, could just update optimistic)
            setSystemConfigs(configs => configs.map(c => c.key === key ? { ...c, value } : c));
        } catch (error) {
            console.error(error);
            toast.error('Failed to update configuration');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-3 space-y-2">
                    <button
                        onClick={() => setActiveSection('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeSection === 'profile' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <User size={18} /> Profile
                    </button>
                    
                    {user?.role === 'DRIVER' && (
                        <button
                            onClick={() => setActiveSection('vehicle')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeSection === 'vehicle' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Truck size={18} /> Vehicle Details
                        </button>
                    )}

                    {user?.role === 'ADMIN' && (
                         <button
                            onClick={() => setActiveSection('system')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeSection === 'system' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <SettingsIcon size={18} /> System Config
                        </button>
                    )}

                    <button
                        onClick={() => setActiveSection('app_prefs')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeSection === 'app_prefs' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Palette size={18} /> App Preferences
                    </button>
                    <button
                        onClick={() => setActiveSection('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeSection === 'security' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Lock size={18} /> Security
                    </button>
                    <button
                        onClick={() => setActiveSection('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeSection === 'notifications' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Bell size={18} /> Notifications
                    </button>
                    
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                         <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="md:col-span-9">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                        
                        {/* Profile Section */}
                        {activeSection === 'profile' && (
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-2xl font-bold border-2 border-white dark:border-slate-600 shadow-md">
                                        {user?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.fullName}</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm capitalize">{user?.role?.toLowerCase()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={profileData.fullName}
                                                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                         <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex justify-end">
                                    <button 
                                        onClick={handleUpdateProfile}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Vehicle Details (Driver Only) */}
                        {activeSection === 'vehicle' && user?.role === 'DRIVER' && (
                            <div className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Truck size={20} className="text-blue-500"/> Vehicle Information
                                </h3>
                                
                                <div className="space-y-4">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle Type</label>
                                            <select
                                                value={vehicleData.vehicleType}
                                                onChange={(e) => setVehicleData({...vehicleData, vehicleType: e.target.value})}
                                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                            >
                                                <option value="">Select Vehicle Type</option>
                                                <option value="MOTORCYCLE">Motorcycle</option>
                                                <option value="CAR">Car</option>
                                                <option value="VAN">Van</option>
                                                <option value="TRUCK">Truck</option>
                                                <option value="BICYCLE">Bicycle</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Plate</label>
                                            <input
                                                type="text"
                                                value={vehicleData.licensePlate}
                                                onChange={(e) => setVehicleData({...vehicleData, licensePlate: e.target.value})}
                                                placeholder="e.g. T 123 ABC"
                                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                            />
                                        </div>
                                     </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button 
                                        onClick={handleUpdateVehicle}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Update Vehicle
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* System Configuration (Admin Only) */}
                        {activeSection === 'system' && user?.role === 'ADMIN' && (
                            <div className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <SettingsIcon size={20} className="text-blue-500"/> System Configuration
                                </h3>
                                
                                <div className="space-y-4">
                                    {systemConfigs.length === 0 ? (
                                        <p className="text-slate-500 dark:text-slate-400">Loading configurations...</p>
                                    ) : (
                                        systemConfigs.map((config) => (
                                            <div key={config.key} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-medium text-slate-800 dark:text-white">{config.key.replace(/_/g, ' ').toUpperCase()}</h4>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{config.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={config.value}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            setSystemConfigs(configs => configs.map(c => c.key === config.key ? { ...c, value: newValue } : c));
                                                        }}
                                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateSystemConfig(config.key, config.value)}
                                                        className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* App Preferences Section */}
                        {activeSection === 'app_prefs' && (
                            <div className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Palette size={20} className="text-blue-500"/> Application Preferences
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-slate-700 dark:text-slate-300">Default Map Location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">City Name</label>
                                                <div className="relative">
                                                    <Map size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={appPrefs.defaultCity}
                                                        onChange={(e) => setAppPrefs({...appPrefs, defaultCity: e.target.value})}
                                                        placeholder="e.g., Dar es Salaam"
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                 <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Latitude</label>
                                                    <input
                                                        type="number"
                                                        value={appPrefs.defaultLatitude}
                                                        onChange={(e) => setAppPrefs({...appPrefs, defaultLatitude: parseFloat(e.target.value)})}
                                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Longitude</label>
                                                    <input
                                                        type="number"
                                                        value={appPrefs.defaultLongitude}
                                                        onChange={(e) => setAppPrefs({...appPrefs, defaultLongitude: parseFloat(e.target.value)})}
                                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <h4 className="font-medium text-slate-700 dark:text-slate-300">Theme Preference</h4>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setAppPrefs({...appPrefs, theme: 'LIGHT'})}
                                                className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                                                    appPrefs.theme === 'LIGHT' 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                                                }`}
                                            >
                                                <Sun size={24} />
                                                <span className="font-medium">Light Mode</span>
                                            </button>
                                            <button
                                                onClick={() => setAppPrefs({...appPrefs, theme: 'DARK'})}
                                                className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                                                    appPrefs.theme === 'DARK' 
                                                    ? 'border-slate-800 dark:border-slate-500 bg-slate-800 dark:bg-slate-700 text-white' 
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                                                }`}
                                            >
                                                <Moon size={24} />
                                                <span className="font-medium">Dark Mode</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex justify-end">
                                    <button 
                                        onClick={handleUpdateAppPrefs}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security Section */}
                        {activeSection === 'security' && (
                            <div className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Shield size={20} className="text-blue-500"/> Change Password
                                </h3>
                                
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        onClick={handleChangePassword}
                                        className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
                            <div className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Bell size={20} className="text-blue-500"/> Notification Preferences
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-slate-800 dark:text-white">Email Notifications</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates about your orders via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={notifications.email} onChange={() => handleUpdateNotification('email', !notifications.email)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-slate-800 dark:text-white">SMS Notifications</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates via text message</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={notifications.sms} onChange={() => handleUpdateNotification('sms', !notifications.sms)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-slate-800 dark:text-white">Push Notifications</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive real-time alerts in your browser</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={notifications.push} onChange={() => handleUpdateNotification('push', !notifications.push)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;