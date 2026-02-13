export enum UserRole {
  GUEST = 'GUEST',
  NORMAL = 'NORMAL',
  VIP = 'VIP',
  SENIOR = 'SENIOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  CROWDED = 'CROWDED',
  FULL = 'FULL'
}

export interface TimeSlot {
  id: string;
  time: string; // e.g. "09:00 AM"
  booked: number;
  capacity: number;
  status: SlotStatus;
}

export interface Appointment {
  id: string;
  service: string;
  date: string;
  timeSlot: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  estimatedWait: number; // in minutes
}

export const SERVICES = [
  "General Consultation",
  "Specialist Check-up",
  "Lab Testing",
  "Vaccination",
  "Pharmacy Pickup"
];

// Mock data generation
export const MOCK_SLOTS: TimeSlot[] = [
  { id: '1', time: '09:00 AM', booked: 2, capacity: 10, status: SlotStatus.AVAILABLE },
  { id: '2', time: '09:30 AM', booked: 5, capacity: 10, status: SlotStatus.AVAILABLE },
  { id: '3', time: '10:00 AM', booked: 8, capacity: 10, status: SlotStatus.CROWDED },
  { id: '4', time: '10:30 AM', booked: 10, capacity: 10, status: SlotStatus.FULL },
  { id: '5', time: '11:00 AM', booked: 9, capacity: 10, status: SlotStatus.CROWDED },
  { id: '6', time: '11:30 AM', booked: 3, capacity: 10, status: SlotStatus.AVAILABLE },
  { id: '7', time: '12:00 PM', booked: 4, capacity: 10, status: SlotStatus.AVAILABLE },
  { id: '8', time: '02:00 PM', booked: 10, capacity: 10, status: SlotStatus.FULL },
  { id: '9', time: '02:30 PM', booked: 6, capacity: 10, status: SlotStatus.CROWDED },
  { id: '10', time: '03:00 PM', booked: 1, capacity: 10, status: SlotStatus.AVAILABLE },
];