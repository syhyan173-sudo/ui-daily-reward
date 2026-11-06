/**
 * Pure reward system calculation & state transition logic for MINT Daily Reward
 */

export function formatSecondsToTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  return `${hStr}:${mStr}:${sStr}`;
}

export function calculateStreakProgress(claimedDaysCount: number, totalDays: number = 7): { percent: number; label: string } {
  const count = Math.max(0, Math.min(claimedDaysCount, totalDays));
  const percent = Math.round((count / totalDays) * 100);
  return {
    percent,
    label: `${count} / ${totalDays} Days`,
  };
}

export type CardState = 'expired' | 'active' | 'claimed' | 'locked';

export function getDayState(
  dayNumber: number,
  currentActiveDay: number,
  claimedDays: number[]
): CardState {
  if (claimedDays.includes(dayNumber)) {
    return 'claimed';
  }
  if (dayNumber < currentActiveDay) {
    return 'expired';
  }
  if (dayNumber === currentActiveDay) {
    return 'active';
  }
  return 'locked';
}
