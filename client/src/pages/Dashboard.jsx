import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyListings, deleteProperty } from '../services/propertyService';
import { getHostBookings } from '../services/bookingService';
import { updateProfile } from '../services/authService';
import { FiUser, FiHome, FiCalendar, FiEdit2, FiTrash2, FiPlus, FiStar, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (activeTab === 'listings') fetchListings();
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data } = await getMyListings();
      setListings(data.properties || []);
    } catch { setListings([]); }
    finally { setLoading(false); }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await getHostBookings();
      setBookings(data.bookings || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Delete this property? This action cannot be undone.')) return;
    try {
      await deleteProperty(id);
      setListings((prev) => prev.filter((p) => p._id !== id));
      toast.success('Property deleted');
    } catch {
      toast.error('Failed to delete property');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const { data } = await updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'listings', label: 'My Listings', icon: FiHome },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar },
    { id: 'profile', label: 'Edit Profile', icon: FiEdit2 },
  ];

  const statusColors = {
    confirmed: 'badge-success',
    pending: 'badge-warning',
    cancelled: 'badge-error',
    completed: 'badge-info',
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src={user?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-card"
          />
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 text-sm capitalize">{user?.role} · Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={activeTab === id ? 'text-primary-500' : 'text-gray-400'} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-in">
                {[
                  { label: 'My Listings', value: listings.length || '-', icon: FiHome, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Total Bookings', value: bookings.length || '-', icon: FiCalendar, color: 'text-green-500', bg: 'bg-green-50' },
                  { label: 'Account Type', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1), icon: FiUser, color: 'text-primary-500', bg: 'bg-primary-50' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl p-6 shadow-card">
                    <div className={`${bg} ${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="text-xl" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                ))}

                <div className="sm:col-span-3 bg-white rounded-2xl p-6 shadow-card">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/add-property" className="flex items-center gap-2 btn-primary py-2 px-4 text-sm">
                      <FiPlus /> Add Property
                    </Link>
                    <Link to="/search" className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm">
                      <FiHome /> Browse Properties
                    </Link>
                    <Link to="/bookings" className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm">
                      <FiCalendar /> View Bookings
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm">
                      ❤️ Saved Places
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Listings */}
            {activeTab === 'listings' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
                  <Link to="/add-property" className="flex items-center gap-2 btn-primary py-2 px-4 text-sm">
                    <FiPlus /> Add Property
                  </Link>
                </div>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 shadow-card animate-pulse">
                        <div className="flex gap-4">
                          <div className="skeleton w-24 h-20 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-1/2 rounded" />
                            <div className="skeleton h-3 w-1/3 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : listings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-card text-center">
                    <div className="text-5xl mb-4">🏠</div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No listings yet</h3>
                    <p className="text-gray-500 mb-6">Start earning by listing your property!</p>
                    <Link to="/add-property" className="btn-primary">Add Your First Property</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map((property) => (
                      <div key={property._id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-4 flex gap-4">
                        <img
                          src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200'}
                          alt={property.title}
                          className="w-24 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link to={`/properties/${property._id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
                                {property.title}
                              </Link>
                              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <FiMapPin className="text-xs" />
                                {property.location?.city}, {property.location?.country}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`badge ${property.isAvailable ? 'badge-success' : 'badge-error'} text-xs`}>
                                {property.isAvailable ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-bold text-gray-900">${property.pricePerNight}/night</span>
                            {property.ratings > 0 && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <FiStar className="text-yellow-400" /> {property.ratings.toFixed(1)} ({property.reviewCount})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button onClick={() => navigate(`/edit-property/${property._id}`)}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-primary-200 transition-all">
                            <FiEdit2 /> Edit
                          </button>
                          <button onClick={() => handleDeleteProperty(property._id)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings */}
            {activeTab === 'bookings' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Property Bookings</h2>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-card text-center">
                    <div className="text-5xl mb-4">📅</div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No bookings yet</h3>
                    <p className="text-gray-500">When guests book your properties, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="bg-white rounded-2xl shadow-card p-4 hover:shadow-card-hover transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={booking.guest?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.guest?.name}`}
                              alt={booking.guest?.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{booking.guest?.name}</p>
                              <p className="text-xs text-gray-500">{booking.property?.title}</p>
                            </div>
                          </div>
                          <span className={`badge ${statusColors[booking.status] || 'badge-info'} text-xs flex-shrink-0`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 border-t border-gray-50 pt-3">
                          <span>📅 {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</span>
                          <span>👥 {(booking.guests?.adults || 1) + (booking.guests?.children || 0)} guests</span>
                          <span className="font-semibold text-gray-900">${booking.pricing?.totalPrice?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Edit */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="input-field"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        className="input-field resize-none h-24"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                        placeholder="Tell others a bit about yourself..."
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-400 mt-1">{profileForm.bio.length}/500</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={savingProfile} className="btn-primary py-3 px-8">
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => navigate('/bookings')} className="btn-secondary py-3 px-6">
                        View My Bookings
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
