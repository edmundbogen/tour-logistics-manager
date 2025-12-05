import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Download,
  Copy,
  Printer,
  Clock,
  MapPin,
  Phone,
  Mail,
  Plane,
  Building2,
  Car,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRunOfShow } from '../../lib/api';
import { cn, getRiskColor } from '../../lib/utils';
import Button from '../../components/common/Button';

export default function RunOfShowPage() {
  const { tourId, showId } = useParams<{ tourId: string; showId: string }>();

  const { data: runOfShow, isLoading } = useQuery({
    queryKey: ['runOfShow', showId],
    queryFn: () => getRunOfShow(showId!),
    enabled: !!showId
  });

  const copyToClipboard = () => {
    if (!runOfShow) return;

    const text = generateTextVersion(runOfShow);
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const printPage = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!runOfShow) {
    return <div>Run of show not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header (hide when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Link
            to={`/tours/${tourId}/shows/${showId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Run of Show</h1>
            <p className="text-gray-500">
              {runOfShow.header.city} - {runOfShow.header.showDate}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </Button>
          <Button variant="secondary" onClick={printPage}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Run of Show Document */}
      <div className="card p-8 print:shadow-none print:border-none max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="text-center border-b-2 border-primary-600 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{runOfShow.header.tourName}</h1>
          <h2 className="text-xl text-gray-600 mt-1">{runOfShow.header.artistName}</h2>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <span className={cn('badge text-lg px-4 py-1', getRiskColor(runOfShow.riskLevel))}>
              {runOfShow.riskLevel} Risk
            </span>
          </div>
        </div>

        {/* Show Info */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Date</h3>
              <p className="text-xl font-semibold text-gray-900">{runOfShow.header.showDate}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Show #</h3>
              <p className="text-xl font-semibold text-gray-900">{runOfShow.header.showNumber || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">City</h3>
              <p className="text-xl font-semibold text-gray-900">{runOfShow.header.city}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Venue</h3>
              <p className="text-xl font-semibold text-gray-900">{runOfShow.header.venue}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Day Schedule
          </h3>
          <div className="space-y-3">
            {runOfShow.timeline.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start p-3 rounded-lg',
                  item.activity.includes('ON STAGE') || item.activity.includes('REQUIRED')
                    ? 'bg-primary-50 border-l-4 border-primary-600'
                    : 'bg-gray-50'
                )}
              >
                <span className="font-mono font-semibold text-gray-900 w-24 flex-shrink-0">
                  {item.time}
                </span>
                <div className="flex-1">
                  <span className={cn(
                    'font-medium',
                    item.activity.includes('ON STAGE') || item.activity.includes('REQUIRED')
                      ? 'text-primary-700'
                      : 'text-gray-900'
                  )}>
                    {item.activity}
                  </span>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
            Venue Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="font-medium text-gray-900">{runOfShow.venue.name}</span>
              {runOfShow.venue.address && (
                <p className="text-sm text-gray-600">{runOfShow.venue.address}</p>
              )}
            </div>
            {runOfShow.venue.capacity && (
              <div className="text-sm">
                <span className="text-gray-500">Capacity:</span>
                <span className="ml-2 text-gray-900">{runOfShow.venue.capacity}</span>
              </div>
            )}
            {runOfShow.venue.parking && (
              <div className="text-sm">
                <span className="text-gray-500">Parking:</span>
                <span className="ml-2 text-gray-900">{runOfShow.venue.parking}</span>
              </div>
            )}
            {runOfShow.venue.wifi && (
              <div className="text-sm">
                <span className="text-gray-500">WiFi:</span>
                <span className="ml-2 text-gray-900">{runOfShow.venue.wifi}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contacts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Phone className="h-5 w-5 mr-2 text-primary-600" />
            Key Contacts
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <ContactCard
              title="Venue Contact"
              name={runOfShow.contacts.venueContact.name}
              phone={runOfShow.contacts.venueContact.phone}
              email={runOfShow.contacts.venueContact.email}
            />
            <ContactCard
              title="Day-Of Contact"
              name={runOfShow.contacts.dayOfContact.name}
              phone={runOfShow.contacts.dayOfContact.phone}
            />
            <ContactCard
              title="Production"
              name={runOfShow.contacts.productionContact.name}
              phone={runOfShow.contacts.productionContact.phone}
            />
            <ContactCard
              title="Tour Manager"
              name={runOfShow.contacts.tourManager.name}
              phone={runOfShow.contacts.tourManager.phone}
              email={runOfShow.contacts.tourManager.email}
            />
          </div>
        </div>

        {/* Travel */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Plane className="h-5 w-5 mr-2 text-primary-600" />
            Travel Details
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {runOfShow.travel.flight && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Plane className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Flight</span>
                </div>
                <p className="text-sm text-gray-900">
                  {runOfShow.travel.flight.airline} {runOfShow.travel.flight.flightNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Dep: {runOfShow.travel.flight.departure}
                </p>
                <p className="text-sm text-gray-600">
                  Arr: {runOfShow.travel.flight.arrival}
                </p>
                {runOfShow.travel.flight.confirmation && (
                  <p className="text-xs font-mono mt-2 text-gray-500">
                    Conf: {runOfShow.travel.flight.confirmation}
                  </p>
                )}
              </div>
            )}
            {runOfShow.travel.hotel && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Hotel</span>
                </div>
                <p className="text-sm text-gray-900">{runOfShow.travel.hotel.name}</p>
                <p className="text-sm text-gray-600">
                  Check-in: {runOfShow.travel.hotel.checkIn}
                </p>
                {runOfShow.travel.hotel.phone && (
                  <p className="text-sm text-primary-600 mt-1">{runOfShow.travel.hotel.phone}</p>
                )}
                {runOfShow.travel.hotel.confirmation && (
                  <p className="text-xs font-mono mt-2 text-gray-500">
                    Conf: {runOfShow.travel.hotel.confirmation}
                  </p>
                )}
              </div>
            )}
            {runOfShow.travel.transport && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Car className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Transport</span>
                </div>
                <p className="text-sm text-gray-900">
                  {runOfShow.travel.transport.type}
                </p>
                {runOfShow.travel.transport.driver && (
                  <p className="text-sm text-gray-600">
                    Driver: {runOfShow.travel.transport.driver}
                  </p>
                )}
                {runOfShow.travel.transport.phone && (
                  <p className="text-sm text-primary-600">{runOfShow.travel.transport.phone}</p>
                )}
                {runOfShow.travel.transport.pickup && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pickup: {runOfShow.travel.transport.pickup}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {(runOfShow.notes.special || runOfShow.notes.backup || runOfShow.notes.risk) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <div className="space-y-4">
              {runOfShow.notes.special && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">Special Notes</h4>
                  <p className="text-sm text-gray-600">{runOfShow.notes.special}</p>
                </div>
              )}
              {runOfShow.notes.backup && (
                <div className="p-4 bg-warning-50 rounded-lg">
                  <h4 className="font-medium text-warning-700 mb-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Backup Plan
                  </h4>
                  <p className="text-sm text-gray-700">{runOfShow.notes.backup}</p>
                </div>
              )}
              {runOfShow.notes.risk && (
                <div className="p-4 bg-danger-50 rounded-lg">
                  <h4 className="font-medium text-danger-700 mb-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Risk Notes
                  </h4>
                  <p className="text-sm text-gray-700">{runOfShow.notes.risk}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
          Generated: {new Date(runOfShow.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function ContactCard({ title, name, phone, email }: { title: string; name?: string; phone?: string; email?: string }) {
  if (!name && !phone && !email) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
        <p className="text-sm text-gray-400">Not provided</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
      {name && <p className="font-medium text-gray-900">{name}</p>}
      {phone && (
        <a href={`tel:${phone}`} className="text-sm text-primary-600 flex items-center mt-1">
          <Phone className="h-3 w-3 mr-1" />
          {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="text-sm text-primary-600 flex items-center mt-1">
          <Mail className="h-3 w-3 mr-1" />
          {email}
        </a>
      )}
    </div>
  );
}

function generateTextVersion(runOfShow: any): string {
  let text = `
${runOfShow.header.tourName.toUpperCase()}
${runOfShow.header.artistName}
=====================================

SHOW DETAILS
Date: ${runOfShow.header.showDate}
City: ${runOfShow.header.city}
Venue: ${runOfShow.header.venue}
Risk Level: ${runOfShow.riskLevel}

SCHEDULE
--------
`;

  runOfShow.timeline.forEach((item: any) => {
    text += `${item.time.padEnd(12)} ${item.activity}${item.notes ? ` - ${item.notes}` : ''}\n`;
  });

  text += `
VENUE INFORMATION
-----------------
${runOfShow.venue.name}
${runOfShow.venue.address || ''}
${runOfShow.venue.parking ? `Parking: ${runOfShow.venue.parking}` : ''}
${runOfShow.venue.wifi ? `WiFi: ${runOfShow.venue.wifi}` : ''}

KEY CONTACTS
------------
`;

  if (runOfShow.contacts.venueContact.name) {
    text += `Venue: ${runOfShow.contacts.venueContact.name} - ${runOfShow.contacts.venueContact.phone || ''}\n`;
  }
  if (runOfShow.contacts.dayOfContact.name) {
    text += `Day-Of: ${runOfShow.contacts.dayOfContact.name} - ${runOfShow.contacts.dayOfContact.phone || ''}\n`;
  }
  if (runOfShow.contacts.tourManager.name) {
    text += `Tour Manager: ${runOfShow.contacts.tourManager.name} - ${runOfShow.contacts.tourManager.phone || ''}\n`;
  }

  if (runOfShow.travel.flight) {
    text += `
FLIGHT
------
${runOfShow.travel.flight.airline} ${runOfShow.travel.flight.flightNumber}
Departure: ${runOfShow.travel.flight.departure}
Arrival: ${runOfShow.travel.flight.arrival}
Confirmation: ${runOfShow.travel.flight.confirmation || 'N/A'}
`;
  }

  if (runOfShow.travel.hotel) {
    text += `
HOTEL
-----
${runOfShow.travel.hotel.name}
${runOfShow.travel.hotel.address || ''}
Check-in: ${runOfShow.travel.hotel.checkIn}
Confirmation: ${runOfShow.travel.hotel.confirmation || 'N/A'}
`;
  }

  if (runOfShow.travel.transport) {
    text += `
GROUND TRANSPORT
----------------
${runOfShow.travel.transport.type}
Driver: ${runOfShow.travel.transport.driver || 'N/A'} - ${runOfShow.travel.transport.phone || ''}
Pickup: ${runOfShow.travel.transport.pickup || 'N/A'}
`;
  }

  if (runOfShow.notes.special || runOfShow.notes.backup) {
    text += `
NOTES
-----
`;
    if (runOfShow.notes.special) text += `Special: ${runOfShow.notes.special}\n`;
    if (runOfShow.notes.backup) text += `Backup Plan: ${runOfShow.notes.backup}\n`;
  }

  return text.trim();
}
