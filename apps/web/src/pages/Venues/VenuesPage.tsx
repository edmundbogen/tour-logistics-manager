import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Calendar, ArrowRight } from 'lucide-react';
import { getTours } from '../../lib/api';
import { formatDate, getStatusColor, cn } from '../../lib/utils';

export default function VenuesPage() {
  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: getTours
  });

  // Extract all venues from all tours
  const venues = tours.flatMap(tour =>
    (tour.shows || []).map(show => ({
      ...show,
      tourName: tour.name,
      tourId: tour.id
    }))
  ).sort((a, b) => new Date(a.showDate).getTime() - new Date(b.showDate).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Venues</h1>
        <p className="text-gray-500 mt-1">All venues across your tours</p>
      </div>

      {venues.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No venues yet</h3>
          <p className="text-gray-500">Add shows to your tours to see venues here</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {venues.map(venue => (
                <tr key={venue.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{venue.venueName}</p>
                        {venue.venueCapacity && (
                          <p className="text-sm text-gray-500">Capacity: {venue.venueCapacity}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-900">{venue.city}{venue.stateCountry ? `, ${venue.stateCountry}` : ''}</p>
                    {venue.venueAddress && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">{venue.venueAddress}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(venue.showDate)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/tours/${venue.tourId}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {venue.tourName}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    {venue.venueContactName ? (
                      <div>
                        <p className="text-gray-900">{venue.venueContactName}</p>
                        {venue.venueContactPhone && (
                          <a
                            href={`tel:${venue.venueContactPhone}`}
                            className="text-sm text-primary-600 flex items-center"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {venue.venueContactPhone}
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn('badge', getStatusColor(venue.venueStatus))}>
                      {venue.venueStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      to={`/tours/${venue.tourId}/shows/${venue.id}`}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded inline-flex"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
