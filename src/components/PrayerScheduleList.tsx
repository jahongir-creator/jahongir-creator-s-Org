import { useMemo, useState } from 'react';
import { Bell, BellOff, Calendar } from 'lucide-react';
import {
  CityLocation,
  DailyPrayerSchedule,
  NotificationSettings,
  PrayerKey,
  PrayerSettings,
} from '../types/prayer';
import { CALCULATION_METHODS, computeMultiDaySchedule } from '../utils/prayerEngine';

interface PrayerScheduleListProps {
  city: CityLocation;
  schedule: DailyPrayerSchedule;
  prayerSettings: PrayerSettings;
  notificationSettings: NotificationSettings;
  now: Date;
  onTogglePrayerNotification: (key: PrayerKey) => void;
}

type ViewMode = 'today' | 'week' | 'month';

export function PrayerScheduleList({
  city,
  schedule,
  prayerSettings,
  notificationSettings,
  now,
  onTogglePrayerNotification,
}: PrayerScheduleListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  const multiDayRows = useMemo(() => {
    if (viewMode === 'today') return [];
    return computeMultiDaySchedule(city, prayerSettings, now, viewMode === 'week' ? 7 : 30);
  }, [city, prayerSettings, now, viewMode]);

  const activeMethod = CALCULATION_METHODS.find((m) => m.id === prayerSettings.calculationMethod);

  return (
    <section
      aria-label="Расписание намазов"
      className="rounded-2xl border border-[#E4E0D8] dark:border-[#21302D] bg-white dark:bg-[#121B19] p-6 sm:p-7"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E0D8] dark:border-[#21302D]">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Время намазов
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5A6360] dark:text-[#98A6A1]">
            {activeMethod?.shortLabel} ({activeMethod?.angles}) ·{' '}
            {prayerSettings.madhab === 'hanafi' ? 'Ханафитский мазхаб' : 'Стандартный Аср'}
          </p>
        </div>

        {/* Interactive segmented control */}
        <div
          role="tablist"
          aria-label="Период расписания"
          className="inline-flex items-center p-1 rounded-lg bg-[#F1EFEA] dark:bg-[#1A2623] self-start sm:self-auto"
        >
          {(
            [
              { id: 'today', label: 'Сегодня' },
              { id: 'week', label: '7 дней' },
              { id: 'month', label: '30 дней' },
            ] as { id: ViewMode; label: string }[]
          ).map((tab) => {
            const active = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setViewMode(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-[#0E5A46] text-[#171B1A] dark:text-white shadow-xs'
                    : 'text-[#5A6360] dark:text-[#98A6A1] hover:text-[#171B1A] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === 'today' ? (
        <div className="divide-y divide-[#ECE8DF] dark:divide-[#1D2B28]">
          {schedule.entries.map((entry) => {
            const isNotifyOn =
              notificationSettings.enabled && notificationSettings.perPrayer[entry.key];

            return (
              <div
                key={entry.key}
                className={`py-4 px-3 -mx-3 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                  entry.isNext
                    ? 'bg-[#0E5A46]/[0.06] dark:bg-[#34D399]/[0.08]'
                    : entry.isPassed
                      ? 'opacity-65'
                      : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2.5">
                    <span
                      className={`text-base sm:text-lg font-semibold ${
                        entry.isNext
                          ? 'text-[#0E5A46] dark:text-[#34D399]'
                          : 'text-[#171B1A] dark:text-[#EEF2F0]'
                      }`}
                    >
                      {entry.nameRu}
                    </span>
                    <span className="text-sm text-[#7A827E] dark:text-[#7E8E89]">
                      {entry.nameArabic}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6360] dark:text-[#98A6A1] mt-0.5 truncate">
                    {entry.descriptionRu}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`block text-xl sm:text-2xl font-mono font-semibold tabular-nums ${
                        entry.isNext
                          ? 'text-[#0E5A46] dark:text-[#34D399]'
                          : 'text-[#171B1A] dark:text-[#EEF2F0]'
                      }`}
                    >
                      {entry.timeFormatted}
                    </span>
                    <span className="block text-[11px] text-[#5A6360] dark:text-[#98A6A1]">
                      {entry.isNext
                        ? 'Следующий'
                        : entry.isCurrent
                          ? 'Текущее время'
                          : entry.isPassed
                            ? 'Завершён'
                            : 'Ожидается'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTogglePrayerNotification(entry.key)}
                    aria-label={
                      isNotifyOn
                        ? `Отключить напоминание для ${entry.nameRu}`
                        : `Включить напоминание для ${entry.nameRu}`
                    }
                    title={
                      notificationSettings.enabled
                        ? isNotifyOn
                          ? 'Напоминание включено'
                          : 'Напоминание выключено'
                        : 'Включить напоминания и выбрать этот намаз'
                    }
                    className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5A46] dark:focus-visible:ring-[#34D399] ${
                      isNotifyOn
                        ? 'border-[#0E5A46]/30 bg-[#0E5A46]/10 text-[#0E5A46] dark:border-[#34D399]/30 dark:bg-[#34D399]/10 dark:text-[#34D399]'
                        : 'border-[#E4E0D8] dark:border-[#253632] text-[#7A827E] dark:text-[#7E8E89] hover:text-[#171B1A] dark:hover:text-[#EEF2F0]'
                    }`}
                  >
                    {isNotifyOn ? (
                      <Bell className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <BellOff className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs text-[#5A6360] dark:text-[#98A6A1] mb-3">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              Расписание для г. {city.name} ({viewMode === 'week' ? 'ближайшие 7 дней' : 'ближайшие 30 дней'})
            </span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E0D8] dark:border-[#21302D] text-xs font-medium text-[#5A6360] dark:text-[#98A6A1]">
                <th className="py-2.5 pr-3">Дата</th>
                <th className="py-2.5 px-2">Фаджр</th>
                <th className="py-2.5 px-2">Восход</th>
                <th className="py-2.5 px-2">Зухр</th>
                <th className="py-2.5 px-2">Аср</th>
                <th className="py-2.5 px-2">Магриб</th>
                <th className="py-2.5 pl-2 text-right">Иша</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8DF] dark:divide-[#1D2B28] text-xs sm:text-sm font-mono tabular-nums">
              {multiDayRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={
                    row.isToday
                      ? 'bg-[#0E5A46]/[0.06] dark:bg-[#34D399]/[0.08] font-semibold text-[#0E5A46] dark:text-[#34D399]'
                      : 'text-[#171B1A] dark:text-[#EEF2F0]'
                  }
                >
                  <td className="py-2.5 pr-3 font-sans whitespace-nowrap">
                    <span className="capitalize">{row.dateLabel}</span>
                    {row.hijriShort && (
                      <span className="block text-[11px] font-normal text-[#6A7370] dark:text-[#8B9994]">
                        {row.hijriShort}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2">{row.fajr}</td>
                  <td className="py-2.5 px-2 text-[#6A7370] dark:text-[#8B9994]">{row.sunrise}</td>
                  <td className="py-2.5 px-2">{row.dhuhr}</td>
                  <td className="py-2.5 px-2">{row.asr}</td>
                  <td className="py-2.5 px-2">{row.maghrib}</td>
                  <td className="py-2.5 pl-2 text-right">{row.isha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
