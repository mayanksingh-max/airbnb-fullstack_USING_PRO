import { useState } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiUsers, FiCalendar, FiMinus, FiPlus } from 'react-icons/fi';
import { createBooking } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BookingWidget = ({ property }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const nights = checkIn && checkOut
    ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    : 0;

  const subtotal = nights * (property.pricePerNight || 0);
  const cleaningFee = property.cleaningFee || 0;
  const serviceFee = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + cleaningFee + serviceFee;

  const totalGuests = guests.adults + guests.children;

  const updateGuests = (type, delta) => {
    setGuests((prev) => {
      const newVal = Math.max(type === 'adults' ? 1 : 0, prev[type] + delta);
      const newTotal = (type === 'adults' ? newVal : prev.adults) + (type === 'children' ? newVal : prev.children);
      if (newTotal > property.maxGuests) return prev;
      return { ...prev, [type]: newVal };
    });
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to make a booking');
      navigate('/login');
      return;
    }

    if (property.host?._id === user?._id || property.host === user?._id) {
      toast.error("You can't book your own property");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (nights < 1) {
      toast.error('Minimum stay is 1 night');
      return;
    }

    try {
      setLoading(true);
      const { data } = await createBooking({
        propertyId: property._id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests,
      });
      toast.success('Booking confirmed! 🎉');
      navigate(`/bookings/${data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 sticky top-24 border border-gray-200">
      {/* Price Header */}
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-2xl font-bold text-gray-900">
          ${property.pricePerNight?.toLocaleString()}
        </span>
        <span className="text-gray-500">/ night</span>
        {property.ratings > 0 && (
          <div className="ml-auto flex items-center gap-1 text-sm">
            <span>⭐</span>
            <span className="font-semibold">{property.ratings.toFixed(1)}</span>
            <span className="text-gray-400">({property.reviewCount} reviews)</span>
          </div>
        )}
      </div>

      {/* Date Pickers */}
      <div className="border border-gray-300 rounded-xl overflow-hidden mb-3">
        <div className="grid grid-cols-2 divide-x divide-gray-300">
          <div className="p-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Check-in</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (checkOut && date >= checkOut) setCheckOut(null);
              }}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              placeholderText="Add date"
              className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent cursor-pointer outline-none"
              dateFormat="MMM d"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Check-out</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
              placeholderText="Add date"
              className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent cursor-pointer outline-none"
              dateFormat="MMM d"
            />
          </div>
        </div>

        {/* Guests */}
        <div
          className="border-t border-gray-300 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowGuestPicker(!showGuestPicker)}
        >
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Guests</label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
              {guests.infants > 0 && `, ${guests.infants} infant${guests.infants !== 1 ? 's' : ''}`}
            </span>
            <FiUsers className="text-gray-400" />
          </div>
        </div>

        {/* Guest Picker Dropdown */}
        {showGuestPicker && (
          <div className="border-t border-gray-300 p-4 bg-white space-y-4 animate-fade-in">
            {[
              { type: 'adults', label: 'Adults', desc: 'Ages 13 or above' },
              { type: 'children', label: 'Children', desc: 'Ages 2–12' },
              { type: 'infants', label: 'Infants', desc: 'Under 2' },
            ].map(({ type, label, desc }) => (
              <div key={type} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateGuests(type, -1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    disabled={guests[type] <= (type === 'adults' ? 1 : 0)}
                  >
                    <FiMinus className="text-sm" />
                  </button>
                  <span className="w-5 text-center font-medium">{guests[type]}</span>
                  <button
                    onClick={() => updateGuests(type, 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    disabled={totalGuests >= property.maxGuests && type !== 'infants'}
                  >
                    <FiPlus className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500">Maximum {property.maxGuests} guests allowed</p>
          </div>
        )}
      </div>

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full btn-primary py-4 text-base font-semibold rounded-xl airbnb-gradient hover:opacity-90 transition-opacity"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Booking...
          </span>
        ) : nights > 0 ? (
          `Reserve — ${nights} night${nights !== 1 ? 's' : ''}`
        ) : (
          'Check availability'
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-2">You won't be charged yet</p>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-sm text-gray-700">
            <span>${property.pricePerNight?.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          {cleaningFee > 0 && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Cleaning fee</span>
              <span>${cleaningFee}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-700">
            <span>Service fee</span>
            <span>${serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3 mt-3">
            <span>Total</span>
            <span>${totalPrice.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
