import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/api';
import { QueueStatus } from '../components/QueueStatus';
import { Calendar, Clock, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface Appointment {
    id: number;
    booking_reference: string;
    service_id: number;
    slot_id: number;
    queue_position: number;
    estimated_wait_minutes: number;
    status: string;
    created_at: string;
    slot: {
        date: string;
        start_time: string;
        end_time: string;
    };
    service: {
        name: string;
    };
}

const UserDashboard: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<number | null>(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const data = await appointmentsAPI.myBookings();
            setAppointments(data);
        } catch (error) {
            console.error('Failed to load appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        setCancelling(id);
        try {
            await appointmentsAPI.cancel(id);
            await loadAppointments();
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            alert('Failed to cancel appointment');
        } finally {
            setCancelling(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'CANCELLED':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-blue-400" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'CANCELLED':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'COMPLETED':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const upcomingAppointments = appointments.filter(a => a.status === 'CONFIRMED');
    const pastAppointments = appointments.filter(a => a.status !== 'CONFIRMED');

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">My Dashboard</h1>
                    <p className="text-gray-400">Manage your appointments and queue status</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Appointments List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upcoming Appointments */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Upcoming Appointments</h2>
                            {upcomingAppointments.length === 0 ? (
                                <div className="glass-card p-8 text-center">
                                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                    <p className="text-gray-400">No upcoming appointments</p>
                                    <button
                                        onClick={() => window.location.href = '#/booking'}
                                        className="mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="glass-card p-6 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer"
                                            onClick={() => setSelectedAppointment(appointment.id)}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(appointment.status)}
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-white">
                                                            {appointment.service.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-400 font-mono">
                                                            {appointment.booking_reference}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(appointment.slot.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{appointment.slot.start_time} - {appointment.slot.end_time}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                <div className="text-sm text-gray-400">
                                                    Queue Position: <span className="text-white font-semibold">#{appointment.queue_position}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancel(appointment.id);
                                                    }}
                                                    disabled={cancelling === appointment.id}
                                                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm disabled:opacity-50"
                                                >
                                                    {cancelling === appointment.id ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past Appointments */}
                        {pastAppointments.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Past Appointments</h2>
                                <div className="space-y-3">
                                    {pastAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="glass-card p-4 border border-white/5 opacity-75"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(appointment.status)}
                                                    <div>
                                                        <div className="text-white font-semibold">{appointment.service.name}</div>
                                                        <div className="text-sm text-gray-400">
                                                            {new Date(appointment.slot.date).toLocaleDateString()} • {appointment.slot.start_time}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Queue Status */}
                    <div className="space-y-6">
                        {selectedAppointment ? (
                            <QueueStatus
                                appointmentId={selectedAppointment}
                                userId={1} // TODO: Get from auth context
                            />
                        ) : upcomingAppointments.length > 0 ? (
                            <div className="glass-card p-6 text-center">
                                <p className="text-gray-400">Select an appointment to view queue status</p>
                            </div>
                        ) : null}

                        {/* Quick Actions */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.href = '#/booking'}
                                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-semibold"
                                >
                                    Book New Appointment
                                </button>
                                <button
                                    onClick={loadAppointments}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
