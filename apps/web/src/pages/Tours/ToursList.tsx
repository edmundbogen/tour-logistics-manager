import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, Calendar, MapPin, ArrowRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTours, createTour, deleteTour } from '../../lib/api';
import { formatDate, cn } from '../../lib/utils';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import type { Tour } from '../../types';

type TourFormData = {
  name: string;
  artistName: string;
  startDate: string;
  endDate: string;
  tourManagerName?: string;
  tourManagerPhone?: string;
  tourManagerEmail?: string;
  notes?: string;
};

export default function ToursList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: getTours
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TourFormData>();

  const createMutation = useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      setIsModalOpen(false);
      reset();
      toast.success('Tour created successfully');
    },
    onError: () => {
      toast.error('Failed to create tour');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Tour deleted');
    },
    onError: () => {
      toast.error('Failed to delete tour');
    }
  });

  const onSubmit = (data: TourFormData) => {
    createMutation.mutate(data);
  };

  const handleDelete = (e: React.MouseEvent, tourId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      deleteMutation.mutate(tourId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tours</h1>
          <p className="text-gray-500 mt-1">Manage your tour schedules</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Tour
        </Button>
      </div>

      {/* Tours Grid */}
      {tours.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tours yet</h3>
          <p className="text-gray-500 mb-4">Create your first tour to start managing shows</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tour
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map(tour => (
            <Link
              key={tour.id}
              to={`/tours/${tour.id}`}
              className="card p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
                <button
                  onClick={(e) => handleDelete(e, tour.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{tour.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{tour.artistName}</p>

              <div className="text-sm text-gray-500 mb-4">
                {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{tour.showCount}</span>
                    <span className="text-gray-500 ml-1">shows</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="status-dot status-dot-green" />
                    <span className="text-xs text-gray-500">{tour.riskCounts?.green || 0}</span>
                    <div className="status-dot status-dot-yellow ml-1" />
                    <span className="text-xs text-gray-500">{tour.riskCounts?.yellow || 0}</span>
                    <div className="status-dot status-dot-red ml-1" />
                    <span className="text-xs text-gray-500">{tour.riskCounts?.red || 0}</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Tour Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Tour"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tour Name"
              {...register('name', { required: 'Tour name is required' })}
              error={errors.name?.message}
              placeholder="Summer Tour 2025"
            />
            <Input
              label="Artist Name"
              {...register('artistName', { required: 'Artist name is required' })}
              error={errors.artistName?.message}
              placeholder="Artist Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
              error={errors.startDate?.message}
            />
            <Input
              label="End Date"
              type="date"
              {...register('endDate', { required: 'End date is required' })}
              error={errors.endDate?.message}
            />
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Tour Contacts (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tour Manager Name"
                {...register('tourManagerName')}
                placeholder="Tour Manager"
              />
              <Input
                label="Tour Manager Phone"
                {...register('tourManagerPhone')}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="mt-4">
              <Input
                label="Tour Manager Email"
                type="email"
                {...register('tourManagerEmail')}
                placeholder="manager@example.com"
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
            <Button type="submit" loading={createMutation.isPending}>
              Create Tour
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
