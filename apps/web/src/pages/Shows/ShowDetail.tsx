import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Plane,
  Building2,
  Car,
  Users,
  FileText,
  CheckSquare,
  AlertTriangle,
  Phone,
  Mail,
  Edit,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getShow, updateShow, createFlight, createHotel, createTransport } from '../../lib/api';
import { formatDate, formatTime, getStatusColor, getRiskColor, cn } from '../../lib/utils';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useForm } from 'react-hook-form';

export default function ShowDetail() {
  const { tourId, showId } = useParams<{ tourId: string; showId: string }>();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: show, isLoading } = useQuery({
    queryKey: ['show', tourId, showId],
    queryFn: () => getShow(tourId!, showId!),
    enabled: !!tourId && !!showId
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateShow(tourId!, showId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show', tourId, showId] });
      toast.success('Show updated');
    }
  });

  const addFlightMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createFlight(showId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show', tourId, showId] });
      setActiveSection(null);
      toast.success('Flight added');
    }
  });

  const addHotelMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createHotel(showId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show', tourId, showId] });
      setActiveSection(null);
      toast.success('Hotel added');
    }
  });

  const addTransportMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createTransport(showId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show', tourId, showId] });
      setActiveSection(null);
      toast.success('Transport added');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!show) {
    return <div>Show not found</div>;
  }

  const primaryFlight = show.flights?.find(f => f.isPrimary);
  const hotel = show.hotels?.[0];
  const transport = show.groundTransports?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/tours/${tourId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {show.city}{show.stateCountry ? `, ${show.stateCountry}` : ''}
              </h1>
              <span className={cn('badge', getRiskColor(show.calculatedRiskLevel || show.riskLevel))}>
                {show.calculatedRiskLevel || show.riskLevel} Risk
              </span>
            </div>
            <p className="text-gray-500 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {show.venueName}
              <span className="mx-2">•</span>
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(show.showDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link to={`/tours/${tourId}/shows/${showId}/run-of-show`}>
            <Button variant="secondary">
              <FileText className="h-4 w-4 mr-2" />
              Run of Show
            </Button>
          </Link>
          <Link to={`/tours/${tourId}/shows/${showId}/flights`}>
            <Button variant="secondary">
              <Plane className="h-4 w-4 mr-2" />
              Flight Research
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Venue Information */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Venue Information
              </h2>
              <span className={cn('badge', getStatusColor(show.venueStatus))}>
                {show.venueStatus}
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Venue Name</label>
                  <p className="font-medium text-gray-900">{show.venueName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Capacity</label>
                  <p className="font-medium text-gray-900">{show.venueCapacity || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium text-gray-900">{show.venueAddress || '-'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Venue Contact</label>
                  <p className="font-medium text-gray-900">{show.venueContactName || '-'}</p>
                  {show.venueContactPhone && (
                    <a href={`tel:${show.venueContactPhone}`} className="text-sm text-primary-600 flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      {show.venueContactPhone}
                    </a>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">Day-Of Contact</label>
                  <p className="font-medium text-gray-900">{show.dayOfContactName || '-'}</p>
                  {show.dayOfContactPhone && (
                    <a href={`tel:${show.dayOfContactPhone}`} className="text-sm text-primary-600 flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      {show.dayOfContactPhone}
                    </a>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">Production</label>
                  <p className="font-medium text-gray-900">{show.productionContactName || '-'}</p>
                  {show.productionContactPhone && (
                    <a href={`tel:${show.productionContactPhone}`} className="text-sm text-primary-600 flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      {show.productionContactPhone}
                    </a>
                  )}
                </div>
              </div>

              {(show.parkingInstructions || show.greenRoomInfo || show.wifiInfo) && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {show.parkingInstructions && (
                    <div>
                      <label className="text-sm text-gray-500">Parking</label>
                      <p className="text-sm text-gray-900">{show.parkingInstructions}</p>
                    </div>
                  )}
                  {show.greenRoomInfo && (
                    <div>
                      <label className="text-sm text-gray-500">Green Room</label>
                      <p className="text-sm text-gray-900">{show.greenRoomInfo}</p>
                    </div>
                  )}
                  {show.wifiInfo && (
                    <div>
                      <label className="text-sm text-gray-500">WiFi</label>
                      <p className="text-sm text-gray-900">{show.wifiInfo}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Travel Section */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center">
                <Plane className="h-5 w-5 mr-2 text-primary-600" />
                Travel
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Flight */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <Plane className="h-4 w-4 mr-2" />
                    Flight
                  </h3>
                  {primaryFlight ? (
                    <span className={cn('badge', getStatusColor(primaryFlight.status))}>
                      {primaryFlight.status}
                    </span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setActiveSection('flight')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                {primaryFlight ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Flight:</span>
                      <span className="ml-2 font-medium">{primaryFlight.airline} {primaryFlight.flightNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Route:</span>
                      <span className="ml-2 font-medium">{primaryFlight.originAirport} → {primaryFlight.destinationAirport}</span>
                    </div>
                    {primaryFlight.departureDatetime && (
                      <div>
                        <span className="text-gray-500">Departure:</span>
                        <span className="ml-2 font-medium">
                          {new Date(primaryFlight.departureDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {primaryFlight.arrivalDatetime && (
                      <div>
                        <span className="text-gray-500">Arrival:</span>
                        <span className="ml-2 font-medium">
                          {new Date(primaryFlight.arrivalDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {primaryFlight.confirmationNumber && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Confirmation:</span>
                        <span className="ml-2 font-mono font-medium">{primaryFlight.confirmationNumber}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No flight booked</p>
                )}
              </div>

              {/* Hotel */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Hotel
                  </h3>
                  {hotel ? (
                    <span className={cn('badge', getStatusColor(hotel.status))}>
                      {hotel.status}
                    </span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setActiveSection('hotel')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                {hotel ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2">
                      <span className="text-gray-500">Hotel:</span>
                      <span className="ml-2 font-medium">{hotel.hotelName}</span>
                    </div>
                    {hotel.hotelAddress && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Address:</span>
                        <span className="ml-2">{hotel.hotelAddress}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Check-in:</span>
                      <span className="ml-2 font-medium">{hotel.checkInTime || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <span className="ml-2 font-medium">{hotel.checkOutTime || '-'}</span>
                    </div>
                    {hotel.confirmationNumber && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Confirmation:</span>
                        <span className="ml-2 font-mono font-medium">{hotel.confirmationNumber}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hotel booked</p>
                )}
              </div>

              {/* Ground Transport */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    Ground Transport
                  </h3>
                  {transport ? (
                    <span className={cn('badge', getStatusColor(transport.status))}>
                      {transport.status}
                    </span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setActiveSection('transport')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                {transport ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{transport.transportType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Vehicle:</span>
                      <span className="ml-2 font-medium">{transport.vehicleType || '-'}</span>
                    </div>
                    {transport.driverName && (
                      <div>
                        <span className="text-gray-500">Driver:</span>
                        <span className="ml-2 font-medium">{transport.driverName}</span>
                      </div>
                    )}
                    {transport.driverPhone && (
                      <div>
                        <a href={`tel:${transport.driverPhone}`} className="text-primary-600 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {transport.driverPhone}
                        </a>
                      </div>
                    )}
                    {transport.pickupLocation && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Pickup:</span>
                        <span className="ml-2">{transport.pickupLocation}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No transport booked</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes & Backup */}
          {(show.specialNotes || show.backupPlan || show.riskNotes) && (
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Notes & Backup Plan</h2>
              </div>
              <div className="p-5 space-y-4">
                {show.specialNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Special Notes</label>
                    <p className="text-gray-900 mt-1">{show.specialNotes}</p>
                  </div>
                )}
                {show.backupPlan && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Backup Plan</label>
                    <p className="text-gray-900 mt-1">{show.backupPlan}</p>
                  </div>
                )}
                {show.riskNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-warning-500" />
                      Risk Notes
                    </label>
                    <p className="text-gray-900 mt-1">{show.riskNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Show Times */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                Schedule
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {show.loadInTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Load In</span>
                  <span className="font-medium">{formatTime(show.loadInTime)}</span>
                </div>
              )}
              {show.soundcheckTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Soundcheck</span>
                  <span className="font-medium">{formatTime(show.soundcheckTime)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Required On-Site</span>
                <span className="font-medium text-primary-600">{formatTime(show.requiredOnSiteTime)}</span>
              </div>
              {show.doorsTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Doors</span>
                  <span className="font-medium">{formatTime(show.doorsTime)}</span>
                </div>
              )}
              {show.onStageTime && (
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">On Stage</span>
                  <span className="text-primary-600">{formatTime(show.onStageTime)}</span>
                </div>
              )}
              {show.curfewTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Curfew</span>
                  <span className="font-medium">{formatTime(show.curfewTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Status</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Overall</span>
                <span className={cn('badge', getStatusColor(show.overallStatus))}>
                  {show.overallStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Venue</span>
                <span className={cn('badge', getStatusColor(show.venueStatus))}>
                  {show.venueStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Risk Level</span>
                <span className={cn('badge', getRiskColor(show.calculatedRiskLevel || show.riskLevel))}>
                  {show.calculatedRiskLevel || show.riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-5 space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => updateMutation.mutate({ overallStatus: 'Confirmed' })}
            >
              Mark as Confirmed
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => updateMutation.mutate({ overallStatus: 'Completed' })}
            >
              Mark as Completed
            </Button>
          </div>
        </div>
      </div>

      {/* Add Flight Modal */}
      <Modal
        isOpen={activeSection === 'flight'}
        onClose={() => setActiveSection(null)}
        title="Add Flight"
      >
        <FlightForm
          onSubmit={(data) => addFlightMutation.mutate(data)}
          isLoading={addFlightMutation.isPending}
          onCancel={() => setActiveSection(null)}
        />
      </Modal>

      {/* Add Hotel Modal */}
      <Modal
        isOpen={activeSection === 'hotel'}
        onClose={() => setActiveSection(null)}
        title="Add Hotel"
      >
        <HotelForm
          onSubmit={(data) => addHotelMutation.mutate(data)}
          isLoading={addHotelMutation.isPending}
          onCancel={() => setActiveSection(null)}
        />
      </Modal>

      {/* Add Transport Modal */}
      <Modal
        isOpen={activeSection === 'transport'}
        onClose={() => setActiveSection(null)}
        title="Add Ground Transport"
      >
        <TransportForm
          onSubmit={(data) => addTransportMutation.mutate(data)}
          isLoading={addTransportMutation.isPending}
          onCancel={() => setActiveSection(null)}
        />
      </Modal>
    </div>
  );
}

// Flight Form Component
function FlightForm({ onSubmit, isLoading, onCancel }: { onSubmit: (data: Record<string, unknown>) => void; isLoading: boolean; onCancel: () => void }) {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Origin Airport" {...register('originAirport')} placeholder="JFK" />
        <Input label="Destination Airport" {...register('destinationAirport')} placeholder="LAX" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Airline" {...register('airline')} placeholder="Delta" />
        <Input label="Flight Number" {...register('flightNumber')} placeholder="DL 123" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Departure" type="datetime-local" {...register('departureDatetime')} />
        <Input label="Arrival" type="datetime-local" {...register('arrivalDatetime')} />
      </div>
      <Input label="Confirmation Number" {...register('confirmationNumber')} />
      <input type="hidden" {...register('optionNumber')} value="1" />
      <input type="hidden" {...register('isPrimary')} value="true" />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Add Flight</Button>
      </div>
    </form>
  );
}

// Hotel Form Component
function HotelForm({ onSubmit, isLoading, onCancel }: { onSubmit: (data: Record<string, unknown>) => void; isLoading: boolean; onCancel: () => void }) {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Hotel Name" {...register('hotelName')} placeholder="Hotel Name" />
      <Input label="Address" {...register('hotelAddress')} placeholder="Full Address" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" {...register('hotelPhone')} placeholder="(555) 123-4567" />
        <Input label="Confirmation" {...register('confirmationNumber')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Check-in Time" type="time" {...register('checkInTime')} />
        <Input label="Check-out Time" type="time" {...register('checkOutTime')} />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Add Hotel</Button>
      </div>
    </form>
  );
}

// Transport Form Component
function TransportForm({ onSubmit, isLoading, onCancel }: { onSubmit: (data: Record<string, unknown>) => void; isLoading: boolean; onCancel: () => void }) {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Transport Type"
        {...register('transportType')}
        options={[
          { value: 'Car Service', label: 'Car Service' },
          { value: 'Rideshare', label: 'Rideshare' },
          { value: 'Rental', label: 'Rental Car' },
          { value: 'Bus', label: 'Tour Bus' }
        ]}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Driver Name" {...register('driverName')} />
        <Input label="Driver Phone" {...register('driverPhone')} />
      </div>
      <Input label="Company" {...register('driverCompany')} />
      <Input label="Pickup Location" {...register('pickupLocation')} />
      <Input label="Vehicle Type" {...register('vehicleType')} placeholder="Black SUV" />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Add Transport</Button>
      </div>
    </form>
  );
}
