import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Navbar from '../components/layout/Navbar';
import { ImagePlus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type ShowEntry = {
  startTime: string;
  durationMins: number;
};

type ShowDayState = {
  date: string;
  shows: ShowEntry[];
};

const toDateOnly = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const formatDateInputLocal = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDateRange = (fromDate: string, toDateValue: string) => {
  const start = fromDate ? toDateOnly(new Date(fromDate)) : null;
  const end = toDateValue ? toDateOnly(new Date(toDateValue)) : null;
  if (!start || !end || start > end) return [] as string[];

  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDateInputLocal(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const toMinutes = (timeValue: string) => {
  const [hours, minutes] = timeValue.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatDisplayDate = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
};

const parseTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return { hour: h ?? 0, minute: m ?? 0 };
};

const AddEvent = () => {
  const navigate = useNavigate();
  const { updateBooking } = useBooking();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cinema');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [imageName, setImageName] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showDays, setShowDays] = useState<ShowDayState[]>([]);
  const [scheduleError, setScheduleError] = useState('');
  const { isDark } = useTheme();

  // Get today's date in local YYYY-MM-DD format for date input min attribute
  const today = formatDateInputLocal(new Date());

  const categoryOptions = ['Cinema', 'Theatre', 'Lecture Hall'];
  const debugImages = [
    'https://www.superherotoystore.com/cdn/shop/articles/dune-part-two-2024-5k-rl-3840x2400_1600x.jpg?v=1709290352',
    'https://beetlejuicethemusical.com.au/wp-content/uploads/2025/06/beetlejuice-title.jpg',
    'https://aws-tiqets-cdn.imgix.net/images/content/af800c2a213a46b28e696d9efae8fcba.jpg?auto=format%2Ccompress&fit=crop&q=70&w=600&s=61daa83f62dc8edda6220caaa0ea0639',
  ];

  const nameValid = name.trim().length >= 10;
  const descriptionValid = description.trim().length >= 10;
  const datesValid = Boolean(dateFrom && dateTo && dateFrom <= dateTo);
  const imageValid = Boolean(imagePreview);
  const totalShows = showDays.reduce((sum, day) => sum + day.shows.length, 0);
  const scheduleValid =
    totalShows > 0 &&
    showDays.every((day) =>
      day.shows.every((show) => {
        const start = toMinutes(show.startTime);
        const end = start + show.durationMins;
        return show.durationMins >= 15 && show.durationMins <= 720 && end <= 1440;
      }),
    );
  const canSubmit = nameValid && descriptionValid && datesValid && category && imageValid && scheduleValid;

  useEffect(() => {
    const dateRange = buildDateRange(dateFrom, dateTo);
    setShowDays((prev) =>
      dateRange.map((date) => {
        const existing = prev.find((day) => day.date === date);
        return existing || { date, shows: [] };
      }),
    );
  }, [dateFrom, dateTo]);

  const addShow = (date: string) => {
    setShowDays((prev) =>
      prev.map((day) => {
        if (day.date !== date) return day;
        return { ...day, shows: [...day.shows, { startTime: '19:00', durationMins: 120 }] };
      }),
    );
  };

  const removeShow = (date: string, index: number) => {
    setShowDays((prev) =>
      prev.map((day) => {
        if (day.date !== date) return day;
        const next = [...day.shows];
        next.splice(index, 1);
        return { ...day, shows: next };
      }),
    );
  };

  const updateShowStart = (date: string, index: number, hour: number, minute: number) => {
    const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    setShowDays((prev) =>
      prev.map((day) => {
        if (day.date !== date) return day;
        const next = day.shows.map((show, i) => (i === index ? { ...show, startTime } : show));
        return { ...day, shows: next };
      }),
    );
  };

  const updateShowDuration = (date: string, index: number, durationMins: number) => {
    const clamped = Math.min(720, Math.max(0, durationMins));
    setShowDays((prev) =>
      prev.map((day) => {
        if (day.date !== date) return day;
        const next = day.shows.map((show, i) => (i === index ? { ...show, durationMins: clamped } : show));
        return { ...day, shows: next };
      }),
    );
  };

  const validateSchedule = () => {
    if (totalShows <= 0) {
      return 'Set at least one show in total.';
    }

    for (const day of showDays) {
      if (day.shows.length === 0) continue;

      for (const show of day.shows) {
        const start = toMinutes(show.startTime);
        const end = start + show.durationMins;
        if (show.durationMins < 15) return `Show on ${formatDisplayDate(day.date)}: duration must be at least 15 minutes.`;
        if (show.durationMins > 720) return `Show on ${formatDisplayDate(day.date)}: duration cannot exceed 12 hours.`;
        if (end > 1440) return `Show on ${formatDisplayDate(day.date)}: show cannot end past midnight.`;
      }

      const sorted = [...day.shows].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
      for (let i = 1; i < sorted.length; i++) {
        const prevEnd = toMinutes(sorted[i - 1].startTime) + sorted[i - 1].durationMins;
        const nextStart = toMinutes(sorted[i].startTime);
        if (nextStart - prevEnd < 60) {
          return `Shows on ${formatDisplayDate(day.date)}: gap between shows must be at least 1 hour.`;
        }
      }
    }

    return '';
  };

  const randomizeDebugEvent = () => {
    const titles = [
      'Moulin Rouge! Night Session',
      'Dune Marathon Experience',
      'AI and Society: Evening Special',
      'Romeo and Juliet Anniversary Stage',
    ];
    const descriptions = [
      'A fully randomized debug event to quickly verify host creation flow and form validation behavior.',
      'Auto-generated event payload for QA checks, including date bounds, category assignment, and image preview handling.',
      'Debug scenario event used to validate booking context handoff between Add Event and Venue Selection pages.',
    ];

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomCategory = categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
    const randomImage = debugImages[Math.floor(Math.random() * debugImages.length)];

    const now = new Date();
    const startOffset = 1 + Math.floor(Math.random() * 20);
    const endOffset = startOffset + 1 + Math.floor(Math.random() * 4);
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + startOffset);
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + endOffset);

    const fromStr = formatDateInputLocal(startDate);
    const toStr = formatDateInputLocal(endDate);
    setName(randomTitle);
    setDescription(randomDescription);
    setCategory(randomCategory);
    setDateFrom(fromStr);
    setDateTo(toStr);
    setImageName('debug-poster.jpg');
    setImagePreview(randomImage);
    setShowDays(buildDateRange(fromStr, toStr).map((date) => ({ date, shows: [{ startTime: '19:00', durationMins: 120 }] })));
    setScheduleError('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageName(file.name);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const scheduleValidationError = validateSchedule();
    if (scheduleValidationError) {
      setScheduleError(scheduleValidationError);
      return;
    }

    const normalizedSchedule = showDays
      .filter((day) => day.shows.length > 0)
      .map((day) => ({
        date: day.date,
        times: [...day.shows]
          .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
          .map((show) => show.startTime),
      }));

    const eventId = `host-${Date.now()}`;
    updateBooking({
      eventId,
      eventTitle: name,
      eventCategory: category,
      eventImageUrl: imagePreview,
      date: dateFrom,
      dateTo,
      time: normalizedSchedule.find((day) => day.times.length > 0)?.times[0] || '',
      showSchedule: normalizedSchedule,
    });
    setScheduleError('');
    navigate('/host-dashboard/add-event/venue');
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans selection:bg-[#ffbcc7] selection:text-[#3a0e23]">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <h1 className="text-5xl font-black text-[#d3265b] uppercase tracking-tight mb-8">Adding new event</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
          <section className="rounded-[40px] border border-[#ff5b8d] bg-white p-10 shadow-xl">
            <div className="space-y-10">
              <div>
                <label className="block text-[32px] font-black text-[#3a0e23] uppercase mb-4">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type the name of your event here..."
                  className="w-full rounded-2xl border border-[#3a0e23]/20 bg-[#faf8f1] px-5 py-4 text-lg font-bold text-[#3a0e23] outline-none focus:border-[#d3265b] focus:ring-2 focus:ring-[#d3265b]/20"
                />
                <p className="mt-2 text-sm text-[#92717a]">{name.length}/100 chars</p>
                {!nameValid && name.length > 0 && (
                  <p className="mt-2 text-sm text-[#d3265b] font-bold">Please enter at least 10 characters.</p>
                )}
              </div>

              <div>
                <label className="block text-[32px] font-black text-[#3a0e23] uppercase mb-4">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type the description of your event here..."
                  className="w-full min-h-[120px] rounded-2xl border border-[#3a0e23]/20 bg-[#faf8f1] px-5 py-4 text-lg font-bold text-[#3a0e23] outline-none focus:border-[#d3265b] focus:ring-2 focus:ring-[#d3265b]/20"
                />
                <p className="mt-2 text-sm text-[#92717a]">{description.length}/1000 chars</p>
                {!descriptionValid && description.length > 0 && (
                  <p className="mt-2 text-sm text-[#d3265b] font-bold">Please enter at least 10 characters.</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <p className="text-[32px] font-black text-[#3a0e23] uppercase mb-4">Category</p>
                  <div className="flex flex-wrap gap-3">
                    {categoryOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCategory(option)}
                        className={`rounded-full px-6 py-3 font-black uppercase tracking-[0.18em] transition ${
                          category === option
                            ? `${isDark ? 'text-black' : 'text-white'} bg-[#d3265b] ring-4 ring-[#d3265b]/25 scale-[1.03]`
                            : 'text-[#000000] bg-[#d8d8d8] hover:bg-[#c9c9c9]'
                        }`}
                      >
                        {option.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`text-[32px] font-black uppercase mb-4 ${isDark ? 'text-white' : 'text-[#3a0e23]'}`}>Shows per day</p>
                  <div className="space-y-4">
                    {showDays.length === 0 && (
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#92717a]'}`}>Choose event date range to configure show schedule.</p>
                    )}
                    {(() => {
                      let globalCounter = 0;
                      return showDays.map((day) => (
                        <div key={day.date} className="rounded-2xl border border-[#3a0e23]/20 bg-[#faf8f1] p-4 space-y-3">
                          <p className={`text-sm font-black uppercase tracking-[0.15em] ${isDark ? 'text-white' : 'text-[#3a0e23]'}`}>{formatDisplayDate(day.date)}</p>
                          {day.shows.map((show, idx) => {
                            globalCounter += 1;
                            const num = globalCounter;
                            const { hour, minute } = parseTime(show.startTime);
                            const durHours = Math.floor(show.durationMins / 60);
                            const durMins = show.durationMins % 60;
                            const endMins = toMinutes(show.startTime) + show.durationMins;
                            const endH = Math.floor(endMins / 60);
                            const endM = endMins % 60;
                            const pastMidnight = endMins > 1440;
                            const tooLong = show.durationMins > 720;
                            return (
                              <div key={idx} className={`rounded-xl border p-3 space-y-2 ${pastMidnight || tooLong ? 'border-[#d3265b] bg-[#fff0f2]' : 'border-[#3a0e23]/10 bg-white'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-black uppercase tracking-[0.18em] ${isDark ? 'text-white' : 'text-[#3a0e23]'}`}>Show {num}</span>
                                  <button type="button" onClick={() => removeShow(day.date, idx)} className="text-xs font-black text-[#d3265b] hover:text-[#b81d47] transition px-2">✕</button>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] ${isDark ? 'text-white' : 'text-[#3a0e23]/80'}`}>
                                    Start:
                                    <select value={hour} onChange={(e) => updateShowStart(day.date, idx, Number(e.target.value), minute)} className="rounded-lg border border-[#3a0e23]/20 bg-white px-2 py-1 text-sm font-bold text-[#3a0e23]">
                                      {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>)}
                                    </select>
                                    <span className={isDark ? 'text-white' : 'text-[#3a0e23]'}>:</span>
                                    <select value={minute} onChange={(e) => updateShowStart(day.date, idx, hour, Number(e.target.value))} className="rounded-lg border border-[#3a0e23]/20 bg-white px-2 py-1 text-sm font-bold text-[#3a0e23]">
                                      {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
                                    </select>
                                  </div>
                                  <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] ${isDark ? 'text-white' : 'text-[#3a0e23]/80'}`}>
                                    Duration:
                                    <select value={durHours} onChange={(e) => { const h = Number(e.target.value); updateShowDuration(day.date, idx, h * 60 + (h === 12 ? 0 : durMins)); }} className="rounded-lg border border-[#3a0e23]/20 bg-white px-2 py-1 text-sm font-bold text-[#3a0e23]">
                                      {Array.from({ length: 13 }, (_, h) => <option key={h} value={h}>{h}h</option>)}
                                    </select>
                                    <select value={durMins} onChange={(e) => updateShowDuration(day.date, idx, durHours * 60 + Number(e.target.value))} disabled={durHours === 12} className="rounded-lg border border-[#3a0e23]/20 bg-white px-2 py-1 text-sm font-bold text-[#3a0e23]">
                                      {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{m.toString().padStart(2, '0')}m</option>)}
                                    </select>
                                  </div>
                                  <span className={`text-xs font-bold ${pastMidnight ? 'text-[#d3265b]' : isDark ? 'text-white' : 'text-[#3a0e23]/70'}`}>
                                    Ends: {pastMidnight ? 'past midnight ✕' : `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`}
                                  </span>
                                </div>
                                {tooLong && <p className="text-xs font-bold text-[#d3265b]">Show cannot be longer than 12 hours.</p>}
                                {pastMidnight && !tooLong && <p className="text-xs font-bold text-[#d3265b]">Show cannot end past midnight.</p>}
                                {show.durationMins < 15 && !pastMidnight && !tooLong && <p className="text-xs font-bold text-[#d3265b]">Duration must be at least 15 minutes.</p>}
                              </div>
                            );
                          })}
                          <button type="button" onClick={() => addShow(day.date)} className={`w-full rounded-xl border-2 border-dashed py-2 text-sm font-black uppercase tracking-[0.14em] transition ${isDark ? 'border-white/30 text-white hover:border-white/60' : 'border-[#3a0e23]/20 text-[#3a0e23]/70 hover:border-[#d3265b] hover:text-[#d3265b]'}`}>
                            + Add Show
                          </button>
                        </div>
                      ));
                    })()}
                    {scheduleError && <p className="text-sm font-bold text-[#d3265b]">{scheduleError}</p>}
                    <p className={`text-xs font-bold uppercase tracking-[0.12em] ${isDark ? 'text-white' : 'text-[#92717a]'}`}>
                      At least one show required. Duration includes break. Max 12 hours. Cannot end past midnight.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[32px] font-black text-[#3a0e23] uppercase mb-4">Dates</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#3a0e23]/80">
                      From:
                              <input
                          type="date"
                          min={today}
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="rounded-2xl border border-[#3a0e23]/20 bg-[#faf8f1] px-4 py-3 text-base font-bold text-[#3a0e23] outline-none focus:border-[#d3265b] focus:ring-2 focus:ring-[#d3265b]/20"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#3a0e23]/80">
                        To:
                        <input
                          type="date"
                          min={today}
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="rounded-2xl border border-[#3a0e23]/20 bg-[#faf8f1] px-4 py-3 text-base font-bold text-[#3a0e23] outline-none focus:border-[#d3265b] focus:ring-2 focus:ring-[#d3265b]/20"
                        />
                      </label>
                    </div>
                    {!datesValid && (dateFrom || dateTo) && (
                      <p className="mt-3 text-sm text-[#d3265b] font-bold">Please select both dates and ensure the start date is not after the end date.</p>
                    )}
                  </div>
                </div>
            </div>
          </section>

          <aside className="rounded-[40px] border border-[#ff5b8d] bg-white p-10 shadow-xl flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[32px] font-black text-[#3a0e23] uppercase mb-6">Upload event image</p>
                <label className="group flex h-[280px] w-full cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#d3265b]/60 bg-[#fff0f2] p-8 text-center transition hover:border-[#d3265b] hover:bg-[#ffe8f0]">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Uploaded event" className="h-full w-full rounded-[26px] object-cover" />
                  ) : (
                    <>
                      <ImagePlus size={48} className="text-[#d3265b] mb-4" />
                      <span className="text-sm font-black uppercase tracking-[0.18em] text-[#3a0e23]">Click to upload or drag file here</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                </label>
                <p className="mt-4 text-sm text-[#3a0e23]/80">
                  {imageName ? `Uploaded: ${imageName}` : 'No image uploaded yet.'}
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={randomizeDebugEvent}
                className="mb-3 inline-flex w-full items-center justify-center rounded-full px-8 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#3a0e23] border-2 border-[#d3265b]/50 bg-[#f5f5dc] hover:bg-[#ffe8f0] transition"
              >
                RANDOMIZE (DEBUG)
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`inline-flex w-full items-center justify-center rounded-full px-8 py-5 text-lg font-black uppercase tracking-[0.18em] text-white shadow-lg transition ${
                  canSubmit ? 'bg-[#d3265b] hover:bg-[#b52453]' : 'bg-[#d3265b]/50 cursor-not-allowed'
                }`}
              >
                GO TO VENUE
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AddEvent;
