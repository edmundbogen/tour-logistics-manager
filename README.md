# Tour Logistics Manager

A full-stack web application for coordinating multi-city entertainment tours. Manages flight scheduling, hotel booking, venue coordination, daily itineraries, and contingency planning.

## Features

- **Tour Management**: Create and manage multiple tours with artist details and key contacts
- **Show Grid**: Master spreadsheet view of all shows with inline status tracking
- **Travel Logistics**: Flight research, hotel booking, and ground transport management
- **Risk Assessment**: Automatic risk level calculation based on travel buffer times
- **Run of Show**: Generate professional day-of-show documents
- **Checklists**: Pre-built checklist templates for tour management workflows
- **Templates**: Email templates for venue communication and team updates
- **Export**: Export tour grids and contacts to Excel

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form

**Backend:**
- Node.js with Express
- PostgreSQL
- Prisma ORM
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd tour-logistics-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:

Create a PostgreSQL database, then copy the environment file:
```bash
cp apps/api/.env.example apps/api/.env
```

Update `apps/api/.env` with your database connection:
```
DATABASE_URL="postgresql://username:password@localhost:5432/tour_logistics?schema=public"
JWT_SECRET="your-secret-key"
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

6. Start the development servers:
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:3001

## Project Structure

```
tour-logistics-manager/
├── apps/
│   ├── api/                 # Express backend
│   │   ├── prisma/          # Database schema and migrations
│   │   └── src/
│   │       ├── routes/      # API endpoints
│   │       ├── middleware/  # Express middleware
│   │       └── utils/       # Utility functions
│   │
│   └── web/                 # React frontend
│       └── src/
│           ├── components/  # UI components
│           ├── pages/       # Page components
│           ├── hooks/       # Custom hooks
│           ├── lib/         # API client & utilities
│           └── types/       # TypeScript types
│
└── packages/
    └── shared/              # Shared types and constants
```

## Key Concepts

### Risk Levels

Shows are automatically assigned risk levels based on:

- **Green**: 3+ hour buffer, multiple flight options, venue confirmed
- **Yellow**: 2-3 hour buffer, single flight option, weather-prone route
- **Red**: <2 hour buffer, missing critical elements, venue unconfirmed

### Buffer Calculation

Buffer time = Required on-site time - (Flight arrival + Ground transport time)

- Domestic flights: Minimum 3-hour buffer recommended
- International flights: Minimum 5-hour buffer recommended

### Checklists

Pre-built checklists include:
- Deal Memo Intake
- Pre-Show Week (7 days out)
- 48-Hour Pre-Show
- Day-Of-Show (Morning, Arrival, Pre-Show, Post-Show)
- Flight Research
- Hotel Selection
- Venue Confirmation
- Emergency Preparedness
- Tour Closeout

## API Endpoints

### Tours
- `GET /api/tours` - List all tours
- `POST /api/tours` - Create tour
- `GET /api/tours/:id` - Get tour with shows
- `PUT /api/tours/:id` - Update tour
- `DELETE /api/tours/:id` - Delete tour

### Shows
- `GET /api/tours/:tourId/shows` - List shows
- `POST /api/tours/:tourId/shows` - Create show
- `GET /api/tours/:tourId/shows/:id` - Get show details
- `PUT /api/tours/:tourId/shows/:id` - Update show

### Travel
- `GET/POST/PUT/DELETE /api/shows/:showId/flights`
- `GET/POST/PUT/DELETE /api/shows/:showId/hotel`
- `GET/POST/PUT/DELETE /api/shows/:showId/transport`

### Exports
- `GET /api/tours/:id/export/grid` - Export tour grid
- `GET /api/shows/:id/export/run-of-show` - Generate run of show
- `GET /api/tours/:id/export/contacts` - Export contacts

## License

MIT
