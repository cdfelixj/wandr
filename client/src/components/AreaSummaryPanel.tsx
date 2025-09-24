'use client';

import React from 'react';
import { X, MapPin, Clock, Star, DollarSign, Users, TrendingUp, Settings } from 'lucide-react';
import { useAreaSummary } from '@/contexts/AreaSummaryContext';

const PRICE_LEVELS = {
  0: 'Free',
  1: '$',
  2: '$$', 
  3: '$$$',
  4: '$$$$'
};

const BUSYNESS_COLORS = {
  'very_busy': 'text-green-800 bg-green-100 border-green-200',
  'moderately_busy': 'text-green-700 bg-green-50 border-green-150',
  'quiet': 'text-green-600 bg-green-25 border-green-100',
  'very_quiet': 'text-green-500 bg-gray-50 border-gray-200'
};

const BUSYNESS_LEVELS = {
  'very_busy': 4,
  'moderately_busy': 3,
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
    <div className="fixed right-4 top-4 w-96 max-h-[90vh] bg-white rounded-lg shadow-2xl border z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Area Explorer</h2>
        </div>
        <button
          onClick={clearAreaSummary}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
        {/* Loading State */}
        {isLoading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Exploring this area...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {areaSummary && (
          <div className="p-6 space-y-6">
            {/* Location Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {areaSummary.ai_summary.location_name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {areaSummary.location_context.formatted_address}
              </p>
            </div>

            {/* Busyness Indicator */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">Area Activity</h4>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((bar) => {
                    const isActive = bar <= (BUSYNESS_LEVELS[areaSummary.busyness.level as keyof typeof BUSYNESS_LEVELS] || 1);
                    return (
                      <div
                        key={bar}
                        className={`w-2 h-6 rounded-sm ${
                          isActive 
                            ? 'bg-green-500' 
                            : 'bg-gray-200'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                BUSYNESS_COLORS[areaSummary.busyness.level as keyof typeof BUSYNESS_COLORS] || 'text-gray-600 bg-gray-50 border-gray-200'
              }`}>
                {areaSummary.busyness.level.replace('_', ' ').toUpperCase()}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {areaSummary.busyness.description}
              </p>
              {areaSummary.busyness.metrics && (
                <div className="flex justify-between mt-3 text-xs text-gray-500">
                  <span>{areaSummary.busyness.metrics.total_places} places</span>
                  <span>Avg. {areaSummary.busyness.metrics.avg_ratings_count} reviews</span>
                </div>
              )}
            </div>

            {/* AI Summary */}
            {areaSummary.ai_summary.full_summary && !areaSummary.ai_summary.error && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  About This Area
                </h4>
                <div className="prose text-sm text-gray-600 leading-relaxed">
                  {areaSummary.ai_summary.full_summary}
                </div>
              </div>
            )}

            {/* Area Characteristics */}
            {areaSummary.area_characteristics.primary_characteristics.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Area Vibe</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {areaSummary.area_characteristics.primary_characteristics.map((char, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200"
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  <strong>Overall vibe:</strong> {areaSummary.area_characteristics.area_vibe.replace('_', ' ')}
                </div>
              </div>
            )}

            {/* Top Recommendations */}
            {areaSummary.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Top Recommendations
                </h4>
                <div className="space-y-3">
                  {areaSummary.recommendations.slice(0, 5).map((rec, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="font-medium text-gray-800 text-sm">{rec.name}</h5>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          {rec.rating && (
                            <div className="flex items-center">
                              <Star className="w-3 h-3 fill-current text-green-400" />
                              <span className="ml-1">{rec.rating}</span>
                            </div>
                          )}
                          {rec.price_level !== undefined && rec.price_level !== null && (
                            <span className="text-green-600 font-medium">
                              {PRICE_LEVELS[rec.price_level as keyof typeof PRICE_LEVELS]}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {rec.types.slice(0, 3).map((type, typeIndex) => (
                          <span
                            key={typeIndex}
                            className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded"
                          >
                            {type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-600">{rec.recommendation_reason}</p>
                      
                      {rec.ratings_count && rec.ratings_count > 0 && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Users className="w-3 h-3 mr-1" />
                          {rec.ratings_count.toLocaleString()} reviews
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-700 mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {areaSummary.places.length}
                  </div>
                  <div className="text-gray-600">Places Found</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {areaSummary.radius / 1000}km
                  </div>
                  <div className="text-gray-600">Search Radius</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Radius Control - Bottom Right */}
      {areaSummary && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 font-medium">Radius:</span>
            <select
              value={currentRadius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={500}>0.5km</option>
              <option value={1000}>1km</option>
              <option value={2000}>2km</option>
              <option value={3000}>3km</option>
              <option value={5000}>5km</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}