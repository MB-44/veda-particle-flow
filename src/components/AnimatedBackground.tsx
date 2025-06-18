
import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Animated shapes */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Floating orbs */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-2 h-2 bg-white/20 rounded-full animate-ping" />
      </div>
      <div className="absolute top-1/3 right-1/3">
        <div className="relative w-1 h-1 bg-green-400/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="absolute bottom-1/3 left-2/3">
        <div className="relative w-1 h-1 bg-blue-400/30 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
};

export default AnimatedBackground;
