// Parse OSM opening hours format and determine if currently open

const DAY_MAP: Record<string, number> = {
  'mo': 1, 'tu': 2, 'we': 3, 'th': 4, 'fr': 5, 'sa': 6, 'su': 0,
  'ma': 1, 'di': 2, 'wo': 3, 'do': 4, 'vr': 5, 'za': 6, 'zo': 0, // Dutch
};

const DAY_NAMES: string[] = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

interface TimeRange {
  open: number; // minutes from midnight
  close: number; // minutes from midnight
}

interface ParsedRule {
  days: number[]; // 0=Sunday, 1=Monday, etc.
  times: TimeRange[];
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function formatTime(minutes: number): string {
  const normalizedMinutes = minutes % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function parseDays(dayStr: string): number[] {
  const days: number[] = [];
  const parts = dayStr.toLowerCase().split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      // Range like Mo-Fr
      const [start, end] = trimmed.split('-').map(d => DAY_MAP[d.trim()]);
      if (start !== undefined && end !== undefined) {
        let current = start;
        while (current !== end) {
          days.push(current);
          current = (current + 1) % 7;
        }
        days.push(end);
      }
    } else if (DAY_MAP[trimmed] !== undefined) {
      days.push(DAY_MAP[trimmed]);
    }
  }
  
  return days;
}

function parseOpeningHoursString(hoursStr: string): ParsedRule[] {
  const rules: ParsedRule[] = [];
  
  // Split by semicolon for multiple rules
  const ruleStrings = hoursStr.split(';');
  
  for (const ruleStr of ruleStrings) {
    const trimmed = ruleStr.trim();
    if (!trimmed) continue;
    
    // Match patterns like "Mo-Su 09:30-02:00" or "Mo-Fr 12:00-22:00"
    const match = trimmed.match(/^([A-Za-z,\-\s]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
    
    if (match) {
      const [, dayPart, openTime, closeTime] = match;
      const days = parseDays(dayPart);
      const open = parseTime(openTime);
      let close = parseTime(closeTime);
      
      // Handle overnight (e.g., 22:00-02:00)
      if (close < open) {
        close += 24 * 60;
      }
      
      if (days.length > 0) {
        rules.push({
          days,
          times: [{ open, close }]
        });
      }
    }
  }
  
  return rules;
}

export interface OpenStatusInfo {
  isOpen: boolean | null;
  closesAt: string | null;  // e.g., "22:00"
  opensAt: string | null;   // e.g., "09:00"
  opensDay: string | null;  // e.g., "vandaag", "morgen", "maandag"
}

export function getOpenStatus(openingHours: any): OpenStatusInfo {
  const result: OpenStatusInfo = {
    isOpen: null,
    closesAt: null,
    opensAt: null,
    opensDay: null,
  };

  if (!openingHours) return result;
  
  let hoursStr: string | null = null;
  
  if (typeof openingHours === 'string') {
    hoursStr = openingHours;
  } else if (typeof openingHours === 'object' && openingHours.hours) {
    hoursStr = openingHours.hours;
  }
  
  if (!hoursStr) return result;
  
  // Skip month-based or complex formats we can't parse
  if (/^[A-Z][a-z]{2}-[A-Z][a-z]{2}$/.test(hoursStr)) return result;
  if (hoursStr.includes('PH') || hoursStr.includes('SH')) return result;
  
  const rules = parseOpeningHoursString(hoursStr);
  if (rules.length === 0) return result;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Check if currently open
  for (const rule of rules) {
    if (rule.days.includes(currentDay)) {
      for (const time of rule.times) {
        if (currentMinutes >= time.open && currentMinutes < time.close) {
          result.isOpen = true;
          result.closesAt = formatTime(time.close);
          return result;
        }
        // Check if we're in overnight period from yesterday
        if (time.close > 24 * 60) {
          const adjustedClose = time.close - 24 * 60;
          if (currentMinutes < adjustedClose) {
            const yesterday = (currentDay + 6) % 7;
            if (rule.days.includes(yesterday)) {
              result.isOpen = true;
              result.closesAt = formatTime(adjustedClose);
              return result;
            }
          }
        }
      }
    }
  }
  
  // Not open, find next opening time
  result.isOpen = false;
  
  // Check if opens later today
  for (const rule of rules) {
    if (rule.days.includes(currentDay)) {
      for (const time of rule.times) {
        if (time.open > currentMinutes) {
          result.opensAt = formatTime(time.open);
          result.opensDay = 'vandaag';
          return result;
        }
      }
    }
  }
  
  // Check next 7 days for opening
  for (let i = 1; i <= 7; i++) {
    const checkDay = (currentDay + i) % 7;
    for (const rule of rules) {
      if (rule.days.includes(checkDay)) {
        if (rule.times.length > 0) {
          const earliestOpen = Math.min(...rule.times.map(t => t.open));
          result.opensAt = formatTime(earliestOpen);
          if (i === 1) {
            result.opensDay = 'morgen';
          } else {
            result.opensDay = DAY_NAMES[checkDay];
          }
          return result;
        }
      }
    }
  }
  
  return result;
}

export function isCurrentlyOpen(openingHours: any): boolean | null {
  return getOpenStatus(openingHours).isOpen;
}

export function getOpenStatusText(openingHours: any): { isOpen: boolean | null; text: string } {
  const status = getOpenStatus(openingHours);
  
  if (status.isOpen === null) {
    return { isOpen: null, text: '' };
  }
  
  if (status.isOpen) {
    return {
      isOpen: true,
      text: status.closesAt ? `Open tot ${status.closesAt}` : 'Nu open'
    };
  }
  
  return {
    isOpen: false,
    text: status.opensAt && status.opensDay 
      ? `Opent ${status.opensDay} om ${status.opensAt}`
      : 'Gesloten'
  };
}
