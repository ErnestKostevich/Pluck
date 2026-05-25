/**
 * Wrapper around `chrome.alarms` for scheduled job runs.
 *
 * Alarms only fire while Chrome is open. We surface this caveat in the UI
 * (Options page → "Scheduling caveats"). A real cloud worker is a Phase 5
 * Business-tier feature, after revenue.
 */

const ALARM_PREFIX = 'pluck:job:';

export async function scheduleJob(jobId: string, periodMinutes: number): Promise<void> {
  // chrome.alarms requires a minimum of 1 minute for packed extensions
  // (30 seconds for unpacked). Clamp here so we never silently no-op.
  const period = Math.max(1, Math.round(periodMinutes));
  await chrome.alarms.create(ALARM_PREFIX + jobId, {
    delayInMinutes: period,
    periodInMinutes: period,
  });
}

export async function unscheduleJob(jobId: string): Promise<void> {
  await chrome.alarms.clear(ALARM_PREFIX + jobId);
}

export async function unscheduleAll(): Promise<void> {
  const alarms = await chrome.alarms.getAll();
  await Promise.all(
    alarms.filter((a) => a.name.startsWith(ALARM_PREFIX)).map((a) => chrome.alarms.clear(a.name)),
  );
}

export async function getScheduledJobIds(): Promise<string[]> {
  const alarms = await chrome.alarms.getAll();
  return alarms
    .filter((a) => a.name.startsWith(ALARM_PREFIX))
    .map((a) => a.name.slice(ALARM_PREFIX.length));
}

/** Parse `chrome.alarms` alarm name → job id, or null if it's not ours. */
export function jobIdFromAlarmName(name: string): string | null {
  return name.startsWith(ALARM_PREFIX) ? name.slice(ALARM_PREFIX.length) : null;
}
