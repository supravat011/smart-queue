import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, Download } from 'lucide-react';
import { generateSmartAnalysis } from '../services/geminiService';

const AnalyticsPage: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Mock Data
  const dailyData = [
    { name: 'Mon', visits: 120 },
    { name: 'Tue', visits: 150 },
    { name: 'Wed', visits: 180 },
    { name: 'Thu', visits: 140 },
    { name: 'Fri', visits: 200 },
    { name: 'Sat', visits: 90 },
    { name: 'Sun', visits: 60 },
  ];

  const slotUsageData = [
    { name: '9 AM', booked: 85 },
    { name: '10 AM', booked: 100 },
    { name: '11 AM', booked: 95 },
    { name: '12 PM', booked: 60 },
    { name: '2 PM', booked: 90 },
    { name: '3 PM', booked: 70 },
    { name: '4 PM', booked: 40 },
  ];

  const pieData = [
    { name: 'General', value: 400 },
    { name: 'VIP', value: 50 },
    { name: 'Senior', value: 100 },
  ];

  const COLORS = ['#1a1a1a', '#D93025', '#9ca3af'];

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    const summary = await generateSmartAnalysis({ dailyData, slotUsageData });
    setAiAnalysis(summary);
    setLoadingAi(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-200 pb-8">
        <div>
           <h1 className="text-4xl font-serif font-bold text-dark">Data Intelligence</h1>
           <p className="text-gray-500 mt-2 font-light">Performance metrics and predictive reports.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
             <button 
                onClick={handleGenerateReport}
                disabled={loadingAi}
                className="flex items-center space-x-2 bg-brand-600 text-white px-6 py-3 hover:bg-dark transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-70"
            >
                <Sparkles size={16} />
                <span>{loadingAi ? 'Processing...' : 'Generate Report'}</span>
            </button>
            <button className="flex items-center space-x-2 border border-dark text-dark px-6 py-3 hover:bg-dark hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                <Download size={16} />
                <span>Export</span>
            </button>
        </div>
      </div>

      {/* AI Report Section */}
      {aiAnalysis && (
        <div className="mb-12 bg-white border border-brand-200 p-8 shadow-[4px_4px_0px_0px_rgba(217,48,37,0.1)]">
           <h3 className="flex items-center text-sm font-bold uppercase tracking-widest text-brand-600 mb-4">
             <Sparkles size={16} className="mr-2" /> Executive Summary
           </h3>
           <div className="font-serif text-lg leading-relaxed text-dark max-w-4xl">
             {aiAnalysis}
           </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Traffic */}
        <div className="bg-white p-8 border border-gray-200">
          <h3 className="text-xl font-serif font-bold text-dark mb-8">Weekly Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontFamily: 'Inter', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontFamily: 'Inter', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f9f9f9'}} contentStyle={{ borderRadius: '0px', border: '1px solid #ddd', fontFamily: 'Inter' }} />
                <Bar dataKey="visits" fill="#1a1a1a" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Slot Usage */}
        <div className="bg-white p-8 border border-gray-200">
           <h3 className="text-xl font-serif font-bold text-dark mb-8">Peak Hour Distribution</h3>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={slotUsageData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontFamily: 'Inter', fontSize: 12}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontFamily: 'Inter', fontSize: 12}} />
                 <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #ddd', fontFamily: 'Inter' }} />
                 <Line type="monotone" dataKey="booked" stroke="#D93025" strokeWidth={3} dot={{r: 4, fill: '#D93025', strokeWidth: 0}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Demographics */}
        <div className="bg-white p-8 border border-gray-200 lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 className="text-xl font-serif font-bold text-dark mb-4">Demographic Split</h3>
                    <p className="text-gray-500 font-light mb-8">Analysis of user base composition allows for better resource allocation for priority groups.</p>
                    <div className="space-y-4">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 mr-3" style={{backgroundColor: COLORS[index]}}></div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-dark">{entry.name}</span>
                                </div>
                                <span className="font-mono text-gray-500">{entry.value} users</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="h-72 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #ddd', fontFamily: 'Inter' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;