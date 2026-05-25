import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { FiCalendar, FiMapPin, FiClock, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  confirmed: { color: 'badge-success', label: 'Confirmed', emoji: '✅' },
  pending: { color: 'badge-warning', label: 'Pending', emoji: '⏳' },
  cancelled: { color: 'badge-error', label: 'Cancelled', emoji: '❌' },
  completed: { color: 'badge-info', label: 'Completed', emoji: '🏁' },
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [activeStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = activeStatus ? { status: activeStatus } : {};
      const { data } = await getMyBookings(params);
      setBookings(data.bookings || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking? This may be subject to cancellation fees.')) return;
    try {
      setCancelling(bookingId);
      await cancelBooking(bookingId, 'Cancelled by guest');
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const calcNights = (checkIn, checkOut) => Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-500">Manage and track all your reservations</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {['', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                activeStatus === status
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status ? STATUS_CONFIG[status]?.label : 'All Bookings'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="skeleton w-32 h-28 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="skeleton h-5 w-1/2 rounded" />
                    <div className="skeleton h-4 w-1/3 rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-16 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start exploring and book your dream stay!</p>
            <Link to="/search" className="btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const nights = calcNights(booking.checkIn, booking.checkOut);
              const property = booking.property;
              const canCancel = ['confirmed', 'pending'].includes(booking.status);

              return (
                <div key={booking._id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Property Image */}
                    <div className="sm:w-36 h-36 sm:h-auto flex-shrink-0 relative">
                      <img
                        src={property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300'}
                        alt={property?.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`badge ${statusInfo.color} text-xs`}>
                          {statusInfo.emoji} {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              to={`/properties/${property?._id}`}
                              className="font-bold text-gray-900 hover:text-primary-600 transition-colors"
                            >
                              {property?.title}
                            </Link>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <FiMapPin className="text-xs" />
                              {property?.location?.city}, {property?.location?.country}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg text-gray-900">${booking.pricing?.totalPrice?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{nights} night{nights !== 1 ? 's' : ''}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="text-primary-400" />
                            <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>👥 {(booking.guests?.adults || 1) + (booking.guests?.children || 0)} guests</span>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                          <span>${booking.pricing?.pricePerNight}/night × {booking.pricing?.nights} nights = ${booking.pricing?.subtotal?.toLocaleString()}</span>
                          {booking.pricing?.cleaningFee > 0 && <span>+ ${booking.pricing.cleaningFee} cleaning</span>}
                          <span>+ ${booking.pricing?.serviceFee?.toLocaleString()} service fee</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <p className="text-xs text-gray-400">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Link
                            to={`/properties/${property?._id}`}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all"
                          >
                            View Property
                          </Link>
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              disabled={cancelling === booking._id}
                              className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                              <FiX />
                              {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
