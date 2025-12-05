import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Calendar,
  Users,
  FileText,
  Settings,
  AlertTriangle,
  Download,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getTour, createShow, updateShow, deleteShow } from '../../lib/api';
import { formatDate, formatTime, getStatusColor, getRiskColor, cn } from '../../lib/utils';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TourGrid from '../../components/grid/TourGrid';
import type { Show } from '../../types';

type ShowFormData = {
  city: string;
  stateCountry?: string;
  venueName: string;
  venueAddress?: string;
  showDate: string;
  onStageTime: string;
  requiredOnSiteTime: string;
  soundcheckTime?: string;
  loadInTime?: string;
  doorsTime?: string;
  curfewTime?: string;
  venueContactName?: string;
  venueContactPhone?: string;
  venueContactEmail?: string;
};

const tabs = [
  { id: 'grid', label: 'Grid View', icon: Calendar },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function TourDetail() {
  const { tourId } = useParams<{ tourId: string }>();
  const [activeTab, setActiveTab] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => getTour(tourId!),
    enabled: !!tourId
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShowFormData>();

  const createShowMutation = useMutation({
    mutationFn: (data: Partial<Show>) => createShow(tourId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      setIsModalOpen(false);
      reset();
      toast.success('Show created successfully');
    },
    onError: () => {
      toast.error('Failed to create show');
    }
  });

  const updateShowMutation = useMutation({
    mutationFn: ({ showId, data }: { showId: string; data: Partial<Show> }) =>
      updateShow(tourId!, showId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      toast.success('Show updated');
    }
  });

  const deleteShowMutation = useMutation({
    mutationFn: (showId: string) => deleteShow(tourId!, showId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      toast.success('Show deleted');
    }
  });

  const onSubmit = (data: ShowFormData) => {
    createShowMutation.mutate(data);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/tours"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tour.name}</h1>
            <p className="text-gray-500">
              {tour.artistName} • {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link to={`/tours/${tourId}/risks`}>
            <Button variant="secondary" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk Dashboard
            </Button>
          </Link>
          <Link to={`/tours/${tourId}/exports`}>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Show
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'grid' && (
        <TourGrid
          shows={tour.shows || []}
          tourId={tourId!}
          onUpdateShow={(showId, data) => updateShowMutation.mutate({ showId, data })}
          onDeleteShow={(showId) => {
            if (confirm('Delete this show?')) {
              deleteShowMutation.mutate(showId);
            }
          }}
        />
      )}

      {activeTab === 'team' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          {tour.teamMembers && tour.teamMembers.length > 0 ? (
            <div className="space-y-4">
              {tour.teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-900">{member.phone}</p>
                    <p className="text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No team members added yet.</p>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <p className="text-gray-500">Document management coming soon.</p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Tour Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tour Manager</label>
                <p className="text-gray-900">{tour.tourManagerName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{tour.tourManagerPhone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Agent</label>
                <p className="text-gray-900">{tour.agentName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Management</label>
                <p className="text-gray-900">{tour.managementName || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Show Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Show"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              {...register('city', { required: 'City is required' })}
              error={errors.city?.message}
              placeholder="Los Angeles"
            />
            <Input
              label="State/Country"
              {...register('stateCountry')}
              placeholder="CA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Venue Name"
              {...register('venueName', { required: 'Venue name is required' })}
              error={errors.venueName?.message}
              placeholder="The Wiltern"
            />
            <Input
              label="Show Date"
              type="date"
              {...register('showDate', { required: 'Show date is required' })}
              error={errors.showDate?.message}
            />
          </div>

          <Input
            label="Venue Address"
            {...register('venueAddress')}
            placeholder="3790 Wilshire Blvd, Los Angeles, CA 90010"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="On Stage Time"
              type="time"
              {...register('onStageTime')}
            />
            <Input
              label="Required On Site"
              type="time"
              {...register('requiredOnSiteTime', { required: 'Required' })}
              error={errors.requiredOnSiteTime?.message}
            />
            <Input
              label="Soundcheck"
              type="time"
              {...register('soundcheckTime')}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Load In"
              type="time"
              {...register('loadInTime')}
            />
            <Input
              label="Doors"
              type="time"
              {...register('doorsTime')}
            />
            <Input
              label="Curfew"
              type="time"
              {...register('curfewTime')}
            />
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Venue Contact</h4>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Name"
                {...register('venueContactName')}
                placeholder="Contact Name"
              />
              <Input
                label="Phone"
                {...register('venueContactPhone')}
                placeholder="(555) 123-4567"
              />
              <Input
                label="Email"
                type="email"
                {...register('venueContactEmail')}
                placeholder="venue@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createShowMutation.isPending}>
              Add Show
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
