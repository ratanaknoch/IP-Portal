import { GroupSchedule, ScheduleSession, parseSlotMinutes } from '../data/scheduleData';

/**
 * Maps day string to iCalendar BYDAY abbreviation
 */
function getDayAbbr(day: ScheduleSession['day']): string {
  switch (day) {
    case 'Monday': return 'MO';
    case 'Tuesday': return 'TU';
    case 'Wednesday': return 'WE';
    case 'Thursday': return 'TH';
    case 'Friday': return 'FR';
    case 'Saturday': return 'SA';
    default: return 'MO';
  }
}

/**
 * Returns the reference Monday date for Semester 1 (e.g. Oct 5, 2026)
 * and offsets it to the appropriate day of the week.
 */
function getFirstSessionDate(day: ScheduleSession['day']): Date {
  // Semester 1 start: Monday Oct 5, 2026
  const baseMonday = new Date(2026, 9, 5); // Month is 0-indexed: 9 = October
  const dayOffset: Record<ScheduleSession['day'], number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5
  };

  const d = new Date(baseMonday);
  d.setDate(baseMonday.getDate() + (dayOffset[day] || 0));
  return d;
}

/**
 * Formats a Date object into local iCalendar format: YYYYMMDDTHHmmSS
 */
function formatIcsDateTime(date: Date, minutesFromMidnight: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = '00';
  
  return `${year}${month}${day}T${hh}${mm}${ss}`;
}

/**
 * Escapes RFC 5545 text values and strips CR/LF characters to prevent iCalendar property injection
 */
function escapeIcsText(value: string): string {
  return String(value || '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .trim();
}

/**
 * Generates an RFC 5545 compliant .ics calendar string for a group's schedule.
 * Recurrence covers Semester 1 until March 1, 2027.
 */
export function generateIcsCalendar(group: GroupSchedule): string {
  const untilDateStr = '20270301T000000Z';
  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const safeGroupId = escapeIcsText(group.id).replace(/[^a-zA-Z0-9_-]/g, '');

  const events = group.schedule.map((session, index) => {
    const [startMin, endMin] = parseSlotMinutes(session.time);
    const firstDate = getFirstSessionDate(session.day);
    const dtStart = formatIcsDateTime(firstDate, startMin);
    const dtEnd = formatIcsDateTime(firstDate, endMin);
    const byDay = getDayAbbr(session.day);
    const uid = `itc-${safeGroupId}-${session.day}-${startMin}-${index}@ccun.edu.kh`;

    const summary = escapeIcsText(`[${group.id}] ${session.course} (${session.type})`);
    const description = [
      `Course: ${escapeIcsText(session.course)}`,
      `Type: ${escapeIcsText(session.type)}`,
      `Lecturer: ${escapeIcsText(session.lecturer)}`,
      `Room: ${escapeIcsText(session.room)}`,
      `Cohort: ${escapeIcsText(group.name)}`,
      'Institution: Institute of Technology of Cambodia (ITC)'
    ].join('\\n');
    const location = escapeIcsText(`${session.room}, ITC Campus, Phnom Penh, Cambodia`);

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStr}`,
      `DTSTART;TZID=Asia/Phnom_Penh:${dtStart}`,
      `DTEND;TZID=Asia/Phnom_Penh:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;UNTIL=${untilDateStr};BYDAY=${byDay}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    ].join('\r\n');
  });

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Institute of Technology of Cambodia//Timetable Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:ITC ${escapeIcsText(group.id)} Schedule`,
    'X-WR-TIMEZONE:Asia/Phnom_Penh',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Phnom_Penh',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:+07',
    'END:STANDARD',
    'END:VTIMEZONE',
    ...events,
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
}

/**
 * Triggers client-side download of the .ics file.
 */
export function downloadCohortIcs(group: GroupSchedule): void {
  const icsData = generateIcsCalendar(group);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ITC_${group.id}_Schedule.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
