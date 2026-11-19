import { Moon, Sun } from 'lucide-react';
import { HighLatitudeId, MadhabId, PrayerSettings } from '../types/prayer';
import { CALCULATION_METHODS } from '../utils/prayerEngine';

interface SettingsPanelProps {
  settings: PrayerSettings;
  isDark: boolean;
  onUpdateSettings: (next: PrayerSettings) => void;
  onToggleTheme: (dark: boolean) => void;
}

const HIGH_LATITUDE_OPTIONS: { id: HighLatitudeId; label: string; desc: string }[] = [
  {
    id: 'MiddleOfTheNight',
    label: 'Середина ночи',
    desc: 'Рекомендуется для средних и северных широт (Москва, Казань)',
  },
  {
    id: 'SeventhOfTheNight',
    label: 'Одна седьмая ночи',
    desc: 'Альтернативный расчёт для белых ночей и высоких широт',
  },
  {
    id: 'TwilightAngle',
    label: 'По углу сумерек',
    desc: 'Пропорциональный угол (подходит для северных регионов)',
  },
];

export function SettingsPanel({
  settings,
  isDark,
  onUpdateSettings,
  onToggleTheme,
}: SettingsPanelProps) {
  return (
    <section
      aria-label="Параметры расчёта и оформления"
      className="rounded-2xl border border-[#E4E0D8] dark:border-[#21302D] bg-white dark:bg-[#121B19] p-6 sm:p-7 space-y-7"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E0D8] dark:border-[#21302D]">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Настройки расчёта
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5A6360] dark:text-[#98A6A1]">
            Астрономический метод, мазхаб для времени Аср и тема интерфейса
          </p>
        </div>

        {/* Light / Dark Theme Switch */}
        <div className="inline-flex items-center p-1 rounded-lg bg-[#F1EFEA] dark:bg-[#1A2623] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onToggleTheme(false)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              !isDark
                ? 'bg-white text-[#171B1A] shadow-xs'
                : 'text-[#98A6A1] hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Светлая</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              isDark
                ? 'bg-[#0E5A46] text-white shadow-xs'
                : 'text-[#5A6360] hover:text-[#171B1A]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Тёмная</span>
          </button>
        </div>
      </div>

      {/* Calculation Method */}
      <div className="space-y-3">
        <label
          htmlFor="calc-method-select"
          className="block text-sm font-semibold text-[#171B1A] dark:text-[#EEF2F0]"
        >
          Метод расчёта времени намаза
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CALCULATION_METHODS.map((method) => {
            const active = settings.calculationMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...settings, calculationMethod: method.id })
                }
                className={`min-h-[54px] px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  active
                    ? 'border-[#0E5A46] bg-[#0E5A46]/8 text-[#0E5A46] dark:border-[#34D399] dark:bg-[#34D399]/10 dark:text-[#34D399]'
                    : 'border-[#E4E0D8] dark:border-[#253632] text-[#171B1A] dark:text-[#EEF2F0] hover:bg-[#F8F7F4] dark:hover:bg-[#1A2623]'
                }`}
              >
                <span className="text-sm font-medium">{method.label}</span>
                <span className="text-xs font-mono tabular-nums opacity-75 shrink-0">
                  {method.angles}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Madhab & High Latitude */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-[#E4E0D8] dark:border-[#21302D]">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Мазхаб для расчёта Аср
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(
              [
                {
                  id: 'hanafi',
                  label: 'Ханафитский',
                  desc: 'Тень равна двум длинам предмета (РФ, Средняя Азия)',
                },
                {
                  id: 'shafi',
                  label: 'Стандартный (Шафии и др.)',
                  desc: 'Тень равна одной длине предмета',
                },
              ] as { id: MadhabId; label: string; desc: string }[]
            ).map((m) => {
              const active = settings.madhab === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, madhab: m.id })}
                  className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    active
                      ? 'border-[#0E5A46] bg-[#0E5A46]/8 text-[#0E5A46] dark:border-[#34D399] dark:bg-[#34D399]/10 dark:text-[#34D399]'
                      : 'border-[#E4E0D8] dark:border-[#253632] text-[#171B1A] dark:text-[#EEF2F0] hover:bg-[#F8F7F4] dark:hover:bg-[#1A2623]'
                  }`}
                >
                  <span className="block text-sm font-semibold">{m.label}</span>
                  <span className="block text-xs text-[#5A6360] dark:text-[#98A6A1] mt-1">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Правило высоких широт
          </p>
          <div className="space-y-2">
            {HIGH_LATITUDE_OPTIONS.map((opt) => {
              const active = settings.highLatitudeRule === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ ...settings, highLatitudeRule: opt.id })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    active
                      ? 'border-[#0E5A46] bg-[#0E5A46]/8 text-[#0E5A46] dark:border-[#34D399] dark:bg-[#34D399]/10 dark:text-[#34D399]'
                      : 'border-[#E4E0D8] dark:border-[#253632] text-[#171B1A] dark:text-[#EEF2F0] hover:bg-[#F8F7F4] dark:hover:bg-[#1A2623]'
                  }`}
                >
                  <span className="block text-sm font-semibold">{opt.label}</span>
                  <span className="block text-xs text-[#5A6360] dark:text-[#98A6A1] mt-0.5">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
