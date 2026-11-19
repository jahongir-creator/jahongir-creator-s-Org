import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Compass, RotateCcw, Smartphone, Sun } from 'lucide-react';
import { CityLocation } from '../types/prayer';
import {
  getCardinalDirectionRu,
  getDistanceToKaabaKm,
  getQiblaBearing,
  getSolarPosition,
  KAABA_LAT,
  KAABA_LNG,
} from '../utils/prayerEngine';

interface QiblaCompassProps {
  city: CityLocation;
  now: Date;
  expanded?: boolean;
}

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface DeviceOrientationConstructorWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export function QiblaCompass({ city, now, expanded = false }: QiblaCompassProps) {
  const qiblaBearing = useMemo(
    () => getQiblaBearing(city.latitude, city.longitude),
    [city.latitude, city.longitude]
  );

  const distanceKm = useMemo(
    () => getDistanceToKaabaKm(city.latitude, city.longitude),
    [city.latitude, city.longitude]
  );

  const solarPos = useMemo(
    () => getSolarPosition(now, city.latitude, city.longitude),
    [now, city.latitude, city.longitude]
  );

  const [sensorMode, setSensorMode] = useState<'manual' | 'sensor'>('manual');
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [sensorHeading, setSensorHeading] = useState<number | null>(null);
  const [sensorStatus, setSensorStatus] = useState<string>('');
  const wasAlignedRef = useRef(false);

  const activeHeading = sensorMode === 'sensor' && sensorHeading !== null ? sensorHeading : manualHeading;

  // Shortest signed angular difference from activeHeading to qiblaBearing in [-180, 180]
  const relativeAngle = useMemo(() => {
    let diff = ((qiblaBearing - activeHeading + 540) % 360) - 180;
    return diff;
  }, [qiblaBearing, activeHeading]);

  const isAligned = Math.abs(relativeAngle) <= 3;

  // Gentle haptic pulse on mobile when user locks onto Qibla
  useEffect(() => {
    if (isAligned && !wasAlignedRef.current && sensorMode === 'sensor') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch {
          // ignore
        }
      }
    }
    wasAlignedRef.current = isAligned;
  }, [isAligned, sensorMode]);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const iosEvent = event as DeviceOrientationEventiOS;
    let heading: number | null = null;

    if (typeof iosEvent.webkitCompassHeading === 'number') {
      heading = iosEvent.webkitCompassHeading;
    } else if (typeof event.alpha === 'number') {
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null && !Number.isNaN(heading)) {
      setSensorHeading(Math.round(heading));
      setSensorStatus('Датчик активен');
    }
  }, []);

  useEffect(() => {
    if (sensorMode !== 'sensor') return;

    const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(eventName, handleOrientation as EventListener);

    const fallbackTimer = window.setTimeout(() => {
      setSensorStatus((prev) =>
        prev === 'Датчик активен'
          ? prev
          : 'Магнитометр недоступен на этом устройстве — используйте ручной поворот'
      );
    }, 1500);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener(eventName, handleOrientation as EventListener);
    };
  }, [sensorMode, handleOrientation]);

  const enableSensor = async () => {
    const DevOrient = window.DeviceOrientationEvent as unknown as DeviceOrientationConstructorWithPermission;
    if (DevOrient && typeof DevOrient.requestPermission === 'function') {
      try {
        const res = await DevOrient.requestPermission();
        if (res === 'granted') {
          setSensorMode('sensor');
          setSensorStatus('Ожидание сигнала компаса...');
        } else {
          setSensorStatus('Доступ к датчику ориентации отклонён');
        }
      } catch {
        setSensorStatus('Не удалось запросить доступ к компасу');
      }
    } else if ('DeviceOrientationEvent' in window) {
      setSensorMode('sensor');
      setSensorStatus('Ожидание сигнала компаса...');
    } else {
      setSensorStatus('Устройство не поддерживает датчик компаса');
    }
  };

  // Compass rose rotates opposite to device heading so true North stays oriented
  const roseRotation = -activeHeading;
  // Sun position relative to rose
  const sunAngleOnDial = solarPos.azimuth;

  // Degree ticks for SVG dial
  const ticks = useMemo(() => {
    const items = [];
    for (let deg = 0; deg < 360; deg += 5) {
      const isMajor = deg % 30 === 0;
      const isMedium = deg % 15 === 0 && !isMajor;
      items.push({ deg, isMajor, isMedium });
    }
    return items;
  }, []);

  const alignInstruction = isAligned
    ? 'Точное направление на Киблу'
    : relativeAngle > 0
      ? `Поверните на ${Math.round(Math.abs(relativeAngle))}° вправо`
      : `Поверните на ${Math.round(Math.abs(relativeAngle))}° влево`;

  return (
    <section
      aria-label="Компас Киблы"
      className="rounded-2xl border border-[#E4E0D8] dark:border-[#21302D] bg-white dark:bg-[#121B19] p-6 sm:p-7 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E4E0D8] dark:border-[#21302D]">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Направление Киблы
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5A6360] dark:text-[#98A6A1]">
            Азимут на Каабу · {city.name}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="block text-2xl font-mono font-semibold tabular-nums text-[#0E5A46] dark:text-[#34D399]">
            {Math.round(qiblaBearing)}° {getCardinalDirectionRu(qiblaBearing)}
          </span>
          <span className="block text-xs font-mono tabular-nums text-[#5A6360] dark:text-[#98A6A1]">
            {distanceKm.toLocaleString('ru-RU')} км до Мекки
          </span>
        </div>
      </div>

      {/* Compass Dial Instrument */}
      <div className={`my-6 flex flex-col items-center ${expanded ? 'lg:my-8' : ''}`}>
        {/* Top fixed device reference marker */}
        <div className="mb-2 flex flex-col items-center">
          <span
            className={`text-xs font-medium transition-colors ${
              isAligned
                ? 'text-[#0E5A46] dark:text-[#34D399]'
                : 'text-[#5A6360] dark:text-[#98A6A1]'
            }`}
          >
            {alignInstruction}
          </span>
          <div
            aria-hidden="true"
            className={`mt-1.5 w-0.5 h-3.5 rounded-full transition-colors ${
              isAligned ? 'bg-[#0E5A46] dark:bg-[#34D399]' : 'bg-[#B47B2B]'
            }`}
          />
        </div>

        <div
          className={`relative select-none ${
            expanded ? 'w-72 h-72 sm:w-80 sm:h-80' : 'w-64 h-64 sm:w-72 sm:h-72'
          }`}
        >
          <svg
            viewBox="0 0 320 320"
            className="w-full h-full overflow-visible"
            role="img"
            aria-label={`Компас Киблы: ${Math.round(qiblaBearing)} градусов от севера`}
          >
            {/* Outer static bezel ring */}
            <circle
              cx="160"
              cy="160"
              r="148"
              fill="none"
              className={`transition-colors duration-200 ${
                isAligned
                  ? 'stroke-[#0E5A46] dark:stroke-[#34D399]'
                  : 'stroke-[#DDD7CC] dark:stroke-[#263834]'
              }`}
              strokeWidth={isAligned ? '2.5' : '1.5'}
            />
            <circle
              cx="160"
              cy="160"
              r="116"
              fill="none"
              className="stroke-[#ECE8DF] dark:stroke-[#1E2D2A]"
              strokeWidth="1"
            />

            {/* Rotating Compass Rose group */}
            <g
              style={{
                transform: `rotate(${roseRotation}deg)`,
                transformOrigin: '160px 160px',
                transition: sensorMode === 'sensor' ? 'transform 120ms ease-out' : 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Tick marks */}
              {ticks.map(({ deg, isMajor, isMedium }) => {
                const len = isMajor ? 11 : isMedium ? 7 : 4;
                return (
                  <line
                    key={deg}
                    x1="160"
                    y1="14"
                    x2="160"
                    y2={14 + len}
                    className={
                      isMajor
                        ? 'stroke-[#171B1A] dark:stroke-[#D9E2DF]'
                        : 'stroke-[#9FA6A2] dark:stroke-[#4B5E58]'
                    }
                    strokeWidth={isMajor ? '1.8' : '1'}
                    transform={`rotate(${deg} 160 160)`}
                  />
                );
              })}

              {/* Cardinal Labels */}
              <text
                x="160"
                y="41"
                textAnchor="middle"
                className="fill-[#B42318] dark:fill-[#F87171] text-[13px] font-bold font-mono"
              >
                С
              </text>
              <text
                x="280"
                y="165"
                textAnchor="middle"
                className="fill-[#5A6360] dark:fill-[#98A6A1] text-[12px] font-semibold font-mono"
              >
                В
              </text>
              <text
                x="160"
                y="289"
                textAnchor="middle"
                className="fill-[#5A6360] dark:fill-[#98A6A1] text-[12px] font-semibold font-mono"
              >
                Ю
              </text>
              <text
                x="40"
                y="165"
                textAnchor="middle"
                className="fill-[#5A6360] dark:fill-[#98A6A1] text-[12px] font-semibold font-mono"
              >
                З
              </text>

              {/* Solar azimuth indicator when sun is above horizon */}
              {solarPos.altitude > -4 && (
                <g transform={`rotate(${sunAngleOnDial} 160 160)`}>
                  <circle
                    cx="160"
                    cy="25"
                    r="5"
                    className="fill-[#D97706] dark:fill-[#FBBF24]"
                  />
                </g>
              )}

              {/* Qibla Bearing Vector & Kaaba Marker */}
              <g transform={`rotate(${qiblaBearing} 160 160)`}>
                {/* Qibla ray */}
                <line
                  x1="160"
                  y1="160"
                  x2="160"
                  y2="34"
                  className={
                    isAligned
                      ? 'stroke-[#0E5A46] dark:stroke-[#34D399]'
                      : 'stroke-[#B47B2B] dark:stroke-[#E0A94F]'
                  }
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Tail counterweight */}
                <line
                  x1="160"
                  y1="160"
                  x2="160"
                  y2="205"
                  className="stroke-[#C8C2B6] dark:stroke-[#344844]"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Arrowhead */}
                <polygon
                  points="160,24 152,42 168,42"
                  className={
                    isAligned
                      ? 'fill-[#0E5A46] dark:fill-[#34D399]'
                      : 'fill-[#B47B2B] dark:fill-[#E0A94F]'
                  }
                />
                {/* Stylized Kaaba icon near tip */}
                <rect
                  x="151"
                  y="54"
                  width="18"
                  height="18"
                  rx="3"
                  className="fill-[#171B1A] dark:fill-[#0B1110] stroke-[#E0A94F]"
                  strokeWidth="1.5"
                />
                <line
                  x1="152"
                  y1="60"
                  x2="168"
                  y2="60"
                  className="stroke-[#E0A94F]"
                  strokeWidth="1.5"
                />
              </g>
            </g>

            {/* Center Hub */}
            <circle
              cx="160"
              cy="160"
              r="7"
              className="fill-white dark:fill-[#121B19] stroke-[#0E5A46] dark:stroke-[#34D399]"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* Controls & Calibration */}
      <div className="space-y-4 pt-4 border-t border-[#E4E0D8] dark:border-[#21302D]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center p-1 rounded-lg bg-[#F1EFEA] dark:bg-[#1A2623]">
            <button
              type="button"
              onClick={() => setSensorMode('manual')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                sensorMode === 'manual'
                  ? 'bg-white dark:bg-[#0E5A46] text-[#171B1A] dark:text-white shadow-xs'
                  : 'text-[#5A6360] dark:text-[#98A6A1]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ручной ориентир</span>
            </button>
            <button
              type="button"
              onClick={enableSensor}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                sensorMode === 'sensor'
                  ? 'bg-white dark:bg-[#0E5A46] text-[#171B1A] dark:text-white shadow-xs'
                  : 'text-[#5A6360] dark:text-[#98A6A1]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Датчик телефона</span>
            </button>
          </div>

          {sensorMode === 'manual' && manualHeading !== 0 && (
            <button
              type="button"
              onClick={() => setManualHeading(0)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A6360] dark:text-[#98A6A1] hover:text-[#171B1A] dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Сброс на Север (0°)</span>
            </button>
          )}
        </div>

        {sensorMode === 'manual' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#5A6360] dark:text-[#98A6A1]">
              <label htmlFor="heading-slider">Ориентация экрана (куда вы смотрите)</label>
              <span className="font-mono tabular-nums font-medium text-[#171B1A] dark:text-[#EEF2F0]">
                {manualHeading}° {getCardinalDirectionRu(manualHeading)}
              </span>
            </div>
            <input
              id="heading-slider"
              type="range"
              min={0}
              max={359}
              value={manualHeading}
              onChange={(e) => setManualHeading(Number(e.target.value))}
              className="w-full accent-[#0E5A46] dark:accent-[#34D399] cursor-pointer"
            />
          </div>
        ) : (
          <p className="text-xs text-[#5A6360] dark:text-[#98A6A1]">
            {sensorStatus || 'Поворачивайте устройство горизонтально для определения Киблы.'}
          </p>
        )}

        {/* Helpful astronomical reference: Solar direction + Kaaba coordinates */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A6360] dark:text-[#98A6A1]">
          <span className="inline-flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FBBF24]" aria-hidden="true" />
            {solarPos.altitude > -4 ? (
              <span className="font-mono tabular-nums">
                Солнце сейчас: {Math.round(solarPos.azimuth)}° {getCardinalDirectionRu(solarPos.azimuth)}
              </span>
            ) : (
              <span>Солнце за горизонтом</span>
            )}
          </span>
          <span className="font-mono tabular-nums">
            Кааба: {KAABA_LAT.toFixed(2)}° с.ш., {KAABA_LNG.toFixed(2)}° в.д.
          </span>
        </div>
      </div>
    </section>
  );
}
