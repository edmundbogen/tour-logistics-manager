import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const checklistTemplates = [
  {
    name: 'Deal Memo Intake',
    category: 'Pre-Tour',
    items: [
      { id: uuidv4(), text: 'Verify venue name and complete address', completed: false },
      { id: uuidv4(), text: 'Confirm show date and time', completed: false },
      { id: uuidv4(), text: 'Document guarantee/door split terms', completed: false },
      { id: uuidv4(), text: 'Record venue contact information', completed: false },
      { id: uuidv4(), text: 'Note capacity and age restrictions', completed: false },
      { id: uuidv4(), text: 'Document merch split terms', completed: false },
      { id: uuidv4(), text: 'Confirm deposit amount and due date', completed: false },
      { id: uuidv4(), text: 'Record settlement time and process', completed: false },
      { id: uuidv4(), text: 'Note any special requirements or riders', completed: false },
      { id: uuidv4(), text: 'File signed deal memo', completed: false }
    ]
  },
  {
    name: 'Pre-Show Week (7 Days Out)',
    category: 'Pre-Show',
    items: [
      { id: uuidv4(), text: 'Confirm flight is still on schedule', completed: false },
      { id: uuidv4(), text: 'Verify hotel reservation', completed: false },
      { id: uuidv4(), text: 'Confirm ground transportation', completed: false },
      { id: uuidv4(), text: 'Send advance to venue (if applicable)', completed: false },
      { id: uuidv4(), text: 'Confirm production requirements are met', completed: false },
      { id: uuidv4(), text: 'Verify catering order', completed: false },
      { id: uuidv4(), text: 'Check weather forecast for travel dates', completed: false },
      { id: uuidv4(), text: 'Distribute run of show to team', completed: false },
      { id: uuidv4(), text: 'Confirm all contacts have correct phone numbers', completed: false }
    ]
  },
  {
    name: '48-Hour Pre-Show',
    category: 'Pre-Show',
    items: [
      { id: uuidv4(), text: 'Final flight status check', completed: false },
      { id: uuidv4(), text: 'Confirm driver has correct pickup location and time', completed: false },
      { id: uuidv4(), text: 'Re-confirm hotel early check-in if needed', completed: false },
      { id: uuidv4(), text: 'Send final confirmation to venue contact', completed: false },
      { id: uuidv4(), text: 'Verify soundcheck time is confirmed', completed: false },
      { id: uuidv4(), text: 'Check for any schedule conflicts', completed: false },
      { id: uuidv4(), text: 'Confirm credentials/guest list process', completed: false },
      { id: uuidv4(), text: 'Review backup plan if needed', completed: false },
      { id: uuidv4(), text: 'Send team update with final details', completed: false }
    ]
  },
  {
    name: 'Day-Of-Show: Morning',
    category: 'Day-Of',
    items: [
      { id: uuidv4(), text: 'Check flight status (if traveling today)', completed: false },
      { id: uuidv4(), text: 'Confirm driver is en route', completed: false },
      { id: uuidv4(), text: 'Text day-of contact ETA', completed: false },
      { id: uuidv4(), text: 'Verify parking instructions with driver', completed: false },
      { id: uuidv4(), text: 'Confirm load-in time with production', completed: false },
      { id: uuidv4(), text: 'Check weather conditions', completed: false }
    ]
  },
  {
    name: 'Day-Of-Show: Arrival',
    category: 'Day-Of',
    items: [
      { id: uuidv4(), text: 'Check in with day-of contact upon arrival', completed: false },
      { id: uuidv4(), text: 'Locate green room', completed: false },
      { id: uuidv4(), text: 'Verify catering has arrived', completed: false },
      { id: uuidv4(), text: 'Get WiFi password', completed: false },
      { id: uuidv4(), text: 'Confirm credentials/wristbands received', completed: false },
      { id: uuidv4(), text: 'Walk the venue (stage, green room, merch)', completed: false },
      { id: uuidv4(), text: 'Confirm set times are unchanged', completed: false },
      { id: uuidv4(), text: 'Meet production manager', completed: false }
    ]
  },
  {
    name: 'Day-Of-Show: Pre-Show',
    category: 'Day-Of',
    items: [
      { id: uuidv4(), text: 'Soundcheck completed', completed: false },
      { id: uuidv4(), text: 'Confirm monitor mix is correct', completed: false },
      { id: uuidv4(), text: 'Verify setlist with production', completed: false },
      { id: uuidv4(), text: 'Check merch booth is set up', completed: false },
      { id: uuidv4(), text: 'Guest list submitted', completed: false },
      { id: uuidv4(), text: 'Artist is fed and ready', completed: false },
      { id: uuidv4(), text: 'Confirm curfew time', completed: false },
      { id: uuidv4(), text: 'Know location of settlement after show', completed: false }
    ]
  },
  {
    name: 'Day-Of-Show: Post-Show',
    category: 'Day-Of',
    items: [
      { id: uuidv4(), text: 'Settle with venue', completed: false },
      { id: uuidv4(), text: 'Collect merch count and payout', completed: false },
      { id: uuidv4(), text: 'Gather all gear and personal items', completed: false },
      { id: uuidv4(), text: 'Thank venue contacts', completed: false },
      { id: uuidv4(), text: 'Confirm transport to hotel/airport', completed: false },
      { id: uuidv4(), text: 'Send night-of summary to team', completed: false },
      { id: uuidv4(), text: 'Note any issues for follow-up', completed: false }
    ]
  },
  {
    name: 'Flight Research',
    category: 'Travel',
    items: [
      { id: uuidv4(), text: 'Calculate latest acceptable arrival time', completed: false },
      { id: uuidv4(), text: 'Search for 3 flight options', completed: false },
      { id: uuidv4(), text: 'Verify connection times meet minimums', completed: false },
      { id: uuidv4(), text: 'Identify backup flight on different carrier', completed: false },
      { id: uuidv4(), text: 'Check for weather-prone routes', completed: false },
      { id: uuidv4(), text: 'Compare prices and book best option', completed: false },
      { id: uuidv4(), text: 'Forward confirmation to team', completed: false },
      { id: uuidv4(), text: 'Save airline contact number', completed: false }
    ]
  },
  {
    name: 'Hotel Selection',
    category: 'Travel',
    items: [
      { id: uuidv4(), text: 'Search hotels within 20 min of venue', completed: false },
      { id: uuidv4(), text: 'Verify early check-in availability', completed: false },
      { id: uuidv4(), text: 'Check late checkout options', completed: false },
      { id: uuidv4(), text: 'Confirm distance to airport for next travel', completed: false },
      { id: uuidv4(), text: 'Compare prices with budget', completed: false },
      { id: uuidv4(), text: 'Book and confirm reservation', completed: false },
      { id: uuidv4(), text: 'Save hotel contact number', completed: false }
    ]
  },
  {
    name: 'Ground Transport',
    category: 'Travel',
    items: [
      { id: uuidv4(), text: 'Book car service or rental', completed: false },
      { id: uuidv4(), text: 'Confirm driver has flight details', completed: false },
      { id: uuidv4(), text: 'Share driver contact with team', completed: false },
      { id: uuidv4(), text: 'Verify vehicle type meets needs', completed: false },
      { id: uuidv4(), text: 'Confirm pickup location (arrivals, baggage claim, etc.)', completed: false },
      { id: uuidv4(), text: 'Get estimated travel time to venue', completed: false }
    ]
  },
  {
    name: 'Venue Confirmation',
    category: 'Venue',
    items: [
      { id: uuidv4(), text: 'Email venue contact to confirm show', completed: false },
      { id: uuidv4(), text: 'Verify production requirements received', completed: false },
      { id: uuidv4(), text: 'Confirm load-in time', completed: false },
      { id: uuidv4(), text: 'Get day-of contact phone number', completed: false },
      { id: uuidv4(), text: 'Confirm parking instructions', completed: false },
      { id: uuidv4(), text: 'Verify catering arrangements', completed: false },
      { id: uuidv4(), text: 'Document green room location', completed: false },
      { id: uuidv4(), text: 'Confirm soundcheck time', completed: false }
    ]
  },
  {
    name: 'Emergency Preparedness',
    category: 'Safety',
    items: [
      { id: uuidv4(), text: 'Verify team emergency contacts are current', completed: false },
      { id: uuidv4(), text: 'Locate nearest hospital to venue', completed: false },
      { id: uuidv4(), text: 'Have backup flight researched', completed: false },
      { id: uuidv4(), text: 'Save airline customer service number', completed: false },
      { id: uuidv4(), text: 'Have backup ground transport option', completed: false },
      { id: uuidv4(), text: 'Know venue evacuation procedures', completed: false },
      { id: uuidv4(), text: 'Have backup hotel option identified', completed: false }
    ]
  },
  {
    name: 'Tour Closeout',
    category: 'Post-Tour',
    items: [
      { id: uuidv4(), text: 'Reconcile all show settlements', completed: false },
      { id: uuidv4(), text: 'Collect final merch numbers', completed: false },
      { id: uuidv4(), text: 'Gather all receipts for accounting', completed: false },
      { id: uuidv4(), text: 'Send thank you notes to venues', completed: false },
      { id: uuidv4(), text: 'Document lessons learned', completed: false },
      { id: uuidv4(), text: 'Update contact database', completed: false },
      { id: uuidv4(), text: 'Archive tour documents', completed: false },
      { id: uuidv4(), text: 'Final financial summary to management', completed: false }
    ]
  }
];

async function main() {
  console.log('Seeding database...');

  // Create checklist templates
  for (const template of checklistTemplates) {
    await prisma.checklistTemplate.upsert({
      where: { id: template.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: template.name.toLowerCase().replace(/\s+/g, '-'),
        name: template.name,
        category: template.category,
        items: JSON.stringify(template.items)
      }
    });
  }

  console.log('Checklist templates created.');

  // Create a sample tour for demo purposes
  const tour = await prisma.tour.upsert({
    where: { id: 'demo-tour-2025' },
    update: {},
    create: {
      id: 'demo-tour-2025',
      name: 'Summer Tour 2025',
      artistName: 'Demo Artist',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      tourManagerName: 'Alex Tour Manager',
      tourManagerPhone: '(555) 123-4567',
      tourManagerEmail: 'alex@example.com',
      productionContactName: 'Jordan Production',
      productionContactPhone: '(555) 234-5678',
      agentName: 'Casey Agent',
      agentPhone: '(555) 345-6789',
      managementName: 'Taylor Management',
      managementPhone: '(555) 456-7890',
      notes: 'Demo tour for testing the application.'
    }
  });

  // Create sample shows
  const shows = [
    {
      id: 'demo-show-1',
      tourId: tour.id,
      showNumber: 1,
      city: 'Los Angeles',
      stateCountry: 'CA',
      venueName: 'The Wiltern',
      venueAddress: '3790 Wilshire Blvd, Los Angeles, CA 90010',
      showDate: new Date('2025-06-05'),
      onStageTime: '21:00',
      requiredOnSiteTime: '16:00',
      soundcheckTime: '17:00',
      soundcheckDurationMinutes: 60,
      loadInTime: '14:00',
      doorsTime: '19:00',
      curfewTime: '23:00',
      venueContactName: 'Maria Venue',
      venueContactPhone: '(213) 555-0100',
      venueContactEmail: 'maria@wiltern.com',
      venueCapacity: 1850,
      overallStatus: 'Confirmed',
      venueStatus: 'Confirmed',
      riskLevel: 'Green'
    },
    {
      id: 'demo-show-2',
      tourId: tour.id,
      showNumber: 2,
      city: 'San Francisco',
      stateCountry: 'CA',
      venueName: 'The Fillmore',
      venueAddress: '1805 Geary Blvd, San Francisco, CA 94115',
      showDate: new Date('2025-06-07'),
      onStageTime: '21:00',
      requiredOnSiteTime: '16:00',
      soundcheckTime: '17:00',
      soundcheckDurationMinutes: 60,
      loadInTime: '14:00',
      doorsTime: '19:00',
      curfewTime: '23:30',
      venueContactName: 'David Fillmore',
      venueContactPhone: '(415) 555-0200',
      venueCapacity: 1315,
      overallStatus: 'In Progress',
      venueStatus: 'Confirmed',
      riskLevel: 'Yellow'
    },
    {
      id: 'demo-show-3',
      tourId: tour.id,
      showNumber: 3,
      city: 'Seattle',
      stateCountry: 'WA',
      venueName: 'The Showbox',
      venueAddress: '1426 1st Ave, Seattle, WA 98101',
      showDate: new Date('2025-06-10'),
      onStageTime: '21:00',
      requiredOnSiteTime: '16:00',
      soundcheckTime: '17:00',
      loadInTime: '14:00',
      doorsTime: '19:00',
      venueContactName: 'Sarah Seattle',
      venueContactPhone: '(206) 555-0300',
      venueCapacity: 1100,
      overallStatus: 'Not Started',
      venueStatus: 'Pending',
      riskLevel: 'Red'
    }
  ];

  for (const show of shows) {
    await prisma.show.upsert({
      where: { id: show.id },
      update: {},
      create: show
    });
  }

  console.log('Sample tour and shows created.');

  // Create sample flights for show 1
  await prisma.flight.upsert({
    where: { id: 'demo-flight-1' },
    update: {},
    create: {
      id: 'demo-flight-1',
      showId: 'demo-show-1',
      originAirport: 'JFK',
      destinationAirport: 'LAX',
      optionNumber: 1,
      airline: 'Delta',
      flightNumber: 'DL 123',
      departureDatetime: new Date('2025-06-05T06:00:00'),
      arrivalDatetime: new Date('2025-06-05T09:30:00'),
      isPrimary: true,
      status: 'Booked',
      confirmationNumber: 'ABC123'
    }
  });

  // Create sample hotel for show 1
  await prisma.hotel.upsert({
    where: { id: 'demo-hotel-1' },
    update: {},
    create: {
      id: 'demo-hotel-1',
      showId: 'demo-show-1',
      hotelName: 'The LINE LA',
      hotelAddress: '3515 Wilshire Blvd, Los Angeles, CA 90010',
      hotelPhone: '(213) 555-1000',
      confirmationNumber: 'HTL456',
      checkInDate: new Date('2025-06-05'),
      checkInTime: '15:00',
      checkOutDate: new Date('2025-06-06'),
      checkOutTime: '11:00',
      distanceToVenueMinutes: 5,
      pricePerNight: 289,
      status: 'Booked'
    }
  });

  // Create sample transport for show 1
  await prisma.groundTransport.upsert({
    where: { id: 'demo-transport-1' },
    update: {},
    create: {
      id: 'demo-transport-1',
      showId: 'demo-show-1',
      transportType: 'Car Service',
      driverName: 'Mike Driver',
      driverPhone: '(310) 555-8000',
      driverCompany: 'LA Elite Cars',
      confirmationNumber: 'CAR789',
      pickupLocation: 'LAX Terminal 3, Baggage Claim',
      pickupDatetime: new Date('2025-06-05T09:45:00'),
      vehicleType: 'Black SUV',
      airportToVenueMinutes: 45,
      status: 'Booked'
    }
  });

  // Create sample team members
  const teamMembers = [
    {
      id: 'team-1',
      tourId: tour.id,
      name: 'Alex Tour Manager',
      role: 'Tour Manager',
      email: 'alex@example.com',
      phone: '(555) 123-4567',
      emergencyContactName: 'Pat Emergency',
      emergencyContactPhone: '(555) 999-0001'
    },
    {
      id: 'team-2',
      tourId: tour.id,
      name: 'Jordan Production',
      role: 'Production Manager',
      email: 'jordan@example.com',
      phone: '(555) 234-5678'
    },
    {
      id: 'team-3',
      tourId: tour.id,
      name: 'Riley Sound',
      role: 'FOH Engineer',
      email: 'riley@example.com',
      phone: '(555) 345-6789'
    }
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { id: member.id },
      update: {},
      create: member
    });
  }

  console.log('Sample team members created.');
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
