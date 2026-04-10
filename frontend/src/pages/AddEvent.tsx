import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Navbar from '../components/layout/Navbar';
import { ImagePlus } from 'lucide-react';

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

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const today = new Date().toISOString().split('T')[0];

  const categoryOptions = ['Cinema', 'Theatre', 'Lecture Hall'];
  const debugImages = [
    'https://www.superherotoystore.com/cdn/shop/articles/dune-part-two-2024-5k-rl-3840x2400_1600x.jpg?v=1709290352',
    'https://beetlejuicethemusical.com.au/wp-content/uploads/2025/06/beetlejuice-title.jpg',
    'https://aws-tiqets-cdn.imgix.net/images/content/af800c2a213a46b28e696d9efae8fcba.jpg?auto=format%2Ccompress&fit=crop&q=70&w=600&s=61daa83f62dc8edda6220caaa0ea0639',
  ];

  const nameValid = name.trim().length >= 10;
  const descriptionValid = description.trim().length >= 10;
  const datesValid = Boolean(dateFrom && dateTo && dateFrom < dateTo);
  const imageValid = Boolean(imagePreview);
  const canSubmit = nameValid && descriptionValid && datesValid && category && imageValid;

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

    setName(randomTitle);
    setDescription(randomDescription);
    setCategory(randomCategory);
    setDateFrom(startDate.toISOString().split('T')[0]);
    setDateTo(endDate.toISOString().split('T')[0]);
    setImageName('debug-poster.jpg');
    setImagePreview(randomImage);
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
    updateBooking({
      eventTitle: name,
      eventCategory: category,
      date: dateFrom,
      dateTo,
      time: '',
    });
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
                            ? 'bg-[#d3265b] text-white ring-4 ring-[#d3265b]/25 scale-[1.03]'
                            : 'bg-[#d8d8d8] text-[#3a0e23] hover:bg-[#c9c9c9]'
                        }`}
                      >
                        {option.toUpperCase()}
                      </button>
                    ))}
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
                      <p className="mt-3 text-sm text-[#d3265b] font-bold">Please select both dates and ensure the start date is before the end date.</p>
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
