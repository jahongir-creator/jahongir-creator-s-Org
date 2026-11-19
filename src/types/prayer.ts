export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export type CalculationMethodId =
  | 'RussiaSAMR'
  | 'MuslimWorldLeague'
  | 'Turkey'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'Karachi'
  | 'Dubai'
  | 'NorthAmerica';

export type MadhabId = 'shafi' | 'hanafi';

export type HighLatitudeId = 'MiddleOfTheNight' | 'SeventhOfTheNight' | 'TwilightAngle';

export type SoundStyle = 'chime' | 'harmonic' | 'bell';

export interface NotificationSettings {
  enabled: boolean;
  leadMinutes: number;
  soundEnabled: boolean;
  soundStyle: SoundStyle;
  perPrayer: Record<PrayerKey, boolean>;
}

export interface PrayerSettings {
  calculationMethod: CalculationMethodId;
  madhab: MadhabId;
  highLatitudeRule: HighLatitudeId;
}

export interface PrayerEntry {
  key: PrayerKey;
  nameRu: string;
  nameArabic: string;
  descriptionRu: string;
  time: Date;
  timeFormatted: string;
  isNext: boolean;
  isCurrent: boolean;
  isPassed: boolean;
  isMandatory: boolean;
}

export interface DailyPrayerSchedule {
  date: Date;
  dateFormatted: string;
  hijriDateFormatted: string;
  entries: PrayerEntry[];
  nextPrayer: PrayerEntry;
  currentPrayerKey: PrayerKey | null;
  windowProgress: number; // 0..1 between current prayer and next prayer
  sunnah: {
    middleOfTheNight: string;
    lastThirdOfTheNight: string;
  };
}

export type AppSection = 'schedule' | 'qibla' | 'notifications' | 'settings';
