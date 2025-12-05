import { Link } from 'react-router-dom';
import {
  Plane,
  Building2,
  Car,
  Edit,
  Trash2,
  ChevronRight,
  Phone
} from 'lucide-react';
import { formatDate, formatDayOfWeek, formatTime, getStatusColor, getRiskColor, cn } from '../../lib/utils';
import type { Show } from '../../types';

interface TourGridProps {
  shows: Show[];
  tourId: string;
  onUpdateShow: (showId: string, data: Partial<Show>) => void;
  onDeleteShow: (showId: string) => void;
}

function getFlightStatusIndicator(show: Show) {
  const primaryFlight = show.flights?.find(f => f.isPrimary);
  if (!primaryFlight) return { color: 'bg-gray-300', text: 'No Flight' };
  switch (primaryFlight.status) {
    case 'Booked':
    case 'Confirmed':
      return { color: 'bg-success-500', text: primaryFlight.status };
    case 'Not Booked':
      return { color: 'bg-warning-500', text: 'Not Booked' };
    default:
      return { color: 'bg-gray-300', text: primaryFlight.status };
  }
}

function getHotelStatusIndicator(show: Show) {
  const hotel = show.hotels?.[0];
  if (!hotel) return { color: 'bg-gray-300', text: 'No Hotel' };
  switch (hotel.status) {
    case 'Booked':
    case 'Confirmed':
      return { color: 'bg-success-500', text: hotel.status };
    case 'Not Booked':
      return { color: 'bg-warning-500', text: 'Not Booked' };
    default:
      return { color: 'bg-gray-300', text: hotel.status };
  }
}

function getTransportStatusIndicator(show: Show) {
  const transport = show.groundTransports?.[0];
  if (!transport) return { color: 'bg-gray-300', text: 'No Transport' };
  switch (transport.status) {
    case 'Booked':
    case 'Confirmed':
      return { color: 'bg-success-500', text: transport.status };
    case 'Not Booked':
      return { color: 'bg-warning-500', text: 'Not Booked' };
    default:
      return { color: 'bg-gray-300', text: transport.status };
  }
}

export default function TourGrid({ shows, tourId, onUpdateShow, onDeleteShow }: TourGridProps) {
  if (shows.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">No shows added yet. Add your first show to get started.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City / Venue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Times</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shows.map(show => {
              const flightStatus = getFlightStatusIndicator(show);
              const hotelStatus = getHotelStatusIndicator(show);
              const transportStatus = getTransportStatusIndicator(show);

              return (
                <tr key={show.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {show.showNumber || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {show.city}{show.stateCountry ? `, ${show.stateCountry}` : ''}
                      </p>
                      <p className="text-sm text-gray-500">{show.venueName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(show.showDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDayOfWeek(show.showDate)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <p className="text-gray-900">
                        <span className="text-gray-500">Stage:</span> {formatTime(show.onStageTime)}
                      </p>
                      <p className="text-gray-500">
                        On-site: {formatTime(show.requiredOnSiteTime)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {show.venueContactName ? (
                      <div className="text-sm">
                        <p className="text-gray-900">{show.venueContactName}</p>
                        {show.venueContactPhone && (
                          <a
                            href={`tel:${show.venueContactPhone}`}
                            className="text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {show.venueContactPhone}
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center" title={flightStatus.text}>
                        <Plane className="h-4 w-4 text-gray-400 mr-1" />
                        <div className={cn('w-2 h-2 rounded-full', flightStatus.color)} />
                      </div>
                      <div className="flex items-center" title={hotelStatus.text}>
                        <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                        <div className={cn('w-2 h-2 rounded-full', hotelStatus.color)} />
                      </div>
                      <div className="flex items-center" title={transportStatus.text}>
                        <Car className="h-4 w-4 text-gray-400 mr-1" />
                        <div className={cn('w-2 h-2 rounded-full', transportStatus.color)} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={cn('badge', getStatusColor(show.overallStatus))}>
                      {show.overallStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={cn('badge', getRiskColor(show.calculatedRiskLevel || show.riskLevel))}>
                      {show.calculatedRiskLevel || show.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/tours/${tourId}/shows/${show.id}`}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="View Details"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onDeleteShow(show.id)}
                        className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
