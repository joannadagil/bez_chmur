import Navbar from '../components/layout/Navbar';

const CustomerProfile = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans text-[#1a0b1a]">
      <Navbar userName={currentUser.firstName || 'John'} />
      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <h1 className="text-5xl font-black text-[#d3265b] tracking-tight mb-6">My Profile</h1>
        <section className="rounded-3xl border-2 border-[#ff5b8d] bg-white p-8 shadow-xl">
          <p className="text-xl font-bold text-[#3a0e23] mb-2">Customer profile page</p>
          <p className="text-[#3a0e23]/80">This area is not fully implemented yet. Basic account details are shown for now.</p>
          <div className="mt-6 space-y-2 text-[#3a0e23] font-semibold">
            <p>Name: {(currentUser.firstName || 'John')} {(currentUser.lastName || 'Doe')}</p>
            <p>Email: {currentUser.email || 'john.doe@example.com'}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerProfile;
