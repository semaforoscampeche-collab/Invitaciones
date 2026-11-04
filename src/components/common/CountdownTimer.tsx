import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  accentColor?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isInProgress: boolean;
  isFinished: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  startTime,
  endTime,
  accentColor = '#c5a059',
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    isInProgress: false,
    isFinished: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      try {
        const startDateTime = new Date(`${targetDate}T${startTime}:00`);
        const now = new Date();

        const diffStart = startDateTime.getTime() - now.getTime();

        let isFinished = false;
        let isInProgress = false;

        if (diffStart <= 0) {
          if (endTime) {
            const endDateTime = new Date(`${targetDate}T${endTime}:00`);
            if (now.getTime() > endDateTime.getTime()) {
              isFinished = true;
            } else {
              isInProgress = true;
            }
          } else {
            // Default: 6 hours after start
            const sixHoursAfter = startDateTime.getTime() + 6 * 60 * 60 * 1000;
            if (now.getTime() > sixHoursAfter) {
              isFinished = true;
            } else {
              isInProgress = true;
            }
          }
        }

        if (isFinished) {
          setTimeRemaining({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: true,
            isInProgress: false,
            isFinished: true,
          });
          return;
        }

        if (isInProgress) {
          setTimeRemaining({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: true,
            isInProgress: true,
            isFinished: false,
          });
          return;
        }

        const days = Math.floor(diffStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffStart % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffStart % (1000 * 60)) / 1000);

        setTimeRemaining({
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds),
          isPast: false,
          isInProgress: false,
          isFinished: false,
        });
      } catch {
        // Fallback
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate, startTime, endTime]);

  if (timeRemaining.isFinished) {
    return (
      <div className="py-6 px-8 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-center max-w-xl mx-auto shadow-sm">
        <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold mb-1">
          Evento Celebrado con Éxito
        </p>
        <p className="text-base text-amber-950 font-serif italic">
          ¡Gracias por ser parte de este recuerdo inolvidable!
        </p>
      </div>
    );
  }

  if (timeRemaining.isInProgress) {
    return (
      <div className="py-6 px-8 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-center max-w-xl mx-auto shadow-sm animate-pulse">
        <p className="text-xs uppercase tracking-widest text-emerald-800 font-semibold mb-1">
          ¡El Evento Está en Curso!
        </p>
        <p className="text-base text-emerald-950 font-serif italic">
          ¡Celebremos juntos este momento tan esperado!
        </p>
      </div>
    );
  }

  const timeBlocks = [
    { label: 'DÍAS', value: timeRemaining.days },
    { label: 'HORAS', value: timeRemaining.hours },
    { label: 'MINUTOS', value: timeRemaining.minutes },
    { label: 'SEGUNDOS', value: timeRemaining.seconds },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-lg w-full">
        {timeBlocks.map((block) => (
          <div
            key={block.label}
            className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-neutral-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <span
              className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold tabular-nums tracking-tight leading-none"
              style={{ color: accentColor }}
            >
              {String(block.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-neutral-500 uppercase mt-2">
              {block.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 mt-4 tracking-wider uppercase font-medium">
        Faltan muy pocos momentos para nuestro gran día
      </p>
    </div>
  );
};
