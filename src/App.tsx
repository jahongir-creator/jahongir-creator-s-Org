import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CityPickerModal } from './components/CityPickerModal';
import { HeroPrayerBanner } from './components/HeroPrayerBanner';
import { NotificationPanel } from './components/NotificationPanel';
import { PrayerScheduleList } from './components/PrayerScheduleList';
import { QiblaCompass } from './components/QiblaCompass';
import { ActiveToast, ReminderToast } from './components/ReminderToast';
import { SettingsPanel } from './components/SettingsPanel';
import { TopBar } from './components/TopBar';
import { PRESET_CITIES } from './data/cities';
import {
  AppSection,
  CityLocation,
  NotificationSettings,
  PrayerKey,
  PrayerSettings,
} from './types/prayer';
import { computeDailySchedule, getQiblaBearing } from './utils/prayerEngine';
import {
  getNotificationPermissionState,
  playPrayerTone,
  requestBrowserNotificationPermission,
  showBrowserNotification,
} from './utils/soundAndNotify';

const STORAGE_KEYS = {
  city: 'mihrab_city_v1',
  prayerSettings: 'mihrab_prayer_settings_v1',
  notificationSettings: 'mihrab_notifications_v1',
  theme: 'mihrab_theme_v1',
};

const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  calculationMethod: 'RussiaSAMR',
  madhab: 'hanafi',
  highLatitudeRule: 'MiddleOfTheNight',
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  leadMinutes: 10,
  soundEnabled: true,
  soundStyle: 'chime',
  perPrayer: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export default function App() {
  const [city, setCity] = useState<CityLocation>(() =>
    loadFromStorage<CityLocation>(STORAGE_KEYS.city, PRESET_CITIES[0])
  );
  const [prayerSettings, setPrayerSettings] = useState<PrayerSettings>(() =>
    loadFromStorage<PrayerSettings>(STORAGE_KEYS.prayerSettings, DEFAULT_PRAYER_SETTINGS)
  );
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const loaded = loadFromStorage<NotificationSettings>(
      STORAGE_KEYS.notificationSettings,
      DEFAULT_NOTIFICATION_SETTINGS
    );
    return {
      ...loaded,
      perPrayer: {
        ...DEFAULT_NOTIFICATION_SETTINGS.perPrayer,
        ...(loaded.perPrayer ?? {}),
      },
    };
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  const [activeSection, setActiveSection] = useState<AppSection>('schedule');
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>(
    () => getNotificationPermissionState()
  );
  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);
  const firedRemindersRef = useRef<Set<string>>(new Set());

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  // Persist user preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.city, JSON.stringify(city));
    } catch {
      // ignore
    }
  }, [city]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.prayerSettings, JSON.stringify(prayerSettings));
    } catch {
      // ignore
    }
  }, [prayerSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.notificationSettings,
        JSON.stringify(notificationSettings)
      );
    } catch {
      // ignore
    }
  }, [notificationSettings]);

  // Live 1-second clock & permission sync on focus
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    const handleFocus = () => {
      setPermissionState(getNotificationPermissionState());
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const schedule = useMemo(
    () => computeDailySchedule(city, prayerSettings, now, 0),
    [city, prayerSettings, now]
  );

  const qiblaBearing = useMemo(
    () => getQiblaBearing(city.latitude, city.longitude),
    [city.latitude, city.longitude]
  );

  const triggerReminder = useCallback(
    (title: string, body: string) => {
      if (notificationSettings.soundEnabled) {
        playPrayerTone(notificationSettings.soundStyle);
      }
      showBrowserNotification(title, body);
      setActiveToast({
        id: `${Date.now()}`,
        title,
        body,
      });
    },
    [notificationSettings.soundEnabled, notificationSettings.soundStyle]
  );

  // Auto-dismiss toast after 9 seconds
  useEffect(() => {
    if (!activeToast) return;
    const t = window.setTimeout(() => setActiveToast(null), 9000);
    return () => window.clearTimeout(t);
  }, [activeToast]);

  // Real-time prayer reminder scheduler (includes nextPrayer for cross-midnight advance alerts)
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    const leadMs = notificationSettings.leadMinutes * 60_000;
    const nowMs = now.getTime();
    const candidates = [...schedule.entries, schedule.nextPrayer];

    for (const entry of candidates) {
      if (!notificationSettings.perPrayer[entry.key]) continue;
      const reminderTargetMs = entry.time.getTime() - leadMs;
      const diff = nowMs - reminderTargetMs;
      const dedupeKey = `${city.id}-${entry.key}-${entry.time.getTime()}-${notificationSettings.leadMinutes}`;

      if (diff >= 0 && diff < 15_000 && !firedRemindersRef.current.has(dedupeKey)) {
        firedRemindersRef.current.add(dedupeKey);
        const title =
          notificationSettings.leadMinutes === 0
            ? `Время намаза ${entry.nameRu}`
            : `Через ${notificationSettings.leadMinutes} мин — ${entry.nameRu}`;
        const body = `${city.name} · Начало в ${entry.timeFormatted}`;
        triggerReminder(title, body);
      }
    }
  }, [now, schedule.entries, schedule.nextPrayer, notificationSettings, city.id, city.name, triggerReminder]);

  const handleRequestPermission = async () => {
    const result = await requestBrowserNotificationPermission();
    setPermissionState(result);
  };

  const handleQuickToggleNotifications = async () => {
    if (!notificationSettings.enabled && permissionState === 'default') {
      const result = await requestBrowserNotificationPermission();
      setPermissionState(result);
    }
    setNotificationSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleTogglePrayerNotification = (key: PrayerKey) => {
    setNotificationSettings((prev) => ({
      ...prev,
      enabled: true,
      perPrayer: {
        ...prev.perPrayer,
        [key]: !prev.perPrayer[key],
      },
    }));
  };

  const handleTestNotification = async () => {
    if (permissionState === 'default') {
      const result = await requestBrowserNotificationPermission();
      setPermissionState(result);
    }
    triggerReminder(
      `Напоминание: ${schedule.nextPrayer.nameRu}`,
      `${city.name} · Начало в ${schedule.nextPrayer.timeFormatted} (тестовое уведомление)`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-[#0B1110] text-[#171B1A] dark:text-[#EEF2F0]">
      <TopBar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        city={city}
        onOpenCityPicker={() => setIsCityPickerOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12 space-y-8">
        {activeSection === 'schedule' && (
          <>
            <HeroPrayerBanner
              city={city}
              schedule={schedule}
              now={now}
              qiblaBearing={qiblaBearing}
              notificationSettings={notificationSettings}
              onQuickToggleNotifications={handleQuickToggleNotifications}
              onOpenQibla={() => setActiveSection('qibla')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <PrayerScheduleList
                  city={city}
                  schedule={schedule}
                  prayerSettings={prayerSettings}
                  notificationSettings={notificationSettings}
                  now={now}
                  onTogglePrayerNotification={handleTogglePrayerNotification}
                />
              </div>

              <div className="lg:col-span-5">
                <QiblaCompass city={city} now={now} />
              </div>
            </div>
          </>
        )}

        {activeSection === 'qibla' && (
          <div className="max-w-3xl mx-auto">
            <QiblaCompass city={city} now={now} expanded />
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="max-w-4xl mx-auto">
            <NotificationPanel
              settings={notificationSettings}
              permissionState={permissionState}
              onUpdateSettings={setNotificationSettings}
              onRequestPermission={handleRequestPermission}
              onTestNotification={handleTestNotification}
            />
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <SettingsPanel
              settings={prayerSettings}
              isDark={isDark}
              onUpdateSettings={setPrayerSettings}
              onToggleTheme={setIsDark}
            />
          </div>
        )}
      </main>

      <footer className="hidden md:block border-t border-[#E4E0D8] dark:border-[#21302D] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-[#6A7370] dark:text-[#8B9994]">
          <span>Михраб · Астрономический расчёт времени намаза и направления Киблы</span>
          <span className="font-mono tabular-nums">{city.timezone}</span>
        </div>
      </footer>

      <CityPickerModal
        isOpen={isCityPickerOpen}
        currentCity={city}
        onSelectCity={setCity}
        onClose={() => setIsCityPickerOpen(false)}
      />

      <ReminderToast toast={activeToast} onDismiss={() => setActiveToast(null)} />
    </div>
  );
}
