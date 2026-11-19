import { useState } from 'react';
import { Bell, BellOff, Compass } from 'lucide-react';
import { CityLocation, DailyPrayerSchedule, NotificationSettings } from '../types/prayer';
import {
  formatCoordinates,
  formatCountdown,
  formatTimeInZone,
  getCardinalDirectionRu,
} from '../utils/prayerEngine';

interface HeroPrayerBannerProps {
  city: CityLocation;
  schedule: DailyPrayerSchedule;
  now: Date;
  qiblaBearing: number;
  notificationSettings: NotificationSettings;
  onQuickToggleNotifications: () => void;
  onOpenQibla: () => void;
}

const HERO_IMAGE_PATH = '/src/assets/images/sacred_courtyard_light_1795089360561.jpg';

export function HeroPrayerBanner({
  city,
  schedule,
  now,
  qiblaBearing,
  notificationSettings,
  onQuickToggleNotifications,
  onOpenQibla,
}: HeroPrayerBannerProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const msRemaining = Math.max(0, schedule.nextPrayer.time.getTime() - now.getTime());
  const countdown = formatCountdown(msRemaining);
  const localClock = formatTimeInZone(now, city.timezone);
  const progressPercent = Math.round(schedule.windowProgress * 100);

  return (
    <section
      aria-label="Ближайший намаз"
      className="relative overflow-hidden rounded-2xl border border-[#E4E0D8] dark:border-[#21302D] bg-[#16221F] text-white"
    >
      {/* Background Architectural Image with measured contrast scrim */}
      <div className="absolute inset-0">
        {!imgFailed ? (
          <img
            src={HERO_IMAGE_PATH}
            alt="Спокойный архитектурный внутренний двор на рассвете"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0E3F31] via-[#132924] to-[#0B1110]" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0B1613]/92 via-[#0B1613]/78 to-[#0B1613]/58"
        />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        {/* Left: Location metadata & Next Prayer Countdown */}
        <div className="lg:col-span-7 space-y-5">
          {/* Unboxed clean metadata with typographic separators (zero pills) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-white/80">
            <span className="font-medium text-white">{city.name}, {city.country}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatCoordinates(city.latitude, city.longitude)}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{schedule.dateFormatted}</span>
            {schedule.hijriDateFormatted && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#E9C47C]">{schedule.hijriDateFormatted}</span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-[#A7F3D0] tracking-wide">
              Следующий намаз — {schedule.nextPrayer.nameRu} ({schedule.nextPrayer.nameArabic}) в{' '}
              <span className="font-mono tabular-nums text-white">{schedule.nextPrayer.timeFormatted}</span>
            </p>

            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white tabular-nums">
                {countdown}
              </h1>
              <span className="text-sm text-white/75 font-mono tabular-nums">
                Местное время {localClock}
              </span>
            </div>
          </div>

          {/* Progress indicator between current and next prayer */}
          <div className="max-w-md space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-[#34D399] rounded-full transition-transform duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-white/70 font-mono tabular-nums">
              <span>Прошло {progressPercent}% интервала</span>
              <span>До {schedule.nextPrayer.nameRu}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Sunnah Milestones & Direct Actions */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col justify-between gap-5 lg:items-end">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 text-left lg:text-right border-t lg:border-t-0 border-white/15 pt-4 lg:pt-0">
            <div>
              <p className="text-xs text-white/70">Середина ночи</p>
              <p className="mt-1 text-lg font-mono font-medium tabular-nums text-white">
                {schedule.sunnah.middleOfTheNight}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70">Последняя треть ночи</p>
              <p className="mt-1 text-lg font-mono font-medium tabular-nums text-[#E9C47C]">
                {schedule.sunnah.lastThirdOfTheNight}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onQuickToggleNotifications}
              className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                notificationSettings.enabled
                  ? 'bg-white text-[#0E5A46] border-white hover:bg-white/90'
                  : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
              }`}
            >
              {notificationSettings.enabled ? (
                <Bell className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <BellOff className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {notificationSettings.enabled
                  ? `Напоминания: за ${notificationSettings.leadMinutes} мин`
                  : 'Включить напоминания'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenQibla}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="font-mono tabular-nums">
                Кибла {Math.round(qiblaBearing)}° {getCardinalDirectionRu(qiblaBearing)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
