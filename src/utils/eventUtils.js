export function generateSeriesId() {
    return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  }
  
  export function getNextEventId(events) {
    return events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
  }
  
  export function generateRepeatedEvents(baseEvent, startDate, endDate, repeatType, repeatUntil, startingId, seriesId) {
    const repeatedEvents = [];
    const interval = repeatType === 'daily' ? 1 : 7;
  
    const untilDate =
      typeof repeatUntil === 'string'
        ? new Date(repeatUntil)
        : repeatUntil instanceof Date
        ? repeatUntil
        : null;
  
    let currentStart = new Date(startDate);
    let currentEnd = new Date(endDate);
    let count = 0;
    const maxRepeats = 100;
  
    while ((!untilDate || currentStart <= untilDate) && count < maxRepeats) {
      repeatedEvents.push({
        ...baseEvent,
        id: startingId + count,
        start: new Date(currentStart),
        end: new Date(currentEnd),
        seriesId,
      });
  
      currentStart.setDate(currentStart.getDate() + interval);
      currentEnd.setDate(currentEnd.getDate() + interval);
      count++;
    }
  
    return repeatedEvents;
  }
  
  