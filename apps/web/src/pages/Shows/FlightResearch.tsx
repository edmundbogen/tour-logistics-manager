import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plane, Clock, AlertTriangle, Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getShow, createFlight, updateFlight, deleteFlight } from '../../lib/api';
import { formatDate, formatTime, cn } from '../../lib/utils';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { differenceInMinutes, parseISO } from 'date-fns';

export default function FlightResearch() {
  const { tourId, showId } = useParams<{ tourId: string; showId: string }>();
  const queryClient = useQueryClient();

  const { data: show, isLoading } = useQuery({
    queryKey: ['show', tourId, showId],
    queryFn: () => getShow(tourId!, showId!),
    enabled: !!tourId && !!showId
  });

  const { register, handleSubmit, reset } = useForm();

  const addFlightMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createFlight(showId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show', tourId, showId] });
      reset();
      toast.success('Flight option added');
    }
  });

  const updateFlightMutation = useMutation({
    mutationFn: ({ flightId, data }: { flightId: string; data: Record<string, unknown> }) =>
      updateFlight(showId!, flightId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show', tourId, showId] });
      toast.success('Flight updated');
    }
  });

  const deleteFlightMutation = useMutation({
    mutationFn: (flightId: string) => deleteFlight(showId!, flightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show', tourId, showId] });
      toast.success('Flight removed');
    }
  });

  if (isLoading || !show) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const flights = show.flights || [];
  const transport = show.groundTransports?.[0];
  const transportMinutes = transport?.airportToVenueMinutes || 45;

  // Calculate latest acceptable arrival
  const [onSiteHours, onSiteMinutes] = show.requiredOnSiteTime.split(':').map(Number);
  const bufferHours = 3; // 3 hours domestic buffer
  const latestArrivalHours = onSiteHours - bufferHours - Math.ceil(transportMinutes / 60);
  const latestArrivalTime = `${latestArrivalHours.toString().padStart(2, '0')}:${onSiteMinutes.toString().padStart(2, '0')}`;

  const calculateBuffer = (arrivalTime: string | undefined) => {
    if (!arrivalTime) return null;
    const arrival = parseISO(arrivalTime);
    const arrivalWithTransport = new Date(arrival.getTime() + transportMinutes * 60000);

    const [hours, mins] = show.requiredOnSiteTime.split(':').map(Number);
    const onSite = new Date(show.showDate);
    onSite.setHours(hours, mins, 0, 0);

    return differenceInMinutes(onSite, arrivalWithTransport);
  };

  const onSubmit = (data: Record<string, unknown>) => {
    const nextOptionNumber = flights.length + 1;
    addFlightMutation.mutate({
      ...data,
      optionNumber: nextOptionNumber,
      isPrimary: flights.length === 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to={`/tours/${tourId}/shows/${showId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flight Research</h1>
          <p className="text-gray-500">
            {show.city} - {show.venueName} • {formatDate(show.showDate)}
          </p>
        </div>
      </div>

      {/* Requirements */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Travel Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm text-gray-500">Required On-Site</label>
            <p className="text-lg font-semibold text-gray-900">{formatTime(show.requiredOnSiteTime)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm text-gray-500">Ground Transport Time</label>
            <p className="text-lg font-semibold text-gray-900">{transportMinutes} min</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm text-gray-500">Required Buffer</label>
            <p className="text-lg font-semibold text-gray-900">3 hours (domestic)</p>
          </div>
          <div className="p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
            <label className="text-sm text-primary-600">Latest Acceptable Arrival</label>
            <p className="text-lg font-bold text-primary-600">{formatTime(latestArrivalTime)}</p>
          </div>
        </div>
      </div>

      {/* Flight Options */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Flight Options (Compare up to 3)</h2>
        </div>
        <div className="p-5">
          {flights.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No flight options added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {flights.map(flight => {
                const bufferMinutes = calculateBuffer(flight.arrivalDatetime);
                const isGoodBuffer = bufferMinutes && bufferMinutes >= 180;
                const isMarginalBuffer = bufferMinutes && bufferMinutes >= 120 && bufferMinutes < 180;

                return (
                  <div
                    key={flight.id}
                    className={cn(
                      'p-4 rounded-lg border-2',
                      flight.isPrimary ? 'border-primary-500 bg-primary-50' : 'border-gray-200',
                      flight.isBackup && 'border-warning-500 bg-warning-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">Option {flight.optionNumber}</span>
                      <div className="flex items-center space-x-2">
                        {flight.isPrimary && (
                          <span className="badge badge-green">Primary</span>
                        )}
                        {flight.isBackup && (
                          <span className="badge badge-yellow">Backup</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Flight</span>
                        <span className="font-medium">{flight.airline} {flight.flightNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Route</span>
                        <span className="font-medium">{flight.originAirport} → {flight.destinationAirport}</span>
                      </div>
                      {flight.departureDatetime && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Departs</span>
                          <span className="font-medium">
                            {new Date(flight.departureDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      {flight.arrivalDatetime && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Arrives</span>
                          <span className="font-medium">
                            {new Date(flight.arrivalDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      {flight.price && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price</span>
                          <span className="font-medium">${flight.price}</span>
                        </div>
                      )}
                    </div>

                    {bufferMinutes !== null && (
                      <div className={cn(
                        'mt-3 p-2 rounded text-sm flex items-center',
                        isGoodBuffer && 'bg-success-50 text-success-700',
                        isMarginalBuffer && 'bg-warning-50 text-warning-700',
                        !isGoodBuffer && !isMarginalBuffer && 'bg-danger-50 text-danger-700'
                      )}>
                        {isGoodBuffer ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 mr-1" />
                        )}
                        Buffer: {Math.floor(bufferMinutes / 60)}h {bufferMinutes % 60}m
                      </div>
                    )}

                    <div className="mt-4 flex space-x-2">
                      {!flight.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateFlightMutation.mutate({
                            flightId: flight.id,
                            data: { isPrimary: true }
                          })}
                        >
                          Set Primary
                        </Button>
                      )}
                      {!flight.isBackup && !flight.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateFlightMutation.mutate({
                            flightId: flight.id,
                            data: { isBackup: true }
                          })}
                        >
                          Set Backup
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteFlightMutation.mutate(flight.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Flight Form */}
          {flights.length < 3 && (
            <div className="mt-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Flight Option {flights.length + 1}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Origin"
                    {...register('originAirport')}
                    placeholder="JFK"
                  />
                  <Input
                    label="Destination"
                    {...register('destinationAirport')}
                    placeholder="LAX"
                  />
                  <Input
                    label="Airline"
                    {...register('airline')}
                    placeholder="Delta"
                  />
                  <Input
                    label="Flight #"
                    {...register('flightNumber')}
                    placeholder="DL 123"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Departure"
                    type="datetime-local"
                    {...register('departureDatetime')}
                  />
                  <Input
                    label="Arrival"
                    type="datetime-local"
                    {...register('arrivalDatetime')}
                  />
                  <Input
                    label="Price"
                    type="number"
                    {...register('price')}
                    placeholder="350"
                  />
                  <div className="flex items-end">
                    <Button type="submit" loading={addFlightMutation.isPending}>
                      Add Option
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Flight Research Tips */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Flight Research Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <Check className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
            Aim for 3+ hours buffer before on-site time (5+ hours for international)
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
            Always book a backup option on a different carrier
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
            Avoid tight connections (&lt;90 min international, &lt;60 min domestic)
          </li>
          <li className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
            Flag weather-prone routes (winter in northern cities, hurricane season in coastal areas)
          </li>
          <li className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
            Consider overnight flights carefully - they can affect performance
          </li>
        </ul>
      </div>
    </div>
  );
}
