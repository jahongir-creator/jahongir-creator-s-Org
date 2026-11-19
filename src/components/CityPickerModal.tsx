import { useEffect, useState } from 'react';
import { Loader2, MapPin, Navigation, Search, X } from 'lucide-react';
import { PRESET_CITIES } from '../data/cities';
import { CityLocation } from '../types/prayer';
import { formatCoordinates } from '../utils/prayerEngine';

interface CityPickerModalProps {
  isOpen: boolean;
  currentCity: CityLocation;
  onSelectCity: (city: CityLocation) => void;
  onClose: () => void;
}

interface GeocodingResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export function CityPickerModal({
  isOpen,
  currentCity,
  onSelectCity,
  onClose,
}: CityPickerModalProps) {
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState<CityLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setRemoteResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=ru&format=json`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Geocoding failed');
        const data = (await res.json()) as { results?: GeocodingResult[] };
        const mapped: CityLocation[] = (data.results ?? []).map((item) => ({
          id: `geo-${item.id}`,
          name: item.name,
          country: [item.admin1, item.country].filter(Boolean).join(', ') || 'Мир',
          latitude: item.latitude,
          longitude: item.longitude,
          timezone: item.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        }));
        setRemoteResults(mapped);
      } catch {
        setRemoteResults([]);
      } finally {
        setSearching(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (!isOpen) return null;

  const filteredLocal = PRESET_CITIES.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
  });

  const combinedList =
    query.trim().length >= 2 && remoteResults.length > 0 ? remoteResults : filteredLocal;

  const detectGeolocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('Геолокация не поддерживается вашим браузером');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let cityName = 'Моё местоположение';
        let countryName = 'Определено по GPS';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ru`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            cityName =
              addr.city || addr.town || addr.village || addr.state || cityName;
            countryName = addr.country || countryName;
          }
        } catch {
          // Graceful fallback to coordinates
        }

        onSelectCity({
          id: `gps-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
          name: cityName,
          country: countryName,
          latitude,
          longitude,
          timezone: browserTz,
        });
        setGeoLoading(false);
        onClose();
      },
      () => {
        setGeoLoading(false);
        setGeoError('Не удалось получить доступ к геолокации. Выберите город из списка.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Выбор города"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#E4E0D8] dark:border-[#21302D] bg-white dark:bg-[#121B19] shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E0D8] dark:border-[#21302D] flex items-center justify-between gap-4">
          <h3 className="font-[var(--font-display)] text-xl font-semibold text-[#171B1A] dark:text-[#EEF2F0]">
            Выбор города
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно выбора города"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#5A6360] dark:text-[#98A6A1] hover:bg-[#F1EFEA] dark:hover:bg-[#1A2623] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Search & Geolocation */}
        <div className="p-5 space-y-3 border-b border-[#E4E0D8] dark:border-[#21302D]">
          <button
            type="button"
            onClick={detectGeolocation}
            disabled={geoLoading}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0E5A46] hover:bg-[#0A4737] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Navigation className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{geoLoading ? 'Определение координат...' : 'Определить моё местоположение'}</span>
          </button>

          {geoError && (
            <p className="text-xs text-[#B42318] dark:text-[#F87171]">{geoError}</p>
          )}

          <div className="relative">
            <Search
              className="w-4 h-4 text-[#7A827E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск города (например: Казань, Ташкент, Грозный)..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm rounded-xl border border-[#E4E0D8] dark:border-[#253632] bg-[#F8F7F4] dark:bg-[#0B1110] text-[#171B1A] dark:text-[#EEF2F0] placeholder:text-[#7A827E] focus:outline-none focus:ring-2 focus:ring-[#0E5A46] dark:focus:ring-[#34D399]"
            />
          </div>
        </div>

        {/* City List */}
        <div className="overflow-y-auto divide-y divide-[#ECE8DF] dark:divide-[#1D2B28] px-2 py-1">
          {searching ? (
            <div className="py-8 flex items-center justify-center gap-2 text-sm text-[#5A6360] dark:text-[#98A6A1]">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Поиск городов...</span>
            </div>
          ) : combinedList.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#5A6360] dark:text-[#98A6A1]">
              Город не найден. Попробуйте другое название.
            </div>
          ) : (
            combinedList.map((item) => {
              const isSelected =
                Math.abs(item.latitude - currentCity.latitude) < 0.01 &&
                Math.abs(item.longitude - currentCity.longitude) < 0.01;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectCity(item);
                    onClose();
                  }}
                  className={`w-full min-h-[56px] px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0E5A46]/8 text-[#0E5A46] dark:bg-[#34D399]/10 dark:text-[#34D399]'
                      : 'hover:bg-[#F8F7F4] dark:hover:bg-[#1A2623] text-[#171B1A] dark:text-[#EEF2F0]'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <MapPin className="w-4 h-4 shrink-0 opacity-70" aria-hidden="true" />
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold truncate">
                        {item.name}
                      </span>
                      <span className="block text-xs text-[#5A6360] dark:text-[#98A6A1] truncate">
                        {item.country}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[#6A7370] dark:text-[#8B9994] shrink-0">
                    {formatCoordinates(item.latitude, item.longitude)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
