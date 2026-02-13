import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/api';
import { connectToUser } from '../services/websocket';
import { Users, Clock, TrendingUp, CheckCircle } from 'lucide-react';

interface QueueStatus {
    appointment_id: number;
    booking_reference: string;
    queue_position: number;
    total_in_queue: number;
    estimated_wait_minutes: number;
    status: string;
}

interface Props {
    appointmentId: number;
    userId?: number;
}

export const QueueStatus: React.FC<Props> = ({ appointmentId, userId }) => {
    const [queueData, setQueueData] = useState<QueueStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadQueueStatus();

        // Connect to WebSocket for real-time updates
        if (userId) {
            connectToUser(userId).then(ws => {
                const unsubscribe = ws.onMessage((data) => {
                    if (data.type === 'appointment_update' && data.appointment_id === appointmentId) {
                        // Update queue position in real-time
                        setQueueData(prev => prev ? {
                            ...prev,
                            queue_position: data.queue_position,
                            status: data.status
                        } : null);
                    }
                });

                return () => unsubscribe();
            });
        }
    }, [appointmentId, userId]);

    const loadQueueStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await appointmentsAPI.getQueueStatus(appointmentId);
            setQueueData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (error || !queueData) {
        return (
            <div className="glass-card p-6 border border-red-500/20">
                <p className="text-red-400">{error || 'Failed to load queue status'}</p>
            </div>
        );
    }

    const progressPercentage = ((queueData.total_in_queue - queueData.queue_position) / queueData.total_in_queue) * 100;

    return (
        <div className="glass-card p-6 border border-indigo-500/20">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Queue Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${queueData.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                    {queueData.status}
                </span>
            </div>

            <div className="space-y-6">
                {/* Position Indicator */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Your Position</span>
                        <span className="text-white font-semibold">
                            {queueData.queue_position} of {queueData.total_in_queue}
                        </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            <span className="text-gray-400 text-sm">People Ahead</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {queueData.queue_position - 1}
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            <span className="text-gray-400 text-sm">Est. Wait</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {queueData.estimated_wait_minutes} min
                        </div>
                    </div>
                </div>

                {/* Booking Reference */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Booking Reference</div>
                    <div className="text-white font-mono font-semibold text-lg">
                        {queueData.booking_reference}
                    </div>
                </div>

                {/* Live Update Indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live updates enabled</span>
                </div>
            </div>
        </div>
    );
};
