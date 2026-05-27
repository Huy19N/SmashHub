import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { router } from './routes';
import { ThemeProvider } from './contexts/ThemeContext';

/**
 * LoadingScreen
 * A high-fidelity, 60fps skeleton screens layout featuring pulsing glow designs.
 * Pre-renders a skeleton navigation bar and loading card area to eliminate 
 * Cumulative Layout Shifts (CLS) and maintain a premium UX during code split load states.
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg-dark text-gray-100 flex flex-col antialiased">
      {/* Skeleton Top Navbar */}
      <div className="h-16 border-b border-border-dark bg-[#0f1322]/65 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-border-dark rounded-lg animate-pulse" />
          <div className="h-5 w-28 bg-border-dark rounded animate-pulse" />
        </div>
        <div className="hidden md:flex gap-4">
          <div className="h-8 w-16 bg-border-dark rounded-lg animate-pulse" />
          <div className="h-8 w-20 bg-border-dark rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-border-dark rounded-lg animate-pulse" />
          <div className="h-8 w-16 bg-border-dark rounded-lg animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-border-dark rounded-full animate-pulse" />
      </div>

      {/* Skeleton Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative flex items-center justify-center">
          {/* Pulsing neon accent circle */}
          <div className="absolute h-20 w-20 rounded-full bg-primary/10 border border-primary/20 animate-pulse-slow blur-md" />
          {/* Hardware-accelerated Spinner */}
          <div className="h-12 w-12 rounded-full border-2 border-border-dark border-t-primary animate-spin" />
        </div>
        
        <div className="space-y-3">
          <div className="h-6 w-48 bg-border-dark rounded mx-auto animate-pulse" />
          <div className="h-4 w-72 bg-border-dark/60 rounded mx-auto animate-pulse" />
        </div>
      </main>
    </div>
  );
}

/**
 * Root App Component
 * Standard Router configuration wrapped in dynamic Suspense boundary.
 */
export default function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  );
}
