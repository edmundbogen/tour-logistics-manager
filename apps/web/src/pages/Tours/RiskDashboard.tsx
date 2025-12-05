import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { getTour } from '../../lib/api';
import { formatDate, cn, getRiskColor } from '../../lib/utils';

export default function RiskDashboard() {
  const { tourId } = useParams<{ tourId: string }>();

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => getTour(tourId!),
    enabled: !!tourId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!tour) {
    return <div>Tour not found</div>;
  }

  const shows = tour.shows || [];
  const redShows = shows.filter(s => s.riskLevel === 'Red' || s.calculatedRiskLevel === 'Red');
  const yellowShows = shows.filter(s => s.riskLevel === 'Yellow' || s.calculatedRiskLevel === 'Yellow');
  const greenShows = shows.filter(s => s.riskLevel === 'Green' || s.calculatedRiskLevel === 'Green');

  const getRiskReasons = (show: typeof shows[0]) => {
    const reasons: string[] = [];
    const primaryFlight = show.flights?.find(f => f.isPrimary);
    const backupFlight = show.flights?.find(f => f.isBackup);

    if (!primaryFlight) {
      reasons.push('No flight booked');
    } else {
      // Check buffer
      if (primaryFlight.arrivalDatetime) {
        const transport = show.groundTransports?.[0];
        const transportMinutes = transport?.airportToVenueMinutes || 45;
        const arrival = new Date(primaryFlight.arrivalDatetime);
        const arrivalWithTransport = new Date(arrival.getTime() + transportMinutes * 60000);
        const [hours, mins] = show.requiredOnSiteTime.split(':').map(Number);
        const onSite = new Date(show.showDate);
        onSite.setHours(hours, mins, 0, 0);
        const bufferMinutes = (onSite.getTime() - arrivalWithTransport.getTime()) / 60000;

        if (bufferMinutes < 120) {
          reasons.push(`Buffer only ${Math.round(bufferMinutes)} minutes (need 120+)`);
        } else if (bufferMinutes < 180) {
          reasons.push(`Buffer is ${Math.round(bufferMinutes)} minutes (less than recommended 180)`);
        }
      }
    }

    if (!backupFlight && show.flights?.length === 1) {
      reasons.push('No backup flight option');
    }

    if (show.venueStatus === 'Pending' || show.venueStatus === 'Unconfirmed') {
      reasons.push('Venue not confirmed');
    }

    if (!show.hotels?.length) {
      reasons.push('No hotel booked');
    }

    if (!show.groundTransports?.length) {
      reasons.push('No ground transport arranged');
    }

    return reasons;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to={`/tours/${tourId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Dashboard</h1>
          <p className="text-gray-500">{tour.name} - {tour.artistName}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-danger-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Risk</p>
              <p className="text-3xl font-bold text-danger-600">{redShows.length}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-danger-200" />
          </div>
        </div>
        <div className="card p-5 border-l-4 border-warning-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Medium Risk</p>
              <p className="text-3xl font-bold text-warning-600">{yellowShows.length}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-warning-200" />
          </div>
        </div>
        <div className="card p-5 border-l-4 border-success-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Risk</p>
              <p className="text-3xl font-bold text-success-600">{greenShows.length}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-success-200" />
          </div>
        </div>
      </div>

      {/* High Risk Shows */}
      {redShows.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 bg-danger-50">
            <h2 className="font-semibold text-danger-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              High Risk Shows - Immediate Attention Required
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {redShows.map(show => (
              <div key={show.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {show.city}{show.stateCountry ? `, ${show.stateCountry}` : ''} - {show.venueName}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(show.showDate)}</p>
                  </div>
                  <Link
                    to={`/tours/${tourId}/shows/${show.id}`}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {getRiskReasons(show).map((reason, i) => (
                    <div key={i} className="flex items-start text-sm">
                      <AlertTriangle className="h-4 w-4 text-danger-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{reason}</span>
                    </div>
                  ))}
                </div>
                {show.backupPlan && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Backup Plan:</p>
                    <p className="text-sm text-gray-600">{show.backupPlan}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Risk Shows */}
      {yellowShows.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 bg-warning-50">
            <h2 className="font-semibold text-warning-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Medium Risk Shows - Monitor Closely
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {yellowShows.map(show => (
              <div key={show.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {show.city}{show.stateCountry ? `, ${show.stateCountry}` : ''} - {show.venueName}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(show.showDate)}</p>
                  </div>
                  <Link
                    to={`/tours/${tourId}/shows/${show.id}`}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {getRiskReasons(show).map((reason, i) => (
                    <div key={i} className="flex items-start text-sm">
                      <AlertCircle className="h-4 w-4 text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Risk Shows */}
      {greenShows.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 bg-success-50">
            <h2 className="font-semibold text-success-700 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Low Risk Shows - On Track
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {greenShows.map(show => (
              <Link
                key={show.id}
                to={`/tours/${tourId}/shows/${show.id}`}
                className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {show.city}{show.stateCountry ? `, ${show.stateCountry}` : ''} - {show.venueName}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(show.showDate)}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
