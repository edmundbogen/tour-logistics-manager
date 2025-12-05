import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import ToursList from './pages/Tours/ToursList';
import TourDetail from './pages/Tours/TourDetail';
import ShowDetail from './pages/Shows/ShowDetail';
import FlightResearch from './pages/Shows/FlightResearch';
import RunOfShowPage from './pages/Shows/RunOfShowPage';
import VenuesPage from './pages/Venues/VenuesPage';
import ChecklistsPage from './pages/Checklists/ChecklistsPage';
import TemplatesPage from './pages/Templates/TemplatesPage';
import RiskDashboard from './pages/Tours/RiskDashboard';
import ExportCenter from './pages/Tours/ExportCenter';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tours" element={<ToursList />} />
        <Route path="tours/:tourId" element={<TourDetail />} />
        <Route path="tours/:tourId/risks" element={<RiskDashboard />} />
        <Route path="tours/:tourId/exports" element={<ExportCenter />} />
        <Route path="tours/:tourId/shows/:showId" element={<ShowDetail />} />
        <Route path="tours/:tourId/shows/:showId/flights" element={<FlightResearch />} />
        <Route path="tours/:tourId/shows/:showId/run-of-show" element={<RunOfShowPage />} />
        <Route path="venues" element={<VenuesPage />} />
        <Route path="checklists" element={<ChecklistsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
