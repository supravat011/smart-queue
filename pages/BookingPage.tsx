import React, { useState } from 'react';
import { User, MOCK_SLOTS, TimeSlot, SlotStatus, SERVICES } from '../types';
import { generateSmartTips } from '../services/geminiService';
import { CheckCircle, Sparkles, ArrowRight, Calendar } from 'lucide-react';

interface BookingPageProps {
  user: User;
}

const BookingPage: React.FC<BookingPageProps> = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>(SERVICES[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [smartTip, setSmartTip] = useState<string>('');
  const [loadingTip, setLoadingTip] = useState(false);

  const getSlotStyles = (status: SlotStatus, isSelected: boolean) => {
    if (status === SlotStatus.FULL) return 'bg-gray-50 text-gray-300 border-transparent cursor-not-allowed';
    if (isSelected) return 'bg-primary text-white border-primary shadow-md transform scale-[1.02]';
    if (status === SlotStatus.CROWDED) return 'bg-white text-navy border-gray-100 hover:border-primary hover:shadow-sm';
    return 'bg-white text-navy border-gray-100 hover:border-primary hover:shadow-sm'; // Available
  };

  const handleSlotSelect = async (slot: TimeSlot) => {
    if (slot.status === SlotStatus.FULL) return;

    setSelectedSlot(slot);
    setLoadingTip(true);
    setSmartTip('');

    if (slot.status === SlotStatus.CROWDED) {
      const suggestion = MOCK_SLOTS.find(s => s.status === SlotStatus.AVAILABLE && parseInt(s.id) > parseInt(slot.id));
      const basicTip = suggestion
        ? `Suggestion: ${suggestion.time} has lower volume.`
        : "High volume time.";
      setSmartTip(basicTip);
      generateSmartTips(slot, MOCK_SLOTS).then(tip => setSmartTip(tip));
    } else {
      setSmartTip("Optimal choice detected.");
    }
    setLoadingTip(false);
  };

  const handleConfirm = () => {
    setBookingConfirmed(true);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-background">
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-8 text-navy shadow-lg">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-3xl font-bold text-navy mb-4">Booking Confirmed</h2>
          <p className="text-gray-500 mb-8 font-medium">Your appointment for <span className="font-bold text-navy">{selectedService}</span> at <span className="font-bold text-navy">{selectedSlot?.time}</span> is secured.</p>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 text-sm">
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Reference ID</span>
            <span className="font-mono text-2xl text-primary font-bold tracking-wider">BK-{Math.floor(Math.random() * 10000)}</span>
          </div>
          <button
            onClick={() => {
              setBookingConfirmed(false);
              setSelectedSlot(null);
            }}
            className="w-full bg-navy text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors"
          >
            New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 bg-background min-h-screen">
      <div className="mb-12 border-b border-gray-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-navy mb-4">New Appointment</h1>
          <p className="text-gray-600 max-w-2xl font-medium">Configure your visit parameters below. Our system actively monitors slot density to suggest the most efficient time.</p>
        </div>
        <div className="flex items-center space-x-2 text-primary bg-blue-50 px-4 py-2 rounded-full">
          <Calendar size={18} />
          <span className="font-bold text-sm">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Service Type</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-navy focus:ring-1 focus:ring-primary focus:border-primary transition-colors appearance-none font-medium"
            >
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Preferred Date</label>
            <input
              type="date"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-navy focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-medium"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Smart Insight Box */}
          <div className={`p-6 rounded-2xl border transition-colors ${selectedSlot ? 'border-accent bg-accent/10' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles size={16} className={selectedSlot ? "text-navy" : "text-gray-400"} />
              <span className={`text-xs font-bold uppercase tracking-widest ${selectedSlot ? "text-navy" : "text-gray-400"}`}>AI Analysis</span>
            </div>
            <p className={`text-sm font-medium ${selectedSlot ? "text-navy" : "text-gray-500"}`}>
              {!selectedSlot ? "Select a time slot to see traffic predictions." : (loadingTip ? "Analyzing..." : `"${smartTip}"`)}
            </p>
          </div>
        </div>

        {/* Right Panel: Slots */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-navy">Available Times</h3>
            <div className="flex space-x-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span className="flex items-center"><span className="w-2 h-2 bg-white border border-gray-300 rounded-full mr-2"></span> Open</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-2"></span> Selected</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-gray-100 rounded-full mr-2"></span> Full</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MOCK_SLOTS.map((slot) => (
              <button
                key={slot.id}
                disabled={slot.status === SlotStatus.FULL}
                onClick={() => handleSlotSelect(slot)}
                className={`
                    p-6 border rounded-xl text-left transition-all duration-200 relative group
                    ${getSlotStyles(slot.status, selectedSlot?.id === slot.id)}
                  `}
              >
                <span className="block font-bold text-lg mb-1">{slot.time}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{slot.status}</span>

                {slot.status !== SlotStatus.FULL && (
                  <div className="absolute bottom-4 right-4 w-8 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${selectedSlot?.id === slot.id ? 'bg-white' : 'bg-primary'} opacity-40`}
                      style={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                    ></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-12 flex justify-end border-t border-gray-200 pt-8">
            <button
              disabled={!selectedSlot}
              onClick={handleConfirm}
              className={`
                  flex items-center px-10 py-4 font-bold uppercase tracking-widest text-sm rounded-full transition-all shadow-lg
                  ${selectedSlot
                  ? 'bg-primary text-white hover:bg-navy hover:shadow-xl transform hover:-translate-y-1'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}
                `}
            >
              Confirm Appointment <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;