"use client";
import React, { useState, useEffect } from 'react';

export function Loader() {
  const [loadingStage, setLoadingStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingStages = [
    "Initializing neural networks...",
    "Connecting to AI models...",
    "Analyzing codebase structure...",
    "Preparing intelligent insights...",
    "Almost ready..."
  ];

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % loadingStages.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-950 overflow-hidden">
      {/* Animated neural network background */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          {/* Neural network nodes */}
          {[...Array(12)].map((_, i) => (
            <g key={`node-${i}`}>
              <circle
                cx={100 + (i % 4) * 250}
                cy={200 + Math.floor(i / 4) * 200}
                r="3"
                fill="url(#nodeGradient)"
                className="animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "2s"
                }}
              />
              {/* Connection lines */}
              {i < 8 && (
                <line
                  x1={100 + (i % 4) * 250}
                  y1={200 + Math.floor(i / 4) * 200}
                  x2={100 + ((i + 4) % 4) * 250}
                  y2={200 + Math.floor((i + 4) / 4) * 200}
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: "3s"
                  }}
                />
              )}
            </g>
          ))}
          <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating AI particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          >
            <div className="w-1 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full opacity-70 blur-[0.5px]" />
          </div>
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-32 w-64 h-64 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-20 left-32 w-72 h-72 bg-gradient-to-r from-gray-900/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-black/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* AI Brain Icon */}
        <div className="mb-8 relative">
          <div className="mx-auto w-24 h-24 relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-30 blur-md animate-spin" style={{ animationDuration: "8s" }} />
            
            {/* Main icon container */}
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-gray-800 via-blue-700 to-black shadow-2xl shadow-blue-600/30 flex items-center justify-center overflow-hidden">
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
              
              {/* AI Brain SVG */}
              <svg className="w-12 h-12 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              
              {/* Pulsing effect */}
              <div className="absolute inset-2 rounded-xl bg-white/5 animate-pulse" />
            </div>
            
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "10s" }}>
              <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "7s", animationDirection: "reverse" }}>
              <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 bg-purple-400 rounded-full transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Brand name with typing effect */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-gray-300 bg-clip-text text-transparent mb-2">
            Git Inspect AI
          </h1>
          <div className="h-6 flex items-center justify-center">
            <span className="text-blue-300 text-sm font-medium tracking-wide">
              {loadingStages[loadingStage]}
            </span>
            <span className="ml-1 animate-pulse text-blue-400">|</span>
          </div>
        </div>

        {/* Enhanced progress bar */}
        <div className="w-full max-w-sm mx-auto mb-6">
          <div className="relative h-2 bg-gray-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-800/30">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Loading...</span>
            <span>{Math.round(Math.min(progress, 100))}%</span>
          </div>
        </div>

        {/* Animated processing indicators */}
        <div className="flex justify-center space-x-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={`indicator-${i}`} className="flex flex-col items-center space-y-1">
              <div 
                className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "1s"
                }}
              />
            </div>
          ))}
        </div>

        {/* Status text */}
        <p className="text-gray-300 text-sm opacity-80">
          Powering up your intelligent code analysis platform
        </p>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}