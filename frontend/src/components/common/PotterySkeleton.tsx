import React from 'react';

interface PotterySkeletonProps {
  type?: 'bowl' | 'jar' | 'cup' | 'card';
  count?: number;
}

export const PotterySkeleton: React.FC<PotterySkeletonProps> = ({
  type = 'card',
  count = 1,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl p-3 border border-sand-200 shadow-warm-sm animate-pulse flex flex-col justify-between"
        >
          {/* Pottery Silhouette Container */}
          <div className="aspect-square w-full rounded-2xl bg-sand-100 flex items-center justify-center p-6 mb-3 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-sand-200/50 to-transparent" />
            
            {type === 'bowl' || i % 2 === 0 ? (
              // Handcrafted Bowl Silhouette
              <svg
                viewBox="0 0 100 80"
                className="w-28 h-20 fill-sand-300 opacity-60"
              >
                <path d="M 10 25 C 10 60, 30 75, 50 75 C 70 75, 90 60, 90 25 C 85 20, 15 20, 10 25 Z" />
                <ellipse cx="50" cy="24" rx="40" ry="8" className="fill-sand-200" />
                <rect x="42" y="75" width="16" height="3" rx="1.5" className="fill-sand-400" />
              </svg>
            ) : (
              // Ceramic Jar with Cork Silhouette
              <svg
                viewBox="0 0 100 90"
                className="w-24 h-24 fill-sand-300 opacity-60"
              >
                {/* Cork */}
                <rect x="38" y="10" width="24" height="8" rx="2" className="fill-ochre-300" />
                {/* Neck */}
                <rect x="35" y="18" width="30" height="6" className="fill-sand-400" />
                {/* Vessel Body */}
                <path d="M 30 24 C 18 35, 18 75, 30 82 C 40 85, 60 85, 70 82 C 82 75, 82 35, 70 24 Z" />
              </svg>
            )}
          </div>

          {/* Text lines */}
          <div className="space-y-2 px-1 pb-1">
            <div className="h-2.5 bg-sand-200 rounded-full w-20" />
            <div className="h-4 bg-sand-200 rounded-full w-3/4" />
            <div className="h-3 bg-sand-200 rounded-full w-1/3" />
            <div className="pt-2 border-t border-sand-100 flex justify-between items-center">
              <div className="h-4 bg-sand-300 rounded-full w-14" />
              <div className="w-8 h-8 rounded-xl bg-sand-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
