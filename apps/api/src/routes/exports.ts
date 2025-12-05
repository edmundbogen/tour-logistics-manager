import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { format } from 'date-fns';

const router = Router();

// GET /api/tours/:id/export/grid - Export tour grid as JSON (for client-side Excel generation)
router.get('/tours/:id/export/grid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: req.params.id },
      include: {
        shows: {
          orderBy: { showDate: 'asc' },
          include: {
            flights: true,
            hotels: true,
            groundTransports: true
          }
        }
      }
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const gridData = tour.shows.map(show => {
      const primaryFlight = show.flights.find(f => f.isPrimary);
      const hotel = show.hotels[0];
      const transport = show.groundTransports[0];

      return {
        showNumber: show.showNumber,
        city: show.city,
        stateCountry: show.stateCountry,
        venue: show.venueName,
        date: format(show.showDate, 'MM/dd/yyyy'),
        day: format(show.showDate, 'EEEE'),
        onStageTime: show.onStageTime,
        requiredArrival: show.requiredOnSiteTime,
        soundcheck: show.soundcheckTime,
        venueContact: show.venueContactName,
        venuePhone: show.venueContactPhone,
        flightStatus: primaryFlight?.status || 'No Flight',
        flightInfo: primaryFlight
          ? `${primaryFlight.airline} ${primaryFlight.flightNumber}`
          : '',
        hotelStatus: hotel?.status || 'No Hotel',
        hotelName: hotel?.hotelName || '',
        transportStatus: transport?.status || 'No Transport',
        overallStatus: show.overallStatus,
        riskLevel: show.riskLevel
      };
    });

    res.json({
      tourName: tour.name,
      artistName: tour.artistName,
      dateRange: `${format(tour.startDate, 'MMM d')} - ${format(tour.endDate, 'MMM d, yyyy')}`,
      exportedAt: new Date().toISOString(),
      shows: gridData
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/shows/:id/export/run-of-show - Generate run of show data
router.get('/shows/:id/export/run-of-show', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const show = await prisma.show.findUnique({
      where: { id: req.params.id },
      include: {
        tour: true,
        flights: {
          where: { isPrimary: true }
        },
        hotels: true,
        groundTransports: true
      }
    });

    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }

    const primaryFlight = show.flights[0];
    const hotel = show.hotels[0];
    const transport = show.groundTransports[0];

    // Build timeline
    const timeline: Array<{ time: string; activity: string; notes?: string }> = [];

    if (primaryFlight?.arrivalDatetime) {
      timeline.push({
        time: format(new Date(primaryFlight.arrivalDatetime), 'h:mm a'),
        activity: 'Flight Arrives',
        notes: `${primaryFlight.airline} ${primaryFlight.flightNumber} at ${primaryFlight.destinationAirport}`
      });
    }

    if (transport?.pickupDatetime) {
      timeline.push({
        time: format(new Date(transport.pickupDatetime), 'h:mm a'),
        activity: 'Ground Transport Pickup',
        notes: transport.driverName ? `Driver: ${transport.driverName} - ${transport.driverPhone}` : undefined
      });
    }

    if (hotel && show.requiredOnSiteTime) {
      // Estimate hotel drop-off time (if going to hotel before venue)
      timeline.push({
        time: hotel.checkInTime || '2:00 PM',
        activity: 'Hotel Check-in Available',
        notes: hotel.hotelName
      });
    }

    if (show.loadInTime) {
      timeline.push({
        time: show.loadInTime,
        activity: 'Load In'
      });
    }

    if (show.soundcheckTime) {
      timeline.push({
        time: show.soundcheckTime,
        activity: 'Soundcheck',
        notes: show.soundcheckDurationMinutes ? `${show.soundcheckDurationMinutes} minutes` : undefined
      });
    }

    timeline.push({
      time: show.requiredOnSiteTime,
      activity: 'REQUIRED ON SITE',
      notes: 'Artist must be at venue'
    });

    if (show.doorsTime) {
      timeline.push({
        time: show.doorsTime,
        activity: 'Doors Open'
      });
    }

    if (show.onStageTime) {
      timeline.push({
        time: show.onStageTime,
        activity: 'ON STAGE',
        notes: show.setLengthMinutes ? `${show.setLengthMinutes} minute set` : undefined
      });
    }

    if (show.curfewTime) {
      timeline.push({
        time: show.curfewTime,
        activity: 'Curfew'
      });
    }

    // Sort timeline by time
    timeline.sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.time}`).getTime();
      const timeB = new Date(`2000-01-01 ${b.time}`).getTime();
      return timeA - timeB;
    });

    const runOfShow = {
      header: {
        tourName: show.tour.name,
        artistName: show.tour.artistName,
        showDate: format(show.showDate, 'EEEE, MMMM d, yyyy'),
        city: `${show.city}${show.stateCountry ? `, ${show.stateCountry}` : ''}`,
        venue: show.venueName,
        showNumber: show.showNumber
      },
      venue: {
        name: show.venueName,
        address: show.venueAddress,
        capacity: show.venueCapacity,
        ageRestriction: show.ageRestriction,
        parking: show.parkingInstructions,
        credentials: show.credentialsProcess,
        greenRoom: show.greenRoomInfo,
        catering: show.cateringInfo,
        wifi: show.wifiInfo
      },
      contacts: {
        venueContact: {
          name: show.venueContactName,
          phone: show.venueContactPhone,
          email: show.venueContactEmail
        },
        dayOfContact: {
          name: show.dayOfContactName,
          phone: show.dayOfContactPhone
        },
        productionContact: {
          name: show.productionContactName,
          phone: show.productionContactPhone
        },
        tourManager: {
          name: show.tour.tourManagerName,
          phone: show.tour.tourManagerPhone,
          email: show.tour.tourManagerEmail
        }
      },
      travel: {
        flight: primaryFlight ? {
          airline: primaryFlight.airline,
          flightNumber: primaryFlight.flightNumber,
          departure: primaryFlight.departureDatetime
            ? format(new Date(primaryFlight.departureDatetime), 'h:mm a')
            : undefined,
          arrival: primaryFlight.arrivalDatetime
            ? format(new Date(primaryFlight.arrivalDatetime), 'h:mm a')
            : undefined,
          confirmation: primaryFlight.confirmationNumber
        } : null,
        transport: transport ? {
          type: transport.transportType,
          driver: transport.driverName,
          phone: transport.driverPhone,
          company: transport.driverCompany,
          confirmation: transport.confirmationNumber,
          pickup: transport.pickupLocation
        } : null,
        hotel: hotel ? {
          name: hotel.hotelName,
          address: hotel.hotelAddress,
          phone: hotel.hotelPhone,
          confirmation: hotel.confirmationNumber,
          checkIn: hotel.checkInTime,
          checkOut: hotel.checkOutTime
        } : null
      },
      timeline,
      notes: {
        special: show.specialNotes,
        backup: show.backupPlan,
        risk: show.riskNotes
      },
      riskLevel: show.riskLevel,
      generatedAt: new Date().toISOString()
    };

    res.json(runOfShow);
  } catch (error) {
    next(error);
  }
});

// GET /api/tours/:id/export/contacts - Export contacts list
router.get('/tours/:id/export/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: req.params.id },
      include: {
        teamMembers: true,
        shows: {
          select: {
            city: true,
            venueName: true,
            showDate: true,
            venueContactName: true,
            venueContactPhone: true,
            venueContactEmail: true,
            dayOfContactName: true,
            dayOfContactPhone: true,
            productionContactName: true,
            productionContactPhone: true
          },
          orderBy: { showDate: 'asc' }
        }
      }
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const contacts = {
      tourContacts: {
        tourManager: {
          name: tour.tourManagerName,
          phone: tour.tourManagerPhone,
          email: tour.tourManagerEmail
        },
        production: {
          name: tour.productionContactName,
          phone: tour.productionContactPhone
        },
        agent: {
          name: tour.agentName,
          phone: tour.agentPhone
        },
        management: {
          name: tour.managementName,
          phone: tour.managementPhone
        }
      },
      teamMembers: tour.teamMembers.map(m => ({
        name: m.name,
        role: m.role,
        phone: m.phone,
        email: m.email,
        emergencyContact: m.emergencyContactName,
        emergencyPhone: m.emergencyContactPhone
      })),
      venueContacts: tour.shows.map(show => ({
        city: show.city,
        venue: show.venueName,
        date: format(show.showDate, 'MM/dd/yyyy'),
        venueContact: show.venueContactName,
        venuePhone: show.venueContactPhone,
        venueEmail: show.venueContactEmail,
        dayOfContact: show.dayOfContactName,
        dayOfPhone: show.dayOfContactPhone,
        production: show.productionContactName,
        productionPhone: show.productionContactPhone
      }))
    };

    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

export default router;
