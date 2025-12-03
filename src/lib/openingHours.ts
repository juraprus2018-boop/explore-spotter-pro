// Parse OSM opening hours format and determine if currently open

const DAY_MAP: Record<string, number> = {
  'mo': 1, 'tu': 2, 'we': 3, 'th': 4, 'fr': 5, 'sa': 6, 'su': 0,
  'ma': 1, 'di': 2, 'wo': 3, 'do': 4, 'vr': 5, 'za': 6, 'zo': 0, // Dutch
};

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

export function isCurrentlyOpen(openingHours: any): boolean | null {
  if (!openingHours) return null;
  
  let hoursStr: string | null = null;
  
  if (typeof openingHours === 'string') {
    hoursStr = openingHours;
  } else if (typeof openingHours === 'object' && openingHours.hours) {
    hoursStr = openingHours.hours;
  }
  
  if (!hoursStr) return null;
  
  // Skip month-based or complex formats we can't parse
  if (/^[A-Z][a-z]{2}-[A-Z][a-z]{2}$/.test(hoursStr)) return null; // "Aug-Sep"
  if (hoursStr.includes('PH') || hoursStr.includes('SH')) return null; // Public/School holidays
  
  const rules = parseOpeningHoursString(hoursStr);
  if (rules.length === 0) return null;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (const rule of rules) {
    if (rule.days.includes(currentDay)) {
      for (const time of rule.times) {
        if (currentMinutes >= time.open && currentMinutes < time.close) {
          return true;
        }
        // Check if we're in overnight period from yesterday
        if (time.close > 24 * 60) {
          const adjustedClose = time.close - 24 * 60;
          if (currentMinutes < adjustedClose) {
            // Check if yesterday was in the rule
            const yesterday = (currentDay + 6) % 7;
            if (rule.days.includes(yesterday)) {
              return true;
            }
          }
        }
      }
    }
  }
  
  return false;
}

export function getOpenStatusText(openingHours: any): { isOpen: boolean | null; text: string } {
  const isOpen = isCurrentlyOpen(openingHours);
  
  if (isOpen === null) {
    return { isOpen: null, text: '' };
  }
  
  return {
    isOpen,
    text: isOpen ? 'Nu open' : 'Gesloten'
  };
}
