import React, { useState, useEffect, useRef } from 'react';
import ReelCard from '../components/ReelCard';
import { mockReels } from '../data/mockData';

const Reels: React.FC = () => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const reelHeight = window.innerHeight;
        const newIndex = Math.round(scrollTop / reelHeight);
        setCurrentReelIndex(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .reels-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {mockReels.map((reel, index) => (
          <div key={reel.id} className="snap-start">
            <ReelCard
              reel={reel}
              isVisible={index === currentReelIndex}
            />
          </div>
        ))}
      </div>

      {/* Reel indicator */}
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-white text-sm">
          {currentReelIndex + 1} / {mockReels.length}
        </span>
      </div>
    </div>
  );
};

export default Reels;