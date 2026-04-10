import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HostOnboarding = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const randomizeOnboarding = () => {
    const token = Math.floor(1000 + Math.random() * 9000);
    setCompanyName(`Demo Company ${token}`);
    setNip(`${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setAddress(`Main Street ${Math.floor(1 + Math.random() * 220)}, Warsaw`);
    setError('');
  };

  const handleContinue = () => {
    setError('');
    if (!companyName.trim() || !nip.trim() || !address.trim()) {
      setError('Please fill in company name, NIP and address.');
      return;
    }

    if (!/^\d{10}$/.test(nip)) {
      setError('NIP must have exactly 10 digits.');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = {
      ...currentUser,
      accountType: 'host',
      companyName,
      nip,
      address,
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const idx = users.findIndex((u: any) => u.email === updatedUser.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updatedUser };
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    navigate('/host-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans text-[#1a0b1a]">
      <main className="max-w-[900px] mx-auto px-6 py-10">
        <h1 className="text-5xl font-black text-[#d3265b] tracking-tight mb-6">Host Account Setup</h1>
        <section className="rounded-3xl border-2 border-[#ff5b8d] bg-white p-8 shadow-xl space-y-5">
          <p className="text-[#3a0e23] font-semibold">Complete company details to access host tools.</p>

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
            className="w-full rounded-xl border border-[#3a0e23]/20 bg-[#faf8f1] px-4 py-3 text-[#3a0e23] font-semibold"
          />

          <input
            type="text"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="NIP (10 digits)"
            className="w-full rounded-xl border border-[#3a0e23]/20 bg-[#faf8f1] px-4 py-3 text-[#3a0e23] font-semibold"
          />

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Company address"
            className="w-full rounded-xl border border-[#3a0e23]/20 bg-[#faf8f1] px-4 py-3 text-[#3a0e23] font-semibold"
          />

          {error && <p className="text-sm font-bold text-[#d3265b]">{error}</p>}

          <button
            type="button"
            onClick={randomizeOnboarding}
            className="w-full rounded-full border-2 border-[#d3265b]/40 bg-[#f5f5dc] px-6 py-3 text-[#3a0e23] font-black uppercase tracking-[0.14em]"
          >
            Randomize (Debug)
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-full bg-[#d3265b] px-6 py-4 text-white font-black uppercase tracking-[0.14em]"
          >
            Continue to Host Dashboard
          </button>
        </section>
      </main>
    </div>
  );
};

export default HostOnboarding;
