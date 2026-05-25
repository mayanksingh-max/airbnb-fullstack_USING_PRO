import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  FiUsers, FiHome, FiCalendar, FiTrendingUp, FiShield, FiStar,
  FiEdit2, FiTrash2, FiChevronRight, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'properties') fetchProperties();
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data.stats);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users', { params: { limit: 50 } });
      setUsers(data.users || []);
    } catch { }
  };

  const fetchProperties = async () => {
    try {
      const { data } = await API.get('/admin/properties', { params: { limit: 50 } });
      setProperties(data.properties || []);
    } catch { }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/admin/bookings', { params: { limit: 50 } });
      setBookings(data.bookings || []);
    } catch { }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await API.put(`/admin/users/${userId}`, { role });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
      toast.success('User role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const toggleFeatured = async (propertyId) => {
    try {
      const { data } = await API.put(`/admin/properties/${propertyId}/feature`);
      setProperties((prev) => prev.map((p) => p._id === propertyId ? { ...p, isFeatured: data.property.isFeatured } : p));
      toast.success(data.property.isFeatured ? 'Property featured!' : 'Removed from featured');
    } catch { toast.error('Failed to toggle featured'); }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'properties', label: 'Properties', icon: FiHome },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar },
  ];

  const STAT_CARDS = stats ? [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString(), icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Properties', value: stats.totalProperties?.toLocaleString(), icon: FiHome, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Bookings', value: stats.totalBookings?.toLocaleString(), icon: FiCalendar, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: FiTrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <FiShield className="text-primary-500 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage users, properties, and bookings</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={activeTab === id ? 'text-primary-500' : 'text-gray-400'} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)
                  ) : (
                    STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className="bg-white rounded-2xl shadow-card p-5">
                        <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                          <Icon />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent Bookings */}
                {stats?.recentBookings?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Recent Bookings</h3>
                      <button onClick={() => setActiveTab('bookings')} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        View all <FiChevronRight />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {stats.recentBookings.map((booking) => (
                        <div key={booking._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.guest?.name}</p>
                            <p className="text-xs text-gray-500">{booking.property?.title}</p>
                          </div>
                          <span className={`badge text-xs ${booking.status === 'confirmed' ? 'badge-success' : booking.status === 'cancelled' ? 'badge-error' : 'badge-info'}`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Users */}
                {stats?.recentUsers?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">New Users</h3>
                      <button onClick={() => setActiveTab('users')} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        View all <FiChevronRight />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {stats.recentUsers.map((u) => (
                        <div key={u._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                          <img src={u.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                            alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                          <span className={`badge text-xs capitalize ${u.role === 'admin' ? 'badge-error' : u.role === 'host' ? 'badge-info' : 'badge-success'}`}>
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Users ({users.length})</h2>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                          <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={u.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                                  alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                  <p className="text-xs text-gray-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <select
                                value={u.role}
                                onChange={(e) => updateUserRole(u._id, e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 cursor-pointer focus:outline-none focus:border-primary-400"
                              >
                                <option value="user">User</option>
                                <option value="host">Host</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => deleteUser(u._id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                <FiTrash2 className="text-sm" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Properties */}
            {activeTab === 'properties' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Properties ({properties.length})</h2>
                <div className="space-y-3">
                  {properties.map((p) => (
                    <div key={p._id} className="bg-white rounded-2xl shadow-card p-4 flex gap-4 hover:shadow-card-hover transition-shadow">
                      <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200'}
                        alt={p.title} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link to={`/properties/${p._id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 text-sm">
                          {p.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{p.location?.city}, {p.location?.country}</span>
                          <span>·</span>
                          <span>${p.pricePerNight}/night</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <FiStar className="text-yellow-400" /> {p.ratings?.toFixed(1) || '0'} ({p.reviewCount || 0})
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Host: {p.host?.name}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => toggleFeatured(p._id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                            p.isFeatured ? 'border-yellow-300 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-600 hover:border-yellow-300 hover:bg-yellow-50'
                          }`}
                        >
                          {p.isFeatured ? '⭐ Featured' : 'Feature'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings */}
            {activeTab === 'bookings' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Bookings ({bookings.length})</h2>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Property</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Dates</th>
                          <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings.map((b) => (
                          <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <img src={b.guest?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.guest?.name}`}
                                  alt="" className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{b.guest?.name}</p>
                                  <p className="text-xs text-gray-400 hidden md:block">{b.guest?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell line-clamp-1 max-w-[180px]">
                              {b.property?.title}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                              {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-sm text-gray-900">
                              ${b.pricing?.totalPrice?.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`badge text-xs ${b.status === 'confirmed' ? 'badge-success' : b.status === 'cancelled' ? 'badge-error' : b.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
