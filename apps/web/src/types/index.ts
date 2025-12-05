export interface Tour {
  id: string;
  name: string;
  artistName: string;
  startDate: string;
  endDate: string;
  tourManagerName?: string;
  tourManagerPhone?: string;
  tourManagerEmail?: string;
  productionContactName?: string;
  productionContactPhone?: string;
  agentName?: string;
  agentPhone?: string;
  managementName?: string;
  managementPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shows?: Show[];
  teamMembers?: TeamMember[];
  showCount?: number;
  statusCounts?: {
    notStarted: number;
    inProgress: number;
    confirmed: number;
    completed: number;
  };
  riskCounts?: {
    green: number;
    yellow: number;
    red: number;
  };
}

export interface Show {
  id: string;
  tourId: string;
  showNumber?: number;
  city: string;
  stateCountry?: string;
  venueName: string;
  venueAddress?: string;
  showDate: string;
  onStageTime?: string;
  setLengthMinutes?: number;
  doorsTime?: string;
  curfewTime?: string;
  requiredOnSiteTime: string;
  soundcheckTime?: string;
  soundcheckDurationMinutes?: number;
  loadInTime?: string;
  venueContactName?: string;
  venueContactEmail?: string;
  venueContactPhone?: string;
  dayOfContactName?: string;
  dayOfContactPhone?: string;
  productionContactName?: string;
  productionContactPhone?: string;
  parkingInstructions?: string;
  credentialsProcess?: string;
  greenRoomInfo?: string;
  cateringInfo?: string;
  wifiInfo?: string;
  venueCapacity?: number;
  ageRestriction?: string;
  guarantee?: number;
  doorSplit?: string;
  merchSplit?: string;
  settlementTime?: string;
  depositReceived?: boolean;
  depositAmount?: number;
  overallStatus: 'Not Started' | 'In Progress' | 'Confirmed' | 'Completed';
  venueStatus: 'Pending' | 'Confirmed' | 'Unconfirmed';
  riskLevel: 'Green' | 'Yellow' | 'Red';
  riskNotes?: string;
  backupPlan?: string;
  specialNotes?: string;
  postShowNotes?: string;
  createdAt: string;
  updatedAt: string;
  tour?: Tour;
  flights?: Flight[];
  hotels?: Hotel[];
  groundTransports?: GroundTransport[];
  checklists?: ChecklistInstance[];
  calculatedRiskLevel?: 'Green' | 'Yellow' | 'Red';
}

export interface Flight {
  id: string;
  showId: string;
  originAirport: string;
  destinationAirport: string;
  optionNumber: number;
  airline?: string;
  flightNumber?: string;
  departureDatetime?: string;
  arrivalDatetime?: string;
  isPrimary: boolean;
  isBackup: boolean;
  confirmationNumber?: string;
  airlinePhone?: string;
  price?: number;
  status: 'Not Booked' | 'Booked' | 'Confirmed' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  showId: string;
  hotelName: string;
  hotelAddress?: string;
  hotelPhone?: string;
  confirmationNumber?: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  roomType?: string;
  distanceToVenueMinutes?: number;
  distanceToAirportMinutes?: number;
  pricePerNight?: number;
  earlyCheckinAvailable?: boolean;
  lateCheckoutAvailable?: boolean;
  notes?: string;
  status: 'Not Booked' | 'Booked' | 'Confirmed';
  createdAt: string;
  updatedAt: string;
}

export interface GroundTransport {
  id: string;
  showId: string;
  transportType?: 'Car Service' | 'Rideshare' | 'Rental' | 'Bus';
  driverName?: string;
  driverPhone?: string;
  driverCompany?: string;
  confirmationNumber?: string;
  pickupLocation?: string;
  pickupDatetime?: string;
  vehicleType?: string;
  airportToVenueMinutes?: number;
  price?: number;
  notes?: string;
  status: 'Not Booked' | 'Booked' | 'Confirmed';
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  tourId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  category: string;
  items: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistInstance {
  id: string;
  showId: string;
  templateId: string;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  template?: ChecklistTemplate;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  tourId?: string;
  showId?: string;
  actionType: string;
  description: string;
  createdBy?: string;
  createdAt: string;
}

export interface RunOfShow {
  header: {
    tourName: string;
    artistName: string;
    showDate: string;
    city: string;
    venue: string;
    showNumber?: number;
  };
  venue: {
    name: string;
    address?: string;
    capacity?: number;
    ageRestriction?: string;
    parking?: string;
    credentials?: string;
    greenRoom?: string;
    catering?: string;
    wifi?: string;
  };
  contacts: {
    venueContact: { name?: string; phone?: string; email?: string };
    dayOfContact: { name?: string; phone?: string };
    productionContact: { name?: string; phone?: string };
    tourManager: { name?: string; phone?: string; email?: string };
  };
  travel: {
    flight?: {
      airline?: string;
      flightNumber?: string;
      departure?: string;
      arrival?: string;
      confirmation?: string;
    };
    transport?: {
      type?: string;
      driver?: string;
      phone?: string;
      company?: string;
      confirmation?: string;
      pickup?: string;
    };
    hotel?: {
      name?: string;
      address?: string;
      phone?: string;
      confirmation?: string;
      checkIn?: string;
      checkOut?: string;
    };
  };
  timeline: Array<{ time: string; activity: string; notes?: string }>;
  notes: {
    special?: string;
    backup?: string;
    risk?: string;
  };
  riskLevel: string;
  generatedAt: string;
}
