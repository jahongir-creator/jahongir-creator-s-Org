import { Bell, BellRing, Check, Volume2, VolumeX } from 'lucide-react';
import { NotificationSettings, PrayerKey, SoundStyle } from '../types/prayer';
import { PRAYER_META } from '../utils/prayerEngine';

interface NotificationPanelProps {
  settings: NotificationSettings;
  permissionState: NotificationPermission | 'unsupported';
  onUpdateSettings: (next: NotificationSettings) => void;
  onRequestPermission: () => Promise<void>;
  onTestNotification: () => void;
}

const LEAD_OPTIONS = [
  { value: 0, label: 'Во время азана' },
  { value: 5, label: 'За 5 минут' },
  { value: 10, label: 'За 10 минут' },
  { value: 15, label: 'За 15 минут' },
  { value: 30, label: 'За 30 минут' },
];

const SOUND_STYLES: { id: SoundStyle; label: string }[] = [
  { id: 'chime', label: 'Мягкий перезвон' },
  { id: 'harmonic', label: 'Тёплый аккорд' },
  { id: 'bell', label: 'Мелодичный звон' },
];

const PRAYER_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function NotificationPanel({
  settings,
  permissionState,
  onUpdateSettings,
  onRequestPermission,
  onTestNotification,
}: NotificationPanelProps) {
  const toggleGlobal = () => {
    onUpdateSettings({ ...settings, enabled: !settings.enabled });
  };

  const togglePrayer = (key: PrayerKey) => {
    onUpdateSettings({
      ...settings,
      perPrayer: {
        ...settings.perPrayer,
        [key]: !settings.perPrayer[key],
      },
    });
  };

  const permissionText =
    permissionState === 'granted'
      ? 'Разрешены в браузере'
      : permissionState === 'denied'
        ? 'Заблокированы в настройках браузера (будут показаны внутри приложения)'
        : permissionState === 'unsupported'
          ? 'Системные уведомления не поддерживаются (работают внутри приложения)'
          : 'Ожидается разрешение браузера';

  return (
    <section
      aria-label="Настройки уведомлений"
      className="rounded-2xl border border-[#E4E0D8] dark:border-[#21302D] bg-white dark:bg-[#121B19] p-6 sm:p-7 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E0D8] dark:border-[#21302D]">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Уведомления и напоминания
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5A6360] dark:text-[#98A6A1]">
            Системные уведомления и звуковой сигнал перед началом намаза
          </p>
        </div>

        <button
          type="button"
          onClick={toggleGlobal}
          className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            settings.enabled
              ? 'bg-[#0E5A46] text-white hover:bg-[#0A4737] dark:bg-[#197B60]'
              : 'bg-[#F1EFEA] dark:bg-[#1A2623] text-[#171B1A] dark:text-[#EEF2F0] hover:bg-[#E7E3DA] dark:hover:bg-[#22332F]'
          }`}
        >
          <Bell className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{settings.enabled ? 'Напоминания включены' : 'Напоминания отключены'}</span>
        </button>
      </div>

      {/* Browser permission & Test row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F7F4] dark:bg-[#0F1715] border border-[#E4E0D8] dark:border-[#21302D]">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Статус браузерных уведомлений
          </p>
          <p className="text-xs text-[#5A6360] dark:text-[#98A6A1]">{permissionText}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {permissionState === 'default' && (
            <button
              type="button"
              onClick={onRequestPermission}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg border border-[#0E5A46] text-[#0E5A46] dark:border-[#34D399] dark:text-[#34D399] hover:bg-[#0E5A46]/5 cursor-pointer whitespace-nowrap"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Разрешить уведомления</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTestNotification}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg bg-[#171B1A] dark:bg-[#EEF2F0] text-white dark:text-[#111716] hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
          >
            <BellRing className="w-4 h-4" aria-hidden="true" />
            <span>Проверить уведомление</span>
          </button>
        </div>
      </div>

      {/* Lead Time & Sound Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Когда напоминать
          </p>
          <div className="flex flex-wrap gap-2">
            {LEAD_OPTIONS.map((opt) => {
              const active = settings.leadMinutes === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, leadMinutes: opt.value })}
                  className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#0E5A46] border-[#0E5A46] text-white dark:bg-[#197B60] dark:border-[#197B60]'
                      : 'bg-white dark:bg-[#121B19] border-[#E4E0D8] dark:border-[#253632] text-[#171B1A] dark:text-[#EEF2F0] hover:bg-[#F8F7F4] dark:hover:bg-[#1A2623]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
              Звуковой сигнал
            </p>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
              }
              className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                settings.soundEnabled
                  ? 'border-[#0E5A46]/30 bg-[#0E5A46]/10 text-[#0E5A46] dark:border-[#34D399]/30 dark:bg-[#34D399]/10 dark:text-[#34D399]'
                  : 'border-[#E4E0D8] dark:border-[#253632] text-[#5A6360] dark:text-[#98A6A1]'
              }`}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{settings.soundEnabled ? 'Звук включён' : 'Без звука'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {SOUND_STYLES.map((style) => {
              const active = settings.soundStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  disabled={!settings.soundEnabled}
                  onClick={() => onUpdateSettings({ ...settings, soundStyle: style.id })}
                  className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed ${
                    active
                      ? 'bg-[#0E5A46] border-[#0E5A46] text-white dark:bg-[#197B60] dark:border-[#197B60]'
                      : 'bg-white dark:bg-[#121B19] border-[#E4E0D8] dark:border-[#253632] text-[#171B1A] dark:text-[#EEF2F0] hover:bg-[#F8F7F4] dark:hover:bg-[#1A2623]'
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-prayer matrix */}
      <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#21302D] space-y-3">
        <p className="text-sm font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
          Намазы для напоминаний
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRAYER_ORDER.map((key) => {
            const meta = PRAYER_META[key];
            const active = settings.perPrayer[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => togglePrayer(key)}
                className={`min-h-[52px] px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  active
                    ? 'border-[#0E5A46] bg-[#0E5A46]/8 text-[#0E5A46] dark:border-[#34D399] dark:bg-[#34D399]/10 dark:text-[#34D399]'
                    : 'border-[#E4E0D8] dark:border-[#253632] text-[#5A6360] dark:text-[#98A6A1] hover:text-[#171B1A] dark:hover:text-[#EEF2F0]'
                }`}
              >
                <span className="block text-sm font-semibold">{meta.nameRu}</span>
                <span className="block text-[11px] opacity-80">
                  {active ? 'Включено' : 'Отключено'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
