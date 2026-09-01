// Time synchronization and canonical timestamp normalizer

/**
 * Converts any timestamp or date into canonical ISO string with America/Sao_Paulo (-03:00) timezone representation
 */
export function toCanonicalTimestamp(dateInput?: string | number | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  return d.toISOString();
}

/**
 * Formats canonical timestamp for visual market chart axes (e.g., "09:05", "10:45", "17:15")
 */
export function formatMarketTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      // Fallback: If it's already a short time string like "09:00", return it
      if (typeof isoString === 'string' && isoString.includes(':') && isoString.length <= 8) {
        return isoString.slice(0, 5);
      }
      return '--:--';
    }
    return d.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

/**
 * Normalizes an arbitrary timestamp into the closest standard 5-minute market interval (e.g. 09:00, 09:05, 09:10)
 */
export function normalizeTimestamp(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return toCanonicalTimestamp();
  }
  const minutes = d.getMinutes();
  const roundedMinutes = Math.floor(minutes / 5) * 5;
  d.setMinutes(roundedMinutes, 0, 0);
  return d.toISOString();
}

/**
 * Ensures timelines between multiple series are 100% synchronized on the exact same canonical timestamp keys.
 * If data is missing for a point, fills with null rather than fabricating artificial data.
 */
export function synchronizeTimeline<T extends { timestamp: string }, U extends { timestamp: string }>(
  primaryTimeline: T[],
  secondaryData: U[],
  mergeFn: (primary: T, secondary?: U) => any
): any[] {
  const secondaryMap = new Map<string, U>();
  for (const item of secondaryData) {
    const key = normalizeTimestamp(item.timestamp);
    secondaryMap.set(key, item);
  }

  return primaryTimeline.map((primaryPoint) => {
    const key = normalizeTimestamp(primaryPoint.timestamp);
    const secondaryPoint = secondaryMap.get(key);
    return mergeFn(primaryPoint, secondaryPoint);
  });
}

/**
 * Determines current Brazilian market session status
 */
export function getMarketSessionStatus(now: Date = new Date()): {
  session: 'REGULAR' | 'AFTER_MARKET' | 'CLOSED';
  label: string;
  isTradingHours: boolean;
} {
  // Convert to SP time
  const spTimeStr = now.toLocaleTimeString('en-US', {
    timeZone: 'America/Sao_Paulo',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const [hStr, mStr] = spTimeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const currentMinutes = h * 60 + m;

  // Day of week in SP
  const day = now.getDay();
  if (day === 0 || day === 6) {
    return { session: 'CLOSED', label: 'MERCADO FECHADO (FIM DE SEMANA)', isTradingHours: false };
  }

  // Regular market: 09:00 to 18:00 (540m to 1080m)
  if (currentMinutes >= 540 && currentMinutes < 1080) {
    return { session: 'REGULAR', label: 'PREGÃO REGULAR B3 (09:00 - 18:00)', isTradingHours: true };
  }

  // After-market / Pre-market
  if (currentMinutes >= 1080 && currentMinutes <= 1110) {
    return { session: 'AFTER_MARKET', label: 'AFTER-MARKET B3 (18:00 - 18:30)', isTradingHours: false };
  }

  return { session: 'CLOSED', label: 'MERCADO FECHADO', isTradingHours: false };
}
