import { Bell, Compass, Clock, MapPin, SlidersHorizontal } from 'lucide-react';
import { AppSection, CityLocation } from '../types/prayer';

interface TopBarProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  city: CityLocation;
  onOpenCityPicker: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string; mobileLabel: string }[] = [
  { id: 'schedule', label: 'Расписание', mobileLabel: 'Намазы' },
  { id: 'qibla', label: 'Кибла', mobileLabel: 'Кибла' },
  { id: 'notifications', label: 'Уведомления', mobileLabel: 'Напомнить' },
  { id: 'settings', label: 'Настройки', mobileLabel: 'Настройки' },
];

export function TopBar({
  activeSection,
  onSelectSection,
  city,
  onOpenCityPicker,
}: TopBarProps) {
  return (
    <>
      <header className="border-b border-[#E4E0D8] dark:border-[#21302D] bg-[#F8F7F4]/95 dark:bg-[#0B1110]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand wordmark */}
          <button
            type="button"
            onClick={() => onSelectSection('schedule')}
            className="font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[#171B1A] dark:text-[#EEF2F0] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5A46] dark:focus-visible:ring-[#34D399] rounded-md px-1"
          >
            Михраб
          </button>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav
            aria-label="Основная навигация"
            className="hidden md:flex items-center gap-6"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5A46] dark:focus-visible:ring-[#34D399] rounded-sm ${
                    isActive
                      ? 'text-[#0E5A46] dark:text-[#34D399]'
                      : 'text-[#5A6360] dark:text-[#98A6A1] hover:text-[#171B1A] dark:hover:text-[#EEF2F0]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0E5A46] dark:bg-[#34D399] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenCityPicker}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-sm font-medium rounded-lg bg-[#0E5A46] hover:bg-[#0A4737] text-white dark:bg-[#197B60] dark:hover:bg-[#1E8D6F] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E5A46] dark:focus-visible:ring-[#34D399]"
            >
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="max-w-[140px] truncate">{city.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (<= 64px height, <15% viewport cap) */}
      <nav
        aria-label="Мобильная навигация"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-[#121B19]/95 backdrop-blur-md border-t border-[#E4E0D8] dark:border-[#21302D] grid grid-cols-4 items-center"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const Icon =
            item.id === 'schedule'
              ? Clock
              : item.id === 'qibla'
                ? Compass
                : item.id === 'notifications'
                  ? Bell
                  : SlidersHorizontal;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#0E5A46] dark:text-[#34D399]'
                  : 'text-[#6A7370] dark:text-[#8B9994]'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
                {item.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
