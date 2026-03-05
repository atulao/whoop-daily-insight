
// Mock data service to simulate WHOOP API responses
// Used as fallback when not authenticated with WHOOP

import { WhoopRecovery, WhoopStrain, WhoopSleep } from './whoopService';

// Helper to generate random number in range
const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Return a recovery zone based on score
export const getRecoveryZone = (score: number): 'green' | 'yellow' | 'red' => {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
};

// Calculate recommended strain target based on recovery
export const getStrainTarget = (recoveryScore: number): { min: number; max: number } => {
  if (recoveryScore >= 67) return { min: 12, max: 15 };
  if (recoveryScore >= 34) return { min: 8, max: 11 };
  return { min: 3, max: 7 };
};

// Generate mock recovery data matching WhoopRecovery interface
export const generateMockRecovery = (days: number = 7): WhoopRecovery[] => {
  const today = new Date();
  const data: WhoopRecovery[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      score: randomInRange(20, 98),
      restingHeartRate: randomInRange(48, 68),
      hrvMs: randomInRange(35, 120),
      date: date.toISOString().split('T')[0],
    });
  }

  return data;
};

// Generate mock strain data matching WhoopStrain interface
export const generateMockStrain = (days: number = 7): WhoopStrain[] => {
  const today = new Date();
  const data: WhoopStrain[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      score: parseFloat((randomInRange(30, 180) / 10).toFixed(1)),
      averageHeartRate: randomInRange(85, 145),
      maxHeartRate: randomInRange(150, 195),
      kilojoules: randomInRange(5000, 15000),
      date: date.toISOString().split('T')[0],
    });
  }

  return data;
};

// Generate mock sleep data matching WhoopSleep interface
export const generateMockSleep = (days: number = 7): WhoopSleep[] => {
  const today = new Date();
  const data: WhoopSleep[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const sleepNeed = randomInRange(25200, 30600); // 7-8.5 hrs in seconds
    const qualityDuration = randomInRange(21600, 32400); // 6-9 hrs in seconds

    data.push({
      id: `mock-sleep-${i}`,
      state: 'complete',
      scoreState: 'SCORED',
      qualityDuration,
      respiratoryRate: parseFloat((randomInRange(140, 180) / 10).toFixed(1)),
      sleepNeed,
      date: date.toISOString().split('T')[0],
    });
  }

  return data;
};

// Legacy exports for backward compatibility
export const generateWeeklyData = generateMockRecovery;
export const generateSleepData = generateMockSleep;

export const getTodayData = () => {
  const recovery = randomInRange(20, 98);
  return {
    date: new Date().toISOString().split('T')[0],
    recovery,
    recoveryZone: getRecoveryZone(recovery),
    strainTarget: getStrainTarget(recovery),
    heartRate: randomInRange(58, 72),
    hrv: randomInRange(35, 120),
    respiratoryRate: randomInRange(14, 18) + (Math.random() * 1.5).toFixed(1),
  };
};

// User profile data
export const getUserProfile = () => ({
  name: "Alex Johnson",
  email: "alex@example.com",
  memberSince: "2023-04-10",
  units: "imperial",
  notifications: {
    morningReadiness: true,
    bedtimeReminder: true,
    strainAlerts: true,
  },
});
