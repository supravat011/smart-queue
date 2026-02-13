import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Clock, TrendingUp, Users } from 'lucide-react';

const PredictionsPage: React.FC = () => {
  const waitTimeData = [
    { time: '8 AM', wait: 5, customers: 10 },
    { time: '9 AM', wait: 12, customers: 25 },
    { time: '10 AM', wait: 25, customers: 45 },
    { time: '11 AM', wait: 35, customers: 55 },
    { time: '12 PM', wait: 20, customers: 30 },
    { time: '1 PM', wait: 15, customers: 20 },
    { time: '2 PM', wait: 30, customers: 50 },
    { time: '3 PM', wait: 10, customers: 15 },
    { time: '4 PM', wait: 5, customers: 8 },
  ];

  const StatCard = ({ icon: Icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) => (
      <div className="bg-white border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
              <Icon size={20} className="text-brand-600" />
          </div>
          <div className="text-4xl font-serif font-bold text-dark mb-2">{value}</div>
          <div className="text-sm font-light text-gray-600 border-l-2 border-brand-600 pl-3">{sub}</div>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-serif font-bold text-dark">Forecast</h1>
        <p className="text-gray-500 mt-2 font-light">Predictive analytics for optimization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8 mb-12">
        <StatCard icon={Clock} label="Wait Time" value="12m" sub="15% below average" />
        <StatCard icon={TrendingUp} label="Peak Velocity" value="02:00 PM" sub="Avoid for expedited service" />
        <StatCard icon={Users} label="Optimal Entry" value="03:30 PM" sub="Lowest density window" />
      </div>

      <div className="bg-white border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-serif font-bold text-dark">Traffic Volume Analysis</h2>
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500">
                <span className="w-3 h-3 bg-brand-600 mr-2"></span> Predicted Wait
            </div>
        </div>
        
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={waitTimeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D93025" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#D93025" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12, fontFamily: 'Inter'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12, fontFamily: 'Inter'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '0px', border: '1px solid #e5e5e5', boxShadow: 'none', fontFamily: 'Inter' }}
                itemStyle={{ color: '#D93025', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="wait" stroke="#D93025" strokeWidth={2} fillOpacity={1} fill="url(#colorWait)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-dark text-white p-6 flex items-start">
        <div className="mr-4 mt-1">
            <Clock className="text-brand-600" size={24} />
        </div>
        <div>
          <h4 className="font-serif font-bold text-lg mb-1">High Density Alert</h4>
          <p className="text-sm text-gray-400 font-light">
            Algorithmic projection indicates saturation between 10:00 AM and 11:30 AM. Re-routing recommended.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;