import Navbar from '../components/layout/Navbar';

const CompanyProfile = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const companyName = currentUser.companyName || 'Demo Company';

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans text-[#1a0b1a]">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName={companyName} />
      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <h1 className="text-5xl font-black text-[#d3265b] tracking-tight mb-6">Company Profile</h1>
        <section className="rounded-3xl border-2 border-[#ff5b8d] bg-white p-8 shadow-xl">
          <p className="text-xl font-bold text-[#3a0e23] mb-2">Host company profile</p>
          <p className="text-[#3a0e23]/80 mb-6">This section is not fully implemented yet.</p>
          <div className="space-y-2 text-[#3a0e23] font-semibold">
            <p>Company: {companyName}</p>
            <p>NIP: {currentUser.nip || 'Not provided yet'}</p>
            <p>Contact email: {currentUser.email || 'host@getaroom.com'}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CompanyProfile;
