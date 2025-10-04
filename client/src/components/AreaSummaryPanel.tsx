'use client';

import React from 'react';
import { X, MapPin, Clock, Star, DollarSign, Users, TrendingUp, Settings, Sparkles, Activity } from 'lucide-react';
import { useAreaSummary } from '@/contexts/AreaSummaryContext';

const PRICE_LEVELS = {
  0: 'Free',
  1: '$',
  2: '$$', 
  3: '$$$',
  4: '$$$$'
};

const BUSYNESS_COLORS = {
  'very_busy': 'from-emerald-500 to-teal-600',
  'moderately_busy': 'from-blue-500 to-cyan-600',
  'quiet': 'from-violet-500 to-purple-600',
  'very_quiet': 'from-slate-400 to-slate-500'
};

const BUSYNESS_TEXT_COLORS = {
  'very_busy': 'text-emerald-700',
  'moderately_busy': 'text-blue-700',
  'quiet': 'text-violet-700',
  'very_quiet': 'text-slate-700'
};

const BUSYNESS_BG_COLORS = {
  'very_busy': 'bg-emerald-50 border-emerald-200',
  'moderately_busy': 'bg-blue-50 border-blue-200',
  'quiet': 'bg-violet-50 border-violet-200',
  'very_quiet': 'bg-slate-50 border-slate-200'
};

const BUSYNESS_LEVELS = {
  'very_busy': 5,
  'moderately_busy': 4,
  'quiet': 2,
  'very_quiet': 1
};

export default function AreaSummaryPanel() {
  const { areaSummary, isLoading, error, isVisible, clearAreaSummary, currentRadius, setRadius, fetchAreaSummary } = useAreaSummary();

  if (!isVisible) return null;

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    
    // If we have a current area summary, re-fetch with new radius
    if (areaSummary?.coordinates) {
      fetchAreaSummary(areaSummary.coordinates.lat, areaSummary.coordinates.lon, newRadius);
    }
  };

  return (
    <div className="fixed right-4 top-4 w-[420px] max-h-[92vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
      {/* Sleek Header */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Area Insights</h2>
              <p className="text-xs text-gray-400">Discover your surroundings</p>
            </div>
          </div>
          <button
            onClick={clearAreaSummary}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Radius Control in Header */}
        {areaSummary && (
          <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
            <Settings className="w-4 h-4 text-gray-300" />
            <span className="text-xs text-gray-300">Radius:</span>
            <select
              value={currentRadius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-md px-3 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
            >
              <option value={500} className="bg-slate-800">0.5km</option>
              <option value={1000} className="bg-slate-800">1km</option>
              <option value={2000} className="bg-slate-800">2km</option>
              <option value={3000} className="bg-slate-800">3km</option>
              <option value={5000} className="bg-slate-800">5km</option>
            </select>
          </div>
        )}
      </div>

      <div className="overflow-y-auto max-h-[calc(92vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="relative mx-auto mb-6 w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-slate-600 animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Exploring this area...</p>
            <p className="text-gray-400 text-sm mt-1">Gathering insights</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {areaSummary && (
          <div className="p-5 space-y-4">
            {/* Location Header - Sleek & Compact */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-200/50 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-1.5">
                {areaSummary.ai_summary.location_name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                {areaSummary.location_context.formatted_address}
              </p>
            </div>

            {/* Quick Stats - Prominent Position */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {areaSummary.places.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Places</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {(areaSummary.radius / 1000).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Radius (km)</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {areaSummary.recommendations.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Top Picks</div>
              </div>
            </div>

            {/* Busyness Indicator - Redesigned */}
            <div className={`rounded-xl p-4 border shadow-sm ${
              BUSYNESS_BG_COLORS[areaSummary.busyness.level as keyof typeof BUSYNESS_BG_COLORS] || 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className={`w-4 h-4 ${
                    BUSYNESS_TEXT_COLORS[areaSummary.busyness.level as keyof typeof BUSYNESS_TEXT_COLORS] || 'text-slate-700'
                  }`} />
                  <h4 className={`font-bold text-sm ${
                    BUSYNESS_TEXT_COLORS[areaSummary.busyness.level as keyof typeof BUSYNESS_TEXT_COLORS] || 'text-slate-700'
                  }`}>
                    Area Activity
                  </h4>
                </div>
                <div className="flex items-center space-x-0.5">
                  {[1, 2, 3, 4, 5].map((bar) => {
                    const isActive = bar <= (BUSYNESS_LEVELS[areaSummary.busyness.level as keyof typeof BUSYNESS_LEVELS] || 1);
                    return (
                      <div
                        key={bar}
                        className={`w-1.5 rounded-full transition-all ${
                          isActive 
                            ? `h-${Math.min(bar * 2 + 2, 8)} bg-gradient-to-t ${BUSYNESS_COLORS[areaSummary.busyness.level as keyof typeof BUSYNESS_COLORS] || 'from-slate-400 to-slate-500'}` 
                            : 'h-3 bg-gray-300'
                        }`}
                        style={{ height: isActive ? `${Math.min(bar * 4 + 8, 24)}px` : '8px' }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                BUSYNESS_TEXT_COLORS[areaSummary.busyness.level as keyof typeof BUSYNESS_TEXT_COLORS] || 'text-slate-700'
              } bg-white/60 backdrop-blur-sm border border-white/40`}>
                {areaSummary.busyness.level.replace('_', ' ')}
              </div>
              <p className="text-sm text-gray-700 mt-2 font-medium">
                {areaSummary.busyness.description}
              </p>
              {areaSummary.busyness.metrics && (
                <div className="flex justify-between mt-3 pt-3 border-t border-white/40 text-xs text-gray-600">
                  <span className="font-medium">{areaSummary.busyness.metrics.total_places} places</span>
                  <span className="font-medium">~{areaSummary.busyness.metrics.avg_ratings_count} avg reviews</span>
                </div>
              )}
            </div>

            {/* AI Summary - Enhanced Design */}
            {areaSummary.ai_summary.full_summary && !areaSummary.ai_summary.error && (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-xl p-4 border border-amber-200/50 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-sm text-amber-900">Local Insights</h4>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {areaSummary.ai_summary.full_summary}
                </div>
              </div>
            )}

            {/* Area Characteristics - Modern Pills */}
            {areaSummary.area_characteristics.primary_characteristics.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
                  Area Vibe
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {areaSummary.area_characteristics.primary_characteristics.map((char, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 text-xs font-semibold rounded-full border border-violet-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <strong className="text-gray-800">Overall:</strong>{' '}
                  <span className="capitalize">{areaSummary.area_characteristics.area_vibe.replace('_', ' ')}</span>
                </div>
              </div>
            )}

            {/* Top Recommendations - Sleek Cards */}
            {areaSummary.recommendations.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1.5 bg-yellow-100 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">Top Picks</h4>
                </div>
                <div className="space-y-2.5">
                  {areaSummary.recommendations.slice(0, 5).map((rec, index) => (
                    <div 
                      key={index} 
                      className="group bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900 text-sm leading-snug flex-1 group-hover:text-slate-700 transition-colors">
                          {rec.name}
                        </h5>
                        <div className="flex items-center space-x-2 ml-3">
                          {rec.rating && (
                            <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200">
                              <Star className="w-3 h-3 fill-current text-yellow-500 mr-1" />
                              <span className="text-xs font-bold text-gray-800">{rec.rating}</span>
                            </div>
                          )}
                          {rec.price_level !== undefined && rec.price_level !== null && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {PRICE_LEVELS[rec.price_level as keyof typeof PRICE_LEVELS]}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {rec.types.slice(0, 3).map((type, typeIndex) => (
                          <span
                            key={typeIndex}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium"
                          >
                            {type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{rec.recommendation_reason}</p>
                      
                      {rec.ratings_count && rec.ratings_count > 0 && (
                        <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                          <Users className="w-3 h-3 mr-1.5 text-gray-400" />
                          <span className="font-medium">{rec.ratings_count.toLocaleString()} reviews</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}