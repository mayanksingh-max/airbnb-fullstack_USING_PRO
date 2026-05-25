import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedProperties, getProperties } from '../services/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import { PropertyCardSkeleton } from '../components/property/PropertyGrid';
import { FiSearch, FiMapPin, FiCalendar, FiUsers, FiArrowRight } from 'react-icons/fi';
import {
  MdOutlineBeachAccess, MdOutlineVilla, MdOutlineCabin, MdOutlineApartment,
  MdOutlineLandscape, MdOutlineWater,
} from 'react-icons/md';
import { TbMountain, TbBuildingCastle } from 'react-icons/tb';

const CATEGORIES = [
  { id: '', label: 'All', icon: MdOutlineApartment },
  { id: 'beachfront', label: 'Beachfront', icon: MdOutlineBeachAccess },
  { id: 'mountain', label: 'Mountain', icon: TbMountain },
  { id: 'villa', label: 'Villas', icon: MdOutlineVilla },
  { id: 'cabin', label: 'Cabins', icon: MdOutlineCabin },
  { id: 'lake', label: 'Lakefront', icon: MdOutlineWater },
  { id: 'countryside', label: 'Countryside', icon: MdOutlineLandscape },
  { id: 'city', label: 'City', icon: TbBuildingCastle },
];

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [heroSearchInput, setHeroSearchInput] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [activeCategory]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = { limit: 12 };
      if (activeCategory) params.category = activeCategory;
      const { data } = await getProperties(params);
      setProperties(data.properties || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      navigate(`/search?location=${encodeURIComponent(heroSearchInput.trim())}`);
    }
  };

  const HOW_IT_WORKS = [
    {
      step: '01',
      title: 'Search Your Destination',
      desc: 'Browse thousands of unique properties across the globe filtered to your preferences.',
      emoji: '🔍',
    },
    {
      step: '02',
      title: 'Book Instantly',
      desc: 'Select your dates, configure guests, and confirm your booking with one click.',
      emoji: '📅',
    },
    {
      step: '03',
      title: 'Enjoy Your Stay',
      desc: 'Arrive at your dream accommodation and experience travel like never before.',
      emoji: '🏡',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl" />
        </div>

        <div className="container-custom relative z-10 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Over 50,000+ properties worldwide
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-white mb-6 animate-slide-up leading-tight">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-primary-400 to-orange-400 bg-clip-text text-transparent">
              Getaway
            </span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-fade-in">
            Discover unique stays, from cozy cabins to luxury villas. Your next adventure starts here.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="glass rounded-2xl p-2 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 animate-slide-up shadow-2xl"
          >
            <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-white">
              <FiMapPin className="text-primary-500 flex-shrink-0 text-xl" />
              <input
                type="text"
                placeholder="Where do you want to go?"
                className="flex-1 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-sm"
                value={heroSearchInput}
                onChange={(e) => setHeroSearchInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-xl airbnb-gradient"
            >
              <FiSearch className="text-lg" />
              <span>Search</span>
            </button>
          </form>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in">
            {[
              { label: 'Properties', value: '50K+' },
              { label: 'Countries', value: '120+' },
              { label: 'Happy Guests', value: '2M+' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-white font-display">{value}</div>
                <div className="text-white/60 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 border-2 ${
                  activeCategory === id
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="text-xl" />
                <span className="text-xs font-medium whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-custom py-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-gray-900">
              {activeCategory
                ? `${CATEGORIES.find((c) => c.id === activeCategory)?.label} Properties`
                : 'Featured Stays'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Hand-picked properties for unforgettable experiences</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-1 text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors"
          >
            View all <FiArrowRight />
          </button>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-500">Be the first to list a property in this category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}

        {/* How It Works */}
        <section className="mt-20 mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-3">How StayHub Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Your perfect stay is just three simple steps away
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, emoji }) => (
              <div
                key={step}
                className="relative text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-primary-200 hover:shadow-card transition-all duration-300 group"
              >
                <div className="text-5xl mb-4">{emoji}</div>
                <div className="text-xs font-bold text-primary-500 tracking-widest uppercase mb-2">{step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="my-16 rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #FF385C 0%, #FC642D 100%)' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-14">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">
                Own a property?<br />Start earning today!
              </h2>
              <p className="text-white/80 text-lg max-w-md">
                Join thousands of hosts who earn extra income by listing their space on StayHub.
              </p>
            </div>
            <button
              onClick={() => navigate('/add-property')}
              className="flex-shrink-0 bg-white text-primary-600 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-lg shadow-xl"
            >
              List Your Property
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
