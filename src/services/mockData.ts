
// Mock data service to simulate WHOOP API responses
// This would be replaced with actual API calls in production

// Helper to generate random number in range
const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a random recovery score between 0-100
const generateRecoveryScore = (): number => randomInRange(20, 98);

// Return a recovery zone based on score
export const getRecoveryZone = (score: number): 'green' | 'yellow' | 'red' => {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
};

// Calculate recommended strain target based on recovery
export const getStrainTarget = (recoveryScore: number): { min: number; max: number } => {
  if (recoveryScore >= 67) {
    return { min: 12, max: 15 };
  } else if (recoveryScore >= 34) {
    return { min: 8, max: 11 };
  } else {
    return { min: 3, max: 7 };
  }
};

// Generate 7 days worth of recovery and strain data
export const generateWeeklyData = () => {
  const today = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const recovery = generateRecoveryScore();
    const strainTarget = getStrainTarget(recovery);
    const actualStrain = randomInRange(
      Math.max(1, strainTarget.min - 5),
      Math.min(21, strainTarget.max + 5)
    );
    
    data.push({
      date: date.toISOString().split('T')[0],
      recovery,
      recoveryZone: getRecoveryZone(recovery),
      strainTarget,
      actualStrain,
      capacity: recovery / 10, // Simplified calculation for capacity
    });
  }
  
  return data;
};

// Generate sleep consistency data
export const generateSleepData = () => {
  const today = new Date();
  const data = [];
  
  // Base sleep time - around 11:00 PM
  const baseSleepTime = 23 * 60; // 11:00 PM in minutes
  // Base wake time - around 7:00 AM
  const baseWakeTime = 7 * 60; // 7:00 AM in minutes
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Vary sleep start time by ±30 minutes
    const sleepStartVariation = randomInRange(-30, 30);
    const sleepStart = baseSleepTime + sleepStartVariation;
    
    // Vary sleep duration between 6-9 hours (in minutes)
    const sleepDuration = randomInRange(6 * 60, 9 * 60);
    
    // Calculate wake time
    const wakeTime = sleepStart + sleepDuration;
    
    // Format times as HH:MM
    const formatTime = (minutes: number) => {
      const h = Math.floor((minutes % (24 * 60)) / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    data.push({
      date: date.toISOString().split('T')[0],
      sleepStart: formatTime(sleepStart),
      wakeTime: formatTime(wakeTime % (24 * 60)), // Ensure we wrap around 24 hours
      duration: sleepDuration / 60, // in hours
      efficiency: randomInRange(75, 98),
      consistency: Math.abs(sleepStartVariation) <= 15 ? 'consistent' : 'inconsistent',
    });
  }
  
  return data;
};

// Today's data
export const getTodayData = () => {
  const recovery = generateRecoveryScore();
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
export const getUserProfile = () => {
  return {
    name: "Alex Johnson",
    email: "alex@example.com",
    memberSince: "2023-04-10",
    units: "imperial",
    notifications: {
      morningReadiness: true,
      bedtimeReminder: true,
      strainAlerts: true,
    },
  };
};
