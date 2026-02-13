import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, ArrowUpRight, Cpu, Zap, Activity } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col bg-background min-h-screen text-white overflow-hidden">

      {/* Hero Section - Immersive Typography */}
      <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-64">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-fluid"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-fluid" style={{ animationDelay: '-5s' }}></div>

        <div className="w-full px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-start max-w-5xl">
            <h1 className="text-7xl md:text-9xl font-display font-bold leading-[0.85] tracking-tighter mb-12">
              FUTURE <br />
              <span className="text-gradient">FLOW</span> STATE
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl leading-relaxed mb-16">
              Intelligent queue management powered by predictive neural networks.
              Optimizing physical traffic in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">INITIALIZE SYSTEM</span>
                <div className="absolute inset-0 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
              </Link>

              <Link
                to="/login"
                className="group px-8 py-4 border border-white/20 rounded-full text-lg font-bold hover:bg-white/5 transition-colors flex items-center"
              >
                ACCESS PORTAL <ArrowUpRight className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker / Marquee */}
      <div className="border-y border-white/5 bg-black/50 backdrop-blur-sm overflow-hidden py-4">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap text-xs font-mono text-gray-500 tracking-[0.2em]">
          <span>/// OPTIMIZING TRAFFIC FLOW</span>
          <span>/// REDUCING WAIT TIME BY 45%</span>
          <span>/// AI MODEL CONFIDENCE: 98.4%</span>
          <span>/// SECURE ENCRYPTED DATA</span>
          <span>/// GLOBAL INFRASTRUCTURE</span>
          <span>/// OPTIMIZING TRAFFIC FLOW</span>
          <span>/// REDUCING WAIT TIME BY 45%</span>
        </div>
      </div>

      {/* Features - Grid Based */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="glass-card p-8 rounded-3xl h-full flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <h3 className="text-3xl font-display font-semibold mb-4 text-white">Neural<br />Analysis</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Real-time processing of crowd density using advanced computer vision and sensor fusion algorithms.</p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center text-xs font-mono text-gray-500">
                <span>MODULE_01</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-8 rounded-3xl h-full flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-8 text-secondary group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <h3 className="text-3xl font-display font-semibold mb-4 text-white">Instant<br />Allocation</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Dynamic slot assignment that adapts to real-time service velocity and staff availability.</p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center text-xs font-mono text-gray-500">
                <span>MODULE_02</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-8 rounded-3xl h-full flex flex-col justify-between group md:col-span-2 lg:col-span-1">
              <div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-8 text-accent group-hover:scale-110 transition-transform">
                  <Cpu size={24} />
                </div>
                <h3 className="text-3xl font-display font-semibold mb-4 text-white">Predictive<br />Modelling</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Forecasting future demand patterns to proactively manage resources before congestion occurs.</p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center text-xs font-mono text-gray-500">
                <span>MODULE_03</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Large Visual Section */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-[2rem] overflow-hidden bg-surface border border-white/5 h-[600px] group">
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
              alt="Cyberpunk City"
              className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-12 lg:p-20 max-w-3xl">
              <h2 className="text-5xl md:text-7xl font-display font-bold mb-6">Redefining<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Urban Flow.</span></h2>
              <p className="text-lg text-gray-300 mb-8 max-w-xl">
                We are building the infrastructure for the efficient cities of tomorrow. Join the network.
              </p>
              <Link to="/register" className="inline-flex items-center space-x-2 text-white border-b border-primary pb-1 font-mono text-sm tracking-widest hover:text-primary transition-colors">
                <span>START_JOURNEY</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;