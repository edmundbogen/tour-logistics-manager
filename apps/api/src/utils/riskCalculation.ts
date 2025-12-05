import { Flight, Show, GroundTransport } from '@prisma/client';
import { differenceInMinutes, parseISO, setHours, setMinutes } from 'date-fns';

interface TimeString {
  hours: number;
  minutes: number;
}

function parseTimeString(timeStr: string): TimeString {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function getOnSiteDateTime(showDate: Date, onSiteTime: string): Date {
  const time = parseTimeString(onSiteTime);
  return setMinutes(setHours(showDate, time.hours), time.minutes);
}

function isInternationalRoute(origin: string, destination: string): boolean {
  // Simple check - assumes 3-letter codes starting with same letter are domestic
  // In production, would use a proper airport database
  const usAirports = ['JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'ATL', 'MIA', 'BOS', 'LAS', 'PHX', 'IAH', 'MSP', 'DTW', 'PHL', 'LGA', 'EWR', 'SAN', 'TPA', 'PDX', 'STL', 'BNA', 'AUS', 'RDU', 'CLE', 'SMF', 'SJC', 'OAK', 'MCI', 'IND', 'CMH', 'SNA', 'SAT', 'PIT', 'CVG', 'MKE', 'JAX', 'OMA', 'ABQ', 'BDL', 'BUF', 'OKC', 'ONT', 'RIC', 'TUL', 'SDF'];

  const originIsUS = usAirports.includes(origin.toUpperCase());
  const destIsUS = usAirports.includes(destination.toUpperCase());

  return originIsUS !== destIsUS;
}

function isWeatherProneRoute(origin: string, destination: string, month: number): boolean {
  const winterMonths = [11, 0, 1, 2]; // Dec, Jan, Feb, Mar
  const hurricaneMonths = [7, 8, 9]; // Aug, Sep, Oct

  const northernAirports = ['ORD', 'DEN', 'MSP', 'DTW', 'CLE', 'BOS', 'BUF', 'MKE', 'PIT'];
  const hurricaneAirports = ['MIA', 'TPA', 'JAX', 'IAH', 'MSY', 'ATL'];

  if (winterMonths.includes(month)) {
    if (northernAirports.includes(origin) || northernAirports.includes(destination)) {
      return true;
    }
  }

  if (hurricaneMonths.includes(month)) {
    if (hurricaneAirports.includes(origin) || hurricaneAirports.includes(destination)) {
      return true;
    }
  }

  return false;
}

function isOvernightFlight(flight: Flight): boolean {
  if (!flight.departureDatetime || !flight.arrivalDatetime) return false;

  const depHour = new Date(flight.departureDatetime).getHours();
  const arrHour = new Date(flight.arrivalDatetime).getHours();

  // Departure after 10 PM or arrival before 6 AM
  return depHour >= 22 || arrHour < 6;
}

export function calculateRiskLevel(
  show: Show,
  flights: Flight[],
  transport?: GroundTransport | null
): 'Green' | 'Yellow' | 'Red' {
  const primaryFlight = flights.find(f => f.isPrimary);
  const backupFlight = flights.find(f => f.isBackup);

  // RED: No primary flight
  if (!primaryFlight || !primaryFlight.arrivalDatetime) {
    return 'Red';
  }

  const arrivalTime = new Date(primaryFlight.arrivalDatetime);
  const onSiteTime = getOnSiteDateTime(show.showDate, show.requiredOnSiteTime);
  const transportMinutes = transport?.airportToVenueMinutes || 45; // Default 45 min

  // Calculate buffer in minutes
  const totalTravelMinutes = transportMinutes;
  const arrivalWithTravel = new Date(arrivalTime.getTime() + totalTravelMinutes * 60000);
  const bufferMinutes = differenceInMinutes(onSiteTime, arrivalWithTravel);

  const isInternational = isInternationalRoute(
    primaryFlight.originAirport,
    primaryFlight.destinationAirport
  );
  const requiredBuffer = isInternational ? 300 : 180; // 5hr international, 3hr domestic

  // RED conditions
  if (bufferMinutes < 120) { // Less than 2 hours
    return 'Red';
  }

  // Check for critical missing elements
  if (show.venueStatus === 'Unconfirmed' && show.overallStatus !== 'Completed') {
    return 'Red';
  }

  // YELLOW conditions
  if (bufferMinutes < requiredBuffer) {
    return 'Yellow';
  }

  // Only one flight option and no backup
  const flightOptions = flights.filter(f => !f.isBackup).length;
  if (flightOptions === 1 && !backupFlight) {
    return 'Yellow';
  }

  // Weather-prone route
  const showMonth = show.showDate.getMonth();
  if (isWeatherProneRoute(
    primaryFlight.originAirport,
    primaryFlight.destinationAirport,
    showMonth
  )) {
    return 'Yellow';
  }

  // Overnight travel
  if (isOvernightFlight(primaryFlight)) {
    return 'Yellow';
  }

  return 'Green';
}

export function calculateBufferMinutes(
  onSiteTime: string,
  arrivalDatetime: Date,
  transportMinutes: number = 45
): number {
  const arrival = new Date(arrivalDatetime);
  const [hours, minutes] = onSiteTime.split(':').map(Number);

  // Create on-site datetime (using arrival date as base)
  const onSite = new Date(arrival);
  onSite.setHours(hours, minutes, 0, 0);

  const arrivalWithTravel = new Date(arrival.getTime() + transportMinutes * 60000);

  return differenceInMinutes(onSite, arrivalWithTravel);
}
