import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plane,
  Building2
} from 'lucide-react';
import { getTours } from '../../lib/api';
import { formatDate, getRiskDotColor, cn } from '../../lib/utils';
import { addDays, isWithinInterval, parseISO } from 'date-fns';

export default function Dashboard() {
  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: getTours
  });

  // Calculate stats
  const totalShows = tours.reduce((sum, tour) => sum + (tour.showCount || 0), 0);
  const confirmedShows = tours.reduce((sum, tour) => sum + (tour.statusCounts?.confirmed || 0), 0);
  const pendingShows = tours.reduce((sum, tour) => sum + (tour.statusCounts?.inProgress || 0) + (tour.statusCounts?.notStarted || 0), 0);
  const redRiskShows = tours.reduce((sum, tour) => sum + (tour.riskCounts?.red || 0), 0);

  // Get upcoming shows (next 7 days)
  const today = new Date();
  const nextWeek = addDays(today, 7);

  const upcomingShows = tours.flatMap(tour =>
    (tour.shows || [])
      .filter(show => {
        const showDate = parseISO(show.showDate);
        return isWithinInterval(showDate, { start: today, end: nextWeek });
      })
      .map(show => ({ ...show, tourName: tour.name }))
  ).sort((a, b) => new Date(a.showDate).getTime() - new Date(b.showDate).getTime());

  // Action items (shows needing attention)
  const actionItems = tours.flatMap(tour =>
    (tour.shows || [])
      .filter(show =>
        show.venueStatus === 'Pending' ||
        show.riskLevel === 'Red' ||
        (show.flights?.length === 0 && show.overallStatus !== 'Completed')
      )
      .map(show => ({
        ...show,
        tourName: tour.name,
        issue: show.riskLevel === 'Red'
          ? 'High Risk'
          : show.venueStatus === 'Pending'
            ? 'Venue Unconfirmed'
            : 'Missing Flight'
      }))
  ).slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all tours and upcoming shows</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Shows</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalShows}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{confirmedShows}</p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">{pendingShows}</p>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Risk</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">{redRiskShows}</p>
            </div>
            <div className="p-3 bg-danger-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Shows */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming Shows (Next 7 Days)</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingShows.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">
                No upcoming shows in the next 7 days
              </div>
            ) : (
              upcomingShows.map(show => (
                <Link
                  key={show.id}
                  to={`/tours/${show.tourId}/shows/${show.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn('status-dot', getRiskDotColor(show.riskLevel))} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {show.city} - {show.venueName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(show.showDate)} • {show.tourName}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Action Items */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Action Required</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {actionItems.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">
                No action items
              </div>
            ) : (
              actionItems.map(item => (
                <Link
                  key={item.id}
                  to={`/tours/${item.tourId}/shows/${item.id}`}
                  className="flex items-start px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {item.issue === 'High Risk' && <AlertTriangle className="h-4 w-4 text-danger-500" />}
                      {item.issue === 'Venue Unconfirmed' && <Building2 className="h-4 w-4 text-warning-500" />}
                      {item.issue === 'Missing Flight' && <Plane className="h-4 w-4 text-warning-500" />}
                      <span className="text-sm font-medium text-gray-900">{item.issue}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.city} • {formatDate(item.showDate)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tours Overview */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Active Tours</h2>
          <Link to="/tours" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {tours.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500">
              No tours yet. Create your first tour to get started.
            </div>
          ) : (
            tours.slice(0, 5).map(tour => (
              <Link
                key={tour.id}
                to={`/tours/${tour.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tour.name}</p>
                    <p className="text-sm text-gray-500">
                      {tour.artistName} • {tour.showCount} shows
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className="status-dot status-dot-green" />
                    <span className="text-sm text-gray-600">{tour.riskCounts?.green || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="status-dot status-dot-yellow" />
                    <span className="text-sm text-gray-600">{tour.riskCounts?.yellow || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="status-dot status-dot-red" />
                    <span className="text-sm text-gray-600">{tour.riskCounts?.red || 0}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
