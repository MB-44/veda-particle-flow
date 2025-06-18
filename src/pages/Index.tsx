import React from 'react';
import ParticleButton from '../components/ParticleButton';
import AnimatedBackground from '../components/AnimatedBackground';
const Index = () => {
  const handleForestVedaClick = () => {
    console.log('ForestVeda clicked!');
  };
  const handleSeaVedaClick = () => {
    console.log('SeaVeda clicked!');
  };
  const handleMainAction = () => {
    console.log('Main action button clicked!');
  };
  return <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <AnimatedBackground />
      
      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center space-y-12 max-w-4xl mx-auto">
        
        {/* Particle Buttons Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 mb-8">
          <div className="text-center">
            <ParticleButton particleColor="#22c55e" className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700" onClick={handleForestVedaClick}>
              ForestVeda
            </ParticleButton>
            
          </div>
          
          <div className="text-center">
            <ParticleButton particleColor="#38bdf8" className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700" onClick={handleSeaVedaClick}>
              SeaVeda
            </ParticleButton>
            
          </div>
        </div>

        {/* Heading Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-fade-in">
            Welcome to Veda
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover the ancient wisdom of nature and sea through our immersive experiences
          </p>
        </div>

        {/* Action Button Section */}
        <div className="mt-12">
          <button onClick={handleMainAction} className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-purple-500/25 border border-white/20">
            Begin Your Journey
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full blur-xl" />
      </div>
    </div>;
};
export default Index;