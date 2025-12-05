import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatTime(time: string | undefined): string {
  if (!time) return '-';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatDate(date: string | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDayOfWeek(date: string | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Not Started':
      return 'badge-gray';
    case 'In Progress':
      return 'badge-blue';
    case 'Confirmed':
    case 'Booked':
      return 'badge-green';
    case 'Completed':
      return 'badge-purple';
    case 'Pending':
      return 'badge-yellow';
    case 'Cancelled':
    case 'Unconfirmed':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'Green':
      return 'badge-green';
    case 'Yellow':
      return 'badge-yellow';
    case 'Red':
      return 'badge-red';
    default:
      return 'badge-gray';
  }
}

export function getRiskDotColor(level: string): string {
  switch (level) {
    case 'Green':
      return 'status-dot-green';
    case 'Yellow':
      return 'status-dot-yellow';
    case 'Red':
      return 'status-dot-red';
    default:
      return 'bg-gray-400';
  }
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
