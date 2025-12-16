import React from 'react';

type StreakCalendarProps = {
  lastActive: string | null;
  streak: number;
};

const StreakCalendar: React.FC<StreakCalendarProps> = ({ lastActive, streak }) => {
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }

  const isDayActive = (day: Date) => {
    if (!lastActive) {
      return false;
    }

    const lastActiveDate = new Date(lastActive);
    lastActiveDate.setHours(0, 0, 0, 0);

    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);

    const startDate = new Date(lastActiveDate);
    startDate.setDate(lastActiveDate.getDate() - (streak - 1));

    return dayDate >= startDate && dayDate <= lastActiveDate;
  };

  return (
    <div className="streak-calendar">
      <div className="streak-header">
        <h3>Streak Kalender</h3>
      </div>
      <div className="calendar">
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${isDayActive(day) ? 'active' : ''}`}
          >
            <p>{day.toLocaleDateString('de-DE', { weekday: 'short' })}</p>
            <p>{day.getDate()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakCalendar;