import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getTour, exportTourGrid, exportContacts } from '../../lib/api';
import Button from '../../components/common/Button';

export default function ExportCenter() {
  const { tourId } = useParams<{ tourId: string }>();
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => getTour(tourId!),
    enabled: !!tourId
  });

  const handleExportGrid = async () => {
    if (!tourId) return;
    setExporting('grid');
    try {
      const data = await exportTourGrid(tourId) as {
        tourName: string;
        shows: Array<Record<string, unknown>>;
      };

      // Convert to Excel
      const ws = XLSX.utils.json_to_sheet(data.shows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tour Grid');

      // Auto-size columns
      const colWidths = Object.keys(data.shows[0] || {}).map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;

      // Download
      XLSX.writeFile(wb, `${data.tourName.replace(/\s+/g, '_')}_Grid.xlsx`);
      toast.success('Grid exported successfully');
    } catch (error) {
      toast.error('Failed to export grid');
    } finally {
      setExporting(null);
    }
  };

  const handleExportContacts = async () => {
    if (!tourId) return;
    setExporting('contacts');
    try {
      const data = await exportContacts(tourId) as {
        tourContacts: Record<string, { name?: string; phone?: string; email?: string }>;
        teamMembers: Array<Record<string, unknown>>;
        venueContacts: Array<Record<string, unknown>>;
      };

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();

      // Tour contacts sheet
      const tourContactsData = Object.entries(data.tourContacts).map(([role, contact]) => ({
        Role: role.replace(/([A-Z])/g, ' $1').trim(),
        Name: contact.name || '',
        Phone: contact.phone || '',
        Email: contact.email || ''
      }));
      const tourContactsWs = XLSX.utils.json_to_sheet(tourContactsData);
      XLSX.utils.book_append_sheet(wb, tourContactsWs, 'Tour Contacts');

      // Team members sheet
      const teamWs = XLSX.utils.json_to_sheet(data.teamMembers);
      XLSX.utils.book_append_sheet(wb, teamWs, 'Team Members');

      // Venue contacts sheet
      const venueWs = XLSX.utils.json_to_sheet(data.venueContacts);
      XLSX.utils.book_append_sheet(wb, venueWs, 'Venue Contacts');

      XLSX.writeFile(wb, `${tour?.name.replace(/\s+/g, '_')}_Contacts.xlsx`);
      toast.success('Contacts exported successfully');
    } catch (error) {
      toast.error('Failed to export contacts');
    } finally {
      setExporting(null);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Export Center</h1>
          <p className="text-gray-500">{tour.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tour Grid Export */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-success-50 rounded-lg mr-4">
              <FileSpreadsheet className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tour Grid</h3>
              <p className="text-sm text-gray-500">Master spreadsheet</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Export the complete tour grid with all shows, venues, dates, times, and status information to Excel format.
          </p>
          <Button
            onClick={handleExportGrid}
            disabled={exporting === 'grid'}
            className="w-full"
          >
            {exporting === 'grid' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
        </div>

        {/* Contacts Export */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-primary-50 rounded-lg mr-4">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Contacts</h3>
              <p className="text-sm text-gray-500">All tour contacts</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Export all tour contacts including team members, venue contacts, and day-of contacts to Excel format.
          </p>
          <Button
            onClick={handleExportContacts}
            disabled={exporting === 'contacts'}
            className="w-full"
          >
            {exporting === 'contacts' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
        </div>

        {/* Run of Shows */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-warning-50 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Run of Shows</h3>
              <p className="text-sm text-gray-500">Individual PDFs</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Generate run of show documents for each show. Visit individual show pages to print or export their run of show.
          </p>
          <Link to={`/tours/${tourId}`}>
            <Button variant="secondary" className="w-full">
              View Shows
            </Button>
          </Link>
        </div>
      </div>

      {/* Export Tips */}
      <div className="card p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Export Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Tour Grid exports include all show data in a single spreadsheet for easy overview
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Contacts export creates multiple sheets: Tour Contacts, Team Members, and Venue Contacts
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            For individual run of shows, use the Print function (Cmd/Ctrl + P) on the Run of Show page
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">•</span>
            Run of Show pages can also be copied as text for sharing via message apps
          </li>
        </ul>
      </div>
    </div>
  );
}
