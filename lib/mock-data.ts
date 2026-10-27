import type { EmergencyService, SupportService } from './types';

export const emergencyServices: EmergencyService[] = [
  {
    id: 'e1',
    name: 'SAPS Emergency',
    category: 'police',
    phone: '10111',
    available: '24 hours / 7 days',
    verified: 'South African Police Service',
    verifiedDate: '2026-09-15',
  },
  {
    id: 'e2',
    name: 'ER24 Ambulance',
    category: 'ambulance',
    phone: '084124',
    available: '24 hours / 7 days',
    verified: 'ER24 Emergency Medical Services',
    verifiedDate: '2026-09-20',
  },
  {
    id: 'e3',
    name: 'GBV Command Centre',
    category: 'gbv',
    phone: '0800 428 428',
    available: '24 hours / 7 days',
    verified: 'Department of Social Development',
    verifiedDate: '2026-08-30',
  },
  {
    id: 'e4',
    name: 'People Opposing Women Abuse (POWA)',
    category: 'gbv',
    phone: '011 642 4345',
    available: 'Mon–Fri, 08:00–17:00',
    verified: 'POWA Johannesburg',
    verifiedDate: '2026-09-10',
  },
  {
    id: 'e5',
    name: 'LifeLine Johannesburg',
    category: 'gbv',
    phone: '011 728 1333',
    available: '24 hours / 7 days',
    verified: 'LifeLine Southern Africa',
    verifiedDate: '2026-09-12',
  },
  {
    id: 'e6',
    name: 'Netcare 911',
    category: 'ambulance',
    phone: '082 911',
    available: '24 hours / 7 days',
    verified: 'Netcare Limited',
    verifiedDate: '2026-09-18',
  },
];

export const supportServices: SupportService[] = [
  {
    id: 's1',
    name: 'Charlotte Maxeke Johannesburg Hospital',
    category: 'clinic',
    phone: '011 488 3255',
    area: 'Parktown, Johannesburg',
    hours: '24 hours emergency',
    verifiedDate: '2026-09-20',
    directionsUrl: 'https://maps.google.com/?q=Charlotte+Maxeke+Hospital',
  },
  {
    id: 's2',
    name: 'POWA Counselling Centre',
    category: 'counselling',
    phone: '011 642 4345',
    area: 'Kensington, Johannesburg',
    hours: 'Mon–Fri, 08:00–17:00',
    verifiedDate: '2026-09-10',
    directionsUrl: 'https://maps.google.com/?q=POWA+Kensington',
  },
  {
    id: 's3',
    name: 'Tembisa Shelter for Abused Women',
    category: 'shelter',
    phone: '011 933 2000',
    area: 'Tembisa, Ekurhuleni',
    hours: '24 hours intake',
    verifiedDate: '2026-08-25',
    directionsUrl: 'https://maps.google.com/?q=Tembisa+Shelter',
  },
  {
    id: 's4',
    name: 'Bramley Police Station',
    category: 'police',
    phone: '011 486 8000',
    area: 'Bramley, Johannesburg',
    hours: '24 hours / 7 days',
    verifiedDate: '2026-09-15',
    directionsUrl: 'https://maps.google.com/?q=Bramley+Police+Station',
  },
  {
    id: 's5',
    name: 'Rape Crisis Houghton',
    category: 'gbv',
    phone: '011 486 1111',
    area: 'Houghton, Johannesburg',
    hours: 'Mon–Sat, 08:00–18:00',
    verifiedDate: '2026-09-05',
    directionsUrl: 'https://maps.google.com/?q=Rape+Crisis+Houghton',
  },
  {
    id: 's6',
    name: 'LifeLine Ekurhuleni',
    category: 'community',
    phone: '011 421 1188',
    area: 'Germiston, Ekurhuleni',
    hours: '24 hours / 7 days',
    verifiedDate: '2026-09-12',
    directionsUrl: 'https://maps.google.com/?q=LifeLine+Ekurhuleni',
  },
  {
    id: 's7',
    name: 'Netcare Milpark Hospital',
    category: 'clinic',
    phone: '011 476 7777',
    area: 'Milpark, Johannesburg',
    hours: '24 hours trauma unit',
    verifiedDate: '2026-09-18',
    directionsUrl: 'https://maps.google.com/?q=Netcare+Milpark+Hospital',
  },
  {
    id: 's8',
    name: 'Niya Consulting Services',
    category: 'counselling',
    phone: '011 463 7600',
    area: 'Randburg, Johannesburg',
    hours: 'Mon–Fri, 09:00–16:00',
    verifiedDate: '2026-08-28',
    directionsUrl: 'https://maps.google.com/?q=Niya+Consulting+Randburg',
  },
];

export const fakeCallScripts = [
  'Hi, are you still coming to the meeting? Everyone is waiting for you.',
  'Hey, I just got to the restaurant. Where are you? I have a table ready.',
  'Mom is asking if you are on your way. She needs help with something urgent.',
  'This is your doctor calling about your appointment. Can you come in today?',
  'Your ride is outside. Can you come out now? I can only wait a few minutes.',
];

export const sosMessageTemplate =
  'I am using Tinewe and may need assistance. This is an automated safety alert with my current location. Please try to contact me or follow the location link.';

// Johannesburg area coordinates for map demos
export const defaultMapCenter: [number, number] = [-26.2041, 28.0473];
export const sandtonCoords: [number, number] = [-26.1076, 28.0567];
export const rosebankCoords: [number, number] = [-26.1455, 28.0397];
