import axios from 'axios';
import type { Tour, Show, Flight, Hotel, GroundTransport, ChecklistTemplate, ChecklistInstance, RunOfShow, TeamMember } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tours
export const getTours = async (): Promise<Tour[]> => {
  const { data } = await api.get('/tours');
  return data;
};

export const getTour = async (id: string): Promise<Tour> => {
  const { data } = await api.get(`/tours/${id}`);
  return data;
};

export const createTour = async (tour: Partial<Tour>): Promise<Tour> => {
  const { data } = await api.post('/tours', tour);
  return data;
};

export const updateTour = async (id: string, tour: Partial<Tour>): Promise<Tour> => {
  const { data } = await api.put(`/tours/${id}`, tour);
  return data;
};

export const deleteTour = async (id: string): Promise<void> => {
  await api.delete(`/tours/${id}`);
};

// Shows
export const getShows = async (tourId: string): Promise<Show[]> => {
  const { data } = await api.get(`/tours/${tourId}/shows`);
  return data;
};

export const getShow = async (tourId: string, showId: string): Promise<Show> => {
  const { data } = await api.get(`/tours/${tourId}/shows/${showId}`);
  return data;
};

export const createShow = async (tourId: string, show: Partial<Show>): Promise<Show> => {
  const { data } = await api.post(`/tours/${tourId}/shows`, show);
  return data;
};

export const updateShow = async (tourId: string, showId: string, show: Partial<Show>): Promise<Show> => {
  const { data } = await api.put(`/tours/${tourId}/shows/${showId}`, show);
  return data;
};

export const deleteShow = async (tourId: string, showId: string): Promise<void> => {
  await api.delete(`/tours/${tourId}/shows/${showId}`);
};

export const updateShowStatus = async (
  tourId: string,
  showId: string,
  status: Partial<Pick<Show, 'overallStatus' | 'venueStatus' | 'riskLevel'>>
): Promise<Show> => {
  const { data } = await api.patch(`/tours/${tourId}/shows/${showId}/status`, status);
  return data;
};

// Flights
export const getFlights = async (showId: string): Promise<Flight[]> => {
  const { data } = await api.get(`/shows/${showId}/flights`);
  return data;
};

export const createFlight = async (showId: string, flight: Partial<Flight>): Promise<Flight> => {
  const { data } = await api.post(`/shows/${showId}/flights`, flight);
  return data;
};

export const updateFlight = async (showId: string, flightId: string, flight: Partial<Flight>): Promise<Flight> => {
  const { data } = await api.put(`/shows/${showId}/flights/${flightId}`, flight);
  return data;
};

export const deleteFlight = async (showId: string, flightId: string): Promise<void> => {
  await api.delete(`/shows/${showId}/flights/${flightId}`);
};

// Hotels
export const getHotels = async (showId: string): Promise<Hotel[]> => {
  const { data } = await api.get(`/shows/${showId}/hotel`);
  return data;
};

export const createHotel = async (showId: string, hotel: Partial<Hotel>): Promise<Hotel> => {
  const { data } = await api.post(`/shows/${showId}/hotel`, hotel);
  return data;
};

export const updateHotel = async (showId: string, hotelId: string, hotel: Partial<Hotel>): Promise<Hotel> => {
  const { data } = await api.put(`/shows/${showId}/hotel/${hotelId}`, hotel);
  return data;
};

export const deleteHotel = async (showId: string, hotelId: string): Promise<void> => {
  await api.delete(`/shows/${showId}/hotel/${hotelId}`);
};

// Ground Transport
export const getTransport = async (showId: string): Promise<GroundTransport[]> => {
  const { data } = await api.get(`/shows/${showId}/transport`);
  return data;
};

export const createTransport = async (showId: string, transport: Partial<GroundTransport>): Promise<GroundTransport> => {
  const { data } = await api.post(`/shows/${showId}/transport`, transport);
  return data;
};

export const updateTransport = async (showId: string, transportId: string, transport: Partial<GroundTransport>): Promise<GroundTransport> => {
  const { data } = await api.put(`/shows/${showId}/transport/${transportId}`, transport);
  return data;
};

export const deleteTransport = async (showId: string, transportId: string): Promise<void> => {
  await api.delete(`/shows/${showId}/transport/${transportId}`);
};

// Checklists
export const getChecklistTemplates = async (): Promise<ChecklistTemplate[]> => {
  const { data } = await api.get('/shows/checklist-templates');
  return data;
};

export const getChecklists = async (showId: string): Promise<ChecklistInstance[]> => {
  const { data } = await api.get(`/shows/${showId}/checklists`);
  return data;
};

export const createChecklist = async (showId: string, templateId: string): Promise<ChecklistInstance> => {
  const { data } = await api.post(`/shows/${showId}/checklists`, { templateId });
  return data;
};

export const toggleChecklistItem = async (checklistId: string, itemId: string): Promise<ChecklistInstance> => {
  const { data } = await api.patch(`/shows/checklists/${checklistId}/items/${itemId}`);
  return data;
};

// Team Members
export const getTeamMembers = async (tourId: string): Promise<TeamMember[]> => {
  const { data } = await api.get(`/tours/${tourId}/team`);
  return data;
};

export const createTeamMember = async (tourId: string, member: Partial<TeamMember>): Promise<TeamMember> => {
  const { data } = await api.post(`/tours/${tourId}/team`, member);
  return data;
};

// Exports
export const exportTourGrid = async (tourId: string): Promise<unknown> => {
  const { data } = await api.get(`/tours/${tourId}/export/grid`);
  return data;
};

export const getRunOfShow = async (showId: string): Promise<RunOfShow> => {
  const { data } = await api.get(`/shows/${showId}/export/run-of-show`);
  return data;
};

export const exportContacts = async (tourId: string): Promise<unknown> => {
  const { data } = await api.get(`/tours/${tourId}/export/contacts`);
  return data;
};

// Auth
export const login = async (email: string, password: string): Promise<{ user: { id: string; email: string; name: string }; token: string }> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (email: string, password: string, name: string): Promise<{ user: { id: string; email: string; name: string }; token: string }> => {
  const { data } = await api.post('/auth/register', { email, password, name });
  return data;
};

export const getMe = async (): Promise<{ id: string; email: string; name: string }> => {
  const { data } = await api.get('/auth/me');
  return data;
};

export default api;
