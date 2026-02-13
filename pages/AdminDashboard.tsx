import React, { useState, useEffect } from 'react';
import { adminAPI, analyticsAPI, servicesAPI, slotsAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, Clock, TrendingUp, Download, Plus } from 'lucide-react';

interface SystemMetrics {
    total_users: number;
    total_appointments: number;
    active_slots: number;
    total_services: number;
    appointments_today: number;
    average_wait_time: number;
    system_load: number;
}

const AdminDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [servicePerformance, setServicePerformance] = useState<any[]>([]);
    const [dailyStats, setDailyStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'services' | 'slots'>('overview');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [metricsData, performanceData, statsData] = await Promise.all([
                adminAPI.getMetrics(),
                analyticsAPI.getServicePerformance(),
                analyticsAPI.getDailyStats(
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    new Date().toISOString().split('T')[0]
                )
            ]);

            setMetrics(metricsData);
            setServicePerformance(performanceData);
            setDailyStats(statsData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = (type: 'service' | 'daily') => {
        const url = type === 'service'
            ? analyticsAPI.exportServicePerformance()
            : analyticsAPI.exportDailyStats(
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                new Date().toISOString().split('T')[0]
            );
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400">Monitor and manage your SmartQueue system</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10">
                    {['overview', 'analytics', 'services', 'slots'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === tab
                                ? 'text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && metrics && (
                    <div className="space-y-8">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                icon={<Users className="w-6 h-6" />}
                                label="Total Users"
                                value={metrics.total_users}
                                color="indigo"
                            />
                            <MetricCard
                                icon={<Calendar className="w-6 h-6" />}
                                label="Total Appointments"
                                value={metrics.total_appointments}
                                color="purple"
                            />
                            <MetricCard
                                icon={<Clock className="w-6 h-6" />}
                                label="Avg Wait Time"
                                value={`${metrics.average_wait_time.toFixed(0)} min`}
                                color="blue"
                            />
                            <MetricCard
                                icon={<TrendingUp className="w-6 h-6" />}
                                label="System Load"
                                value={`${metrics.system_load.toFixed(1)}%`}
                                color="green"
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Daily Stats Chart */}
                            <div className="glass-card p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Daily Bookings (Last 7 Days)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={dailyStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="date" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff20' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="total_bookings" stroke="#6366f1" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Service Performance Chart */}
                            <div className="glass-card p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Service Performance</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={servicePerformance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="service_name" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff20' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="total_bookings" fill="#6366f1" />
                                        <Bar dataKey="utilization_rate" fill="#8b5cf6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => exportReport('service')}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export Service Performance
                                </button>
                                <button
                                    onClick={() => exportReport('daily')}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export Daily Stats
                                </button>
                            </div>
                        </div>

                        {/* Service Performance Table */}
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Service Performance Metrics</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Bookings</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Avg Wait</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Utilization</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Cancellation Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {servicePerformance.map((service, index) => (
                                            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4 text-white">{service.service_name}</td>
                                                <td className="py-3 px-4 text-white">{service.total_bookings}</td>
                                                <td className="py-3 px-4 text-white">{service.average_wait_time.toFixed(0)} min</td>
                                                <td className="py-3 px-4 text-white">{service.utilization_rate.toFixed(1)}%</td>
                                                <td className="py-3 px-4 text-white">{service.cancellation_rate.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <ServiceManagement />
                )}

                {/* Slots Tab */}
                {activeTab === 'slots' && (
                    <SlotManagement />
                )}
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
    icon, label, value, color
}) => {
    const colorClasses = {
        indigo: 'bg-indigo-500/20 text-indigo-400',
        purple: 'bg-purple-500/20 text-purple-400',
        blue: 'bg-blue-500/20 text-blue-400',
        green: 'bg-green-500/20 text-green-400',
    };

    return (
        <div className="glass-card p-6">
            <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <div className="text-gray-400 text-sm mb-1">{label}</div>
            <div className="text-3xl font-bold text-white">{value}</div>
        </div>
    );
};

const ServiceManagement: React.FC = () => {
    const [services, setServices] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await servicesAPI.list(false);
            setServices(data);
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Service Management</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Service
                </button>
            </div>

            <div className="grid gap-4">
                {services.map((service) => (
                    <div key={service.id} className="glass-card p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                            <p className="text-gray-400 mt-1">{service.description}</p>
                            <p className="text-sm text-gray-500 mt-2">Avg Duration: {service.avg_duration_minutes} min</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm ${service.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SlotManagement: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Slot Management</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    Bulk Create Slots
                </button>
            </div>
            <div className="glass-card p-6 text-center text-gray-400">
                Slot management interface coming soon...
            </div>
        </div>
    );
};

export default AdminDashboard;
