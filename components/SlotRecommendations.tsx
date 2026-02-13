import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../services/api';
import { Clock, TrendingDown, Calendar, Star } from 'lucide-react';

interface SlotRecommendation {
    slot_id: number;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    booked_count: number;
    score: number;
    reasons: string[];
    congestion_level: string;
    estimated_wait_minutes: number;
}

interface Props {
    slotId?: number;
    serviceId?: number;
    onSelectSlot?: (slotId: number) => void;
}

export const SlotRecommendations: React.FC<Props> = ({ slotId, serviceId, onSelectSlot }) => {
    const [recommendations, setRecommendations] = useState<SlotRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slotId) {
            loadAlternatives();
        } else if (serviceId) {
            loadBestTimes();
        }
    }, [slotId, serviceId]);

    const loadAlternatives = async () => {
        if (!slotId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await recommendationsAPI.getAlternativeSlots(slotId);
            setRecommendations(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadBestTimes = async () => {
        if (!serviceId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await recommendationsAPI.getBestTimes(serviceId);
            setRecommendations(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getCongestionColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'text-green-400';
            case 'MEDIUM': return 'text-yellow-400';
            case 'HIGH': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getCongestionBg = (level: string) => {
        switch (level) {
            case 'LOW': return 'bg-green-500/10 border-green-500/20';
            case 'MEDIUM': return 'bg-yellow-500/10 border-yellow-500/20';
            case 'HIGH': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-gray-500/10 border-gray-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                {error}
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                No recommendations available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
                {slotId ? 'Alternative Slots' : 'Best Times'}
            </h3>

            {recommendations.map((rec, index) => (
                <div
                    key={rec.slot_id}
                    className={`glass-card p-6 border ${getCongestionBg(rec.congestion_level)} hover:border-indigo-500/40 transition-all cursor-pointer group`}
                    onClick={() => onSelectSlot?.(rec.slot_id)}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <Star className="w-6 h-6 text-indigo-400" fill="currentColor" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold">
                                        Score: {(rec.score * 100).toFixed(0)}%
                                    </span>
                                    {index === 0 && (
                                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                                            Best Match
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(rec.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {rec.start_time} - {rec.end_time}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCongestionColor(rec.congestion_level)}`}>
                            {rec.congestion_level}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-gray-400 text-sm">Availability</div>
                            <div className="text-white font-semibold">
                                {rec.capacity - rec.booked_count} / {rec.capacity} slots
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-gray-400 text-sm">Est. Wait Time</div>
                            <div className="text-white font-semibold">
                                {rec.estimated_wait_minutes} min
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {rec.reasons.map((reason, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-white/5 text-gray-300 text-sm rounded-full"
                            >
                                {reason}
                            </span>
                        ))}
                    </div>

                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors">
                            Select This Slot
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
