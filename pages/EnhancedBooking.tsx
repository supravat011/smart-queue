import React, { useState, useEffect } from 'react';
import { servicesAPI, slotsAPI, appointmentsAPI, predictionsAPI } from '../services/api';
import { SlotRecommendations } from '../components/SlotRecommendations';
import { connectToSlots } from '../services/websocket';
import { Calendar, Clock, Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface Service {
    id: number;
    name: string;
    description: string;
    avg_duration_minutes: number;
}

interface Slot {
    id: number;
    service_id: number;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    booked_count: number;
    status: string;
}

interface Prediction {
    predicted_wait_minutes: number;
    congestion_score: number;
    confidence: number;
}

const EnhancedBooking: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [booking, setBooking] = useState<{ success: boolean; reference?: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadServices();

        // Connect to slots WebSocket for real-time updates (optional)
        connectToSlots()
            .then(ws => {
                ws.onMessage((data) => {
                    if (data.type === 'slot_update') {
                        // Update slot in real-time
                        setSlots(prev => prev.map(slot =>
                            slot.id === data.slot_id
                                ? { ...slot, ...data.data }
                                : slot
                        ));
                    }
                });
            })
            .catch(err => {
                console.warn('WebSocket connection failed (non-critical):', err);
                // Continue without WebSocket - polling will still work
            });
    }, []);

    useEffect(() => {
        if (selectedService) {
            loadSlots();
        }
    }, [selectedService, selectedDate]);

    useEffect(() => {
        if (selectedSlot) {
            loadPrediction();
        }
    }, [selectedSlot]);

    const loadServices = async () => {
        try {
            const data = await servicesAPI.list();
            setServices(data);
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    };

    const loadSlots = async () => {
        if (!selectedService) return;
        setLoading(true);
        console.log('[Booking] Loading slots for:', { service_id: selectedService, date: selectedDate });
        try {
            const data = await slotsAPI.list({
                service_id: selectedService,
                date: selectedDate,
                status: 'AVAILABLE'
            });
            console.log('[Booking] Slots loaded:', data.length, 'slots');
            setSlots(data);
        } catch (error) {
            console.error('Failed to load slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPrediction = async () => {
        if (!selectedSlot) return;
        try {
            const data = await predictionsAPI.getSlotPrediction(selectedSlot);
            setPrediction(data);
        } catch (error) {
            console.error('Failed to load prediction:', error);
        }
    };

    const handleBooking = async () => {
        if (!selectedSlot || !selectedService) return;
        setLoading(true);
        try {
            const result: any = await appointmentsAPI.book({
                slot_id: selectedSlot,
                service_id: selectedService
            });
            setBooking({ success: true, reference: result.booking_reference });
        } catch (error: any) {
            setBooking({ success: false });
            // If slot is full, show recommendations
            if (error.message.includes('full')) {
                setShowRecommendations(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const getCongestionColor = (score: number) => {
        if (score < 0.4) return 'text-green-400';
        if (score < 0.7) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'CROWDED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'FULL': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (booking?.success) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-400 mb-6">Your appointment has been successfully booked.</p>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-6">
                        <div className="text-sm text-gray-400 mb-1">Booking Reference</div>
                        <div className="text-xl font-mono font-bold text-white">{booking.reference}</div>
                    </div>
                    <button
                        onClick={() => window.location.href = '#/dashboard'}
                        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                    >
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Book Appointment</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Selection */}
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Select Service</h3>
                            <div className="grid gap-3">
                                {services.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => {
                                            setSelectedService(service.id);
                                            setSelectedSlot(null);
                                            setShowRecommendations(false);
                                        }}
                                        className={`p-4 rounded-lg border-2 transition-all text-left ${selectedService === service.id
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : 'border-white/10 hover:border-white/20 bg-white/5'
                                            }`}
                                    >
                                        <div className="font-semibold text-white">{service.name}</div>
                                        <div className="text-sm text-gray-400 mt-1">{service.description}</div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            Duration: {service.avg_duration_minutes} min
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Selection */}
                        {selectedService && (
                            <div className="glass-card p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Select Date</h3>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        )}

                        {/* Slot Selection */}
                        {selectedService && slots.length > 0 && (
                            <div className="glass-card p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Available Time Slots</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            onClick={() => setSelectedSlot(slot.id)}
                                            disabled={slot.status === 'FULL'}
                                            className={`p-4 rounded-lg border-2 transition-all ${selectedSlot === slot.id
                                                ? 'border-indigo-500 bg-indigo-500/10'
                                                : slot.status === 'FULL'
                                                    ? 'border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed'
                                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-white">
                                                    {slot.start_time} - {slot.end_time}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">
                                                    {slot.capacity - slot.booked_count} / {slot.capacity} available
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(slot.status)}`}>
                                                    {slot.status}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {showRecommendations && selectedSlot && (
                            <div className="glass-card p-6">
                                <SlotRecommendations
                                    slotId={selectedSlot}
                                    onSelectSlot={(id) => {
                                        setSelectedSlot(id);
                                        setShowRecommendations(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Summary & Prediction */}
                    <div className="space-y-6">
                        {/* Booking Summary */}
                        <div className="glass-card p-6 sticky top-8">
                            <h3 className="text-xl font-bold text-white mb-4">Booking Summary</h3>

                            {selectedService && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-400">Service</div>
                                        <div className="text-white font-semibold">
                                            {services.find(s => s.id === selectedService)?.name}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400">Date</div>
                                        <div className="text-white font-semibold">
                                            {new Date(selectedDate).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {selectedSlot && (
                                        <div>
                                            <div className="text-sm text-gray-400">Time</div>
                                            <div className="text-white font-semibold">
                                                {slots.find(s => s.id === selectedSlot)?.start_time} -
                                                {slots.find(s => s.id === selectedSlot)?.end_time}
                                            </div>
                                        </div>
                                    )}

                                    {selectedSlot && prediction && (
                                        <div className="border-t border-white/10 pt-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Est. Wait Time</span>
                                                <span className="text-white font-semibold">
                                                    {prediction.predicted_wait_minutes} min
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Congestion</span>
                                                <span className={`font-semibold ${getCongestionColor(prediction.congestion_score)}`}>
                                                    {(prediction.congestion_score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Confidence</span>
                                                <span className="text-white font-semibold">
                                                    {(prediction.confidence * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {!loading && slots.length === 0 && (
                                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                            <p className="text-yellow-200 text-sm text-center">
                                                No time slots available for this date.
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleBooking}
                                        disabled={loading || !selectedSlot}
                                        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold mt-4"
                                    >
                                        {loading ? 'Booking...' : !selectedSlot ? 'Select a Time Slot' : 'Confirm Booking'}
                                    </button>

                                    {selectedSlot && (
                                        <button
                                            onClick={() => setShowRecommendations(!showRecommendations)}
                                            className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm"
                                        >
                                            {showRecommendations ? 'Hide' : 'Show'} Recommendations
                                        </button>
                                    )}
                                </div>
                            )}

                            {!selectedService && (
                                <p className="text-gray-400 text-center py-8">
                                    Select a service to begin
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedBooking;
