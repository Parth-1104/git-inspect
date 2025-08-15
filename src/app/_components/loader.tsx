"use client";

import React from 'react';

export function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-primary to-primary-foreground opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-primary-foreground to-primary opacity-20 blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-primary to-primary-foreground opacity-10 blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main loader content */}
      <div className="relative z-10 text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-r from-primary to-primary-foreground shadow-2xl shadow-primary/25 animate-pulse flex items-center justify-center">
            <img src="/favicon.png" alt="Git Inspect logo" className="h-14 w-13 object-contain" />
          </div>
        </div>

        {/* Text */}
        <h1 className="mb-4 text-3xl font-bold text-white">
          Git Inspect
        </h1>
        <p className="mb-8 text-lg text-gray-300">
          Loading your AI-powered codebase explorer...
        </p>

        {/* Animated dots */}
        <div className="flex justify-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce"></div>
          <div className="h-3 w-3 rounded-full bg-primary/80 animate-bounce animation-delay-200"></div>
          <div className="h-3 w-3 rounded-full bg-primary/60 animate-bounce animation-delay-400"></div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary-foreground rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading text */}
        <p className="mt-4 text-sm text-gray-400">
          Initializing 3D components...
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 bg-primary rounded-full opacity-60 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
