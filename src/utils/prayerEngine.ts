import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from 'adhan';
import {
  CalculationMethodId,
  CityLocation,
  DailyPrayerSchedule,
  HighLatitudeId,
  MadhabId,
  PrayerEntry,
  PrayerKey,
  PrayerSettings,
} from '../types/prayer';

export const KAABA_LAT = 21.422487;
export const KAABA_LNG = 39.826206;

export const PRAYER_META: Record<
  PrayerKey,
  { nameRu: string; nameArabic: string; descriptionRu: string; isMandatory: boolean }
> = {
  fajr: {
    nameRu: 'Фаджр',
    nameArabic: 'الفجر',
    descriptionRu: 'Утренний рассветный намаз',
    isMandatory: true,
  },
  sunrise: {
    nameRu: 'Восход',
    nameArabic: 'الشروق',
    descriptionRu: 'Окончание времени Фаджра',
    isMandatory: false,
  },
  dhuhr: {
    nameRu: 'Зухр',
    nameArabic: 'الظهر',
    descriptionRu: 'Полуденный намаз',
    isMandatory: true,
  },
  asr: {
    nameRu: 'Аср',
    nameArabic: 'العصر',
    descriptionRu: 'Предвечерний намаз',
    isMandatory: true,
  },
  maghrib: {
    nameRu: 'Магриб',
    nameArabic: 'المغرب',
    descriptionRu: 'Вечерний закатный намаз',
    isMandatory: true,
  },
  isha: {
    nameRu: 'Иша',
    nameArabic: 'العشاء',
    descriptionRu: 'Ночной намаз',
    isMandatory: true,
  },
};

export const CALCULATION_METHODS: {
  id: CalculationMethodId;
  label: string;
  shortLabel: string;
  angles: string;
}[] = [
  {
    id: 'RussiaSAMR',
    label: 'ДУМ РФ / СНГ (Стандарт России)',
    shortLabel: 'ДУМ РФ',
    angles: '18° / 15°',
  },
  {
    id: 'MuslimWorldLeague',
    label: 'Всемирная исламская лига (MWL)',
    shortLabel: 'MWL',
    angles: '18° / 17°',
  },
  {
    id: 'Turkey',
    label: 'Диянет (Турция)',
    shortLabel: 'Диянет',
    angles: '18° / 17°',
  },
  {
    id: 'UmmAlQura',
    label: 'Умм аль-Кура (Мекка)',
    shortLabel: 'Умм аль-Кура',
    angles: '18.5° / 90 мин',
  },
  {
    id: 'Egyptian',
    label: 'Египетское управление',
    shortLabel: 'Египет',
    angles: '19.5° / 17.5°',
  },
  {
    id: 'Karachi',
    label: 'Университет исламских наук (Карачи)',
    shortLabel: 'Карачи',
    angles: '18° / 18°',
  },
  {
    id: 'Dubai',
    label: 'Дубай / ОАЭ',
    shortLabel: 'Дубай',
    angles: '18.2° / 18.2°',
  },
  {
    id: 'NorthAmerica',
    label: 'Исламское общество Северной Америки (ISNA)',
    shortLabel: 'ISNA',
    angles: '15° / 15°',
  },
];

export function buildCalculationParams(settings: PrayerSettings): CalculationParameters {
  let params: CalculationParameters;

  switch (settings.calculationMethod) {
    case 'RussiaSAMR':
      params = new CalculationParameters('Other', 18, 15);
      break;
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'MuslimWorldLeague':
    default:
      params = CalculationMethod.MuslimWorldLeague();
      break;
  }

  params.madhab = settings.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  switch (settings.highLatitudeRule) {
    case 'SeventhOfTheNight':
      params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
      break;
    case 'TwilightAngle':
      params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
      break;
    case 'MiddleOfTheNight':
    default:
      params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
      break;
  }

  return params;
}

export function formatTimeInZone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }
}

export function formatDateInZone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString('ru-RU');
  }
}

export function formatShortDateInZone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return date.toLocaleDateString('ru-RU');
  }
}

export function formatHijriDateInZone(date: Date, timeZone: string): string {
  try {
    const formatted = new Intl.DateTimeFormat('ru-RU-u-ca-islamic-umalqura', {
      timeZone,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return formatted;
  } catch {
    return '';
  }
}

/**
 * Returns the YYYY-MM-DD calendar date in the target city's timezone
 * so day-change and today's prayer schedule match the city's local clock.
 */
export function getCityLocalDateAnchor(now: Date, timeZone: string, dayOffset = 0): Date {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);

    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    return new Date(year, month - 1, day + dayOffset, 12, 0, 0, 0);
  } catch {
    const copy = new Date(now);
    copy.setDate(copy.getDate() + dayOffset);
    copy.setHours(12, 0, 0, 0);
    return copy;
  }
}

export function computeDailySchedule(
  city: CityLocation,
  settings: PrayerSettings,
  now: Date,
  dayOffset = 0
): DailyPrayerSchedule {
  const coords = new Coordinates(city.latitude, city.longitude);
  const params = buildCalculationParams(settings);
  const targetDate = getCityLocalDateAnchor(now, city.timezone, dayOffset);

  const prayerTimes = new PrayerTimes(coords, targetDate, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  const keys: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const rawTimes: Record<PrayerKey, Date> = {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  };

  let nextKey: PrayerKey | null = null;
  let currentKey: PrayerKey | null = null;

  if (dayOffset === 0) {
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (rawTimes[k].getTime() > now.getTime()) {
        nextKey = k;
        currentKey = i > 0 ? keys[i - 1] : null;
        break;
      }
    }
  }

  // If all today's prayers have passed, next prayer is tomorrow's Fajr
  let nextPrayerEntry: PrayerEntry;
  let windowProgress = 0;

  const entries: PrayerEntry[] = keys.map((key) => {
    const time = rawTimes[key];
    const meta = PRAYER_META[key];
    const isPassed = dayOffset === 0 ? time.getTime() <= now.getTime() : false;
    const isNext = dayOffset === 0 && nextKey === key;
    const isCurrent = dayOffset === 0 && currentKey === key;

    return {
      key,
      nameRu: meta.nameRu,
      nameArabic: meta.nameArabic,
      descriptionRu: meta.descriptionRu,
      time,
      timeFormatted: formatTimeInZone(time, city.timezone),
      isNext,
      isCurrent,
      isPassed,
      isMandatory: meta.isMandatory,
    };
  });

  if (dayOffset === 0 && nextKey !== null) {
    const found = entries.find((e) => e.key === nextKey)!;
    nextPrayerEntry = found;

    // Progress between previous prayer (or midnight/yesterday isha) and next prayer
    const currentIdx = keys.indexOf(nextKey) - 1;
    let prevTime: number;
    if (currentIdx >= 0) {
      prevTime = rawTimes[keys[currentIdx]].getTime();
    } else {
      const yesterdayAnchor = getCityLocalDateAnchor(now, city.timezone, -1);
      const yesterdayPrayers = new PrayerTimes(coords, yesterdayAnchor, params);
      prevTime = yesterdayPrayers.isha.getTime();
    }
    const nextTime = found.time.getTime();
    const total = Math.max(1, nextTime - prevTime);
    windowProgress = Math.min(1, Math.max(0, (now.getTime() - prevTime) / total));
  } else {
    // Tomorrow's Fajr
    const tomorrowAnchor = getCityLocalDateAnchor(now, city.timezone, dayOffset + 1);
    const tomorrowPrayers = new PrayerTimes(coords, tomorrowAnchor, params);
    const fajrMeta = PRAYER_META.fajr;
    nextPrayerEntry = {
      key: 'fajr',
      nameRu: fajrMeta.nameRu,
      nameArabic: fajrMeta.nameArabic,
      descriptionRu: 'Завтрашний утренний намаз',
      time: tomorrowPrayers.fajr,
      timeFormatted: formatTimeInZone(tomorrowPrayers.fajr, city.timezone),
      isNext: true,
      isCurrent: false,
      isPassed: false,
      isMandatory: true,
    };
    currentKey = 'isha';

    const prevTime = rawTimes.isha.getTime();
    const nextTime = tomorrowPrayers.fajr.getTime();
    const total = Math.max(1, nextTime - prevTime);
    windowProgress = Math.min(1, Math.max(0, (now.getTime() - prevTime) / total));
  }

  return {
    date: prayerTimes.dhuhr,
    dateFormatted: formatDateInZone(prayerTimes.dhuhr, city.timezone),
    hijriDateFormatted: formatHijriDateInZone(prayerTimes.dhuhr, city.timezone),
    entries,
    nextPrayer: nextPrayerEntry,
    currentPrayerKey: currentKey,
    windowProgress,
    sunnah: {
      middleOfTheNight: formatTimeInZone(sunnahTimes.middleOfTheNight, city.timezone),
      lastThirdOfTheNight: formatTimeInZone(sunnahTimes.lastThirdOfTheNight, city.timezone),
    },
  };
}

export function computeMultiDaySchedule(
  city: CityLocation,
  settings: PrayerSettings,
  now: Date,
  days: number
): {
  dateLabel: string;
  hijriShort: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  isToday: boolean;
}[] {
  const coords = new Coordinates(city.latitude, city.longitude);
  const params = buildCalculationParams(settings);
  const rows = [];

  for (let i = 0; i < days; i++) {
    const anchor = getCityLocalDateAnchor(now, city.timezone, i);
    const pt = new PrayerTimes(coords, anchor, params);
    let hijriShort = '';
    try {
      hijriShort = new Intl.DateTimeFormat('ru-RU-u-ca-islamic-umalqura', {
        timeZone: city.timezone,
        day: 'numeric',
        month: 'short',
      }).format(pt.dhuhr);
    } catch {
      hijriShort = '';
    }
    rows.push({
      dateLabel: formatShortDateInZone(pt.dhuhr, city.timezone),
      hijriShort,
      fajr: formatTimeInZone(pt.fajr, city.timezone),
      sunrise: formatTimeInZone(pt.sunrise, city.timezone),
      dhuhr: formatTimeInZone(pt.dhuhr, city.timezone),
      asr: formatTimeInZone(pt.asr, city.timezone),
      maghrib: formatTimeInZone(pt.maghrib, city.timezone),
      isha: formatTimeInZone(pt.isha, city.timezone),
      isToday: i === 0,
    });
  }
  return rows;
}

export function getQiblaBearing(latitude: number, longitude: number): number {
  const coords = new Coordinates(latitude, longitude);
  return Qibla(coords);
}

export function getDistanceToKaabaKm(latitude: number, longitude: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(KAABA_LAT - latitude);
  const dLon = toRad(KAABA_LNG - longitude);
  const lat1 = toRad(latitude);
  const lat2 = toRad(KAABA_LAT);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Computes approximate solar azimuth (degrees clockwise from True North) and altitude
 * for the given coordinates & UTC timestamp so users can orient visually by the sun outdoors.
 */
export function getSolarPosition(
  date: Date,
  latitude: number,
  longitude: number
): { azimuth: number; altitude: number } {
  const rad = Math.PI / 180;
  const dayMs = 86400000;
  const J2000 = 2451545.0;
  const jd = date.getTime() / dayMs + 2440587.5;
  const n = jd - J2000;

  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const epsilon = (23.439 - 0.0000004 * n) * rad;

  const dec = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));

  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  const lmst = (gmst * 15 + longitude) * rad;
  const ha = lmst - ra;

  const latRad = latitude * rad;
  const altitudeRad = Math.asin(
    Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(ha)
  );

  const azRad = Math.atan2(
    -Math.sin(ha),
    Math.tan(dec) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(ha)
  );

  const azimuth = ((azRad / rad) + 360) % 360;
  const altitude = altitudeRad / rad;
  return { azimuth, altitude };
}

export function formatCountdown(msRemaining: number): string {
  const totalSec = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'с.ш.' : 'ю.ш.';
  const lngDir = lng >= 0 ? 'в.д.' : 'з.д.';
  return `${Math.abs(lat).toFixed(2)}° ${latDir}, ${Math.abs(lng).toFixed(2)}° ${lngDir}`;
}

export function getCardinalDirectionRu(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const dirs = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
  return dirs[Math.round(normalized / 45) % 8];
}
