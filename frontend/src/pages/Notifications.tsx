import Navbar from '../components/layout/Navbar';

const Notifications = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isHost = currentUser.accountType === 'host' || currentUser.email === 'host@getaroom.com';

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans text-[#1a0b1a]">
      <Navbar hideTicketsLink={isHost} logoLink={isHost ? '/host-dashboard' : '/home'} userName={currentUser.firstName || currentUser.companyName || 'John'} />
      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <h1 className="text-5xl font-black text-[#d3265b] tracking-tight mb-6">Notifications</h1>
        <section className="rounded-3xl border-2 border-[#ff5b8d] bg-white p-8 shadow-xl">
          <p className="text-xl font-bold text-[#3a0e23]">Notifications page is not implemented yet.</p>
        </section>
      </main>
    </div>
  );
};

export default Notifications;
