import React from 'react';
import { UserLocationsData, LocationData } from '@/shared/types/widget.types';
import { cn } from '@/shared/utils/utils';
import { MapPin, Globe } from 'lucide-react';

interface UserLocationsWidgetProps {
  data: UserLocationsData;
  className?: string;
}

const getCountryFlag = (country: string) => {
  const flags: Record<string, string> = {
    'España': '🇪🇸',
    'México': '🇲🇽',
    'Argentina': '🇦🇷',
    'Colombia': '🇨🇴',
    'Chile': '🇨🇱',
    'Perú': '🇵🇪',
    'Estados Unidos': '🇺🇸',
    'Brasil': '🇧🇷',
    'Francia': '🇫🇷',
    'Alemania': '🇩🇪',
    'Reino Unido': '🇬🇧',
    'Italia': '🇮🇹',
    'Otros': '🌍'
  };
  return flags[country] || '🌍';
};

const ProgressBar: React.FC<{ 
  percentage: number; 
  color?: string; 
  height?: string;
}> = ({ percentage, color = 'bg-blue-500', height = 'h-2' }) => {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full", height)}>
      <div
        className={cn("rounded-full transition-all duration-500 ease-out", color, height)}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

export const UserLocationsWidget: React.FC<UserLocationsWidgetProps> = ({ 
  data, 
  className 
}) => {
  const totalUsers = data.locations.reduce((sum, location) => sum + location.users, 0);
  const sortedLocations = [...data.locations].sort((a, b) => b.users - a.users);
  
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-blue-600" />
        <div>
          <h4 className="font-medium text-gray-900">Distribución Global</h4>
          <p className="text-sm text-gray-500">{totalUsers.toLocaleString()} usuarios totales</p>
        </div>
      </div>

      {/* Lista de países */}
      <div className="space-y-3">
        {sortedLocations.map((location: LocationData, index: number) => {
          const colorClass = colors[index % colors.length];
          
          return (
            <div key={location.country} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg">{getCountryFlag(location.country)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {location.country}
                    </p>
                    <p className="text-xs text-gray-500">
                      {location.users.toLocaleString()} usuarios
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
                    {location.percentage}%
                  </span>
                </div>
              </div>
              
              <ProgressBar 
                percentage={location.percentage} 
                color={colorClass}
              />
            </div>
          );
        })}
      </div>

      {/* Resumen estadístico */}
      <div className="bg-gray-50 rounded-lg p-3 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin className="h-3 w-3 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {sortedLocations.length}
              </span>
            </div>
            <p className="text-xs text-gray-500">Países</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg">{getCountryFlag(sortedLocations[0]?.country || '')}</span>
              <span className="text-sm font-medium text-gray-900">
                {sortedLocations[0]?.percentage || 0}%
              </span>
            </div>
            <p className="text-xs text-gray-500">Top País</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 