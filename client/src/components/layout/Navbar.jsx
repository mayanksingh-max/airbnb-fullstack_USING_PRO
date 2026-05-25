import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiSearch, FiMenu, FiX, FiUser, FiHome, FiHeart, FiCalendar,
  FiLogOut, FiSettings, FiShield, FiPlus,
} from 'react-icons/fi';
import { HiOutlineGlobeAlt } from 'react-icons/hi';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isHost, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?location=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileSearch(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'bg-white shadow-navbar border-b border-gray-100'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl airbnb-gradient flex items-center justify-center">
              <FiHome className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold font-display text-primary-500 hidden sm:block">StayHub</span>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-card transition-shadow duration-200 px-4 py-2 gap-3 flex-1 max-w-lg mx-8"
          >
            <FiSearch className="text-gray-400 text-lg flex-shrink-0" />
            <input
              type="text"
              placeholder="Search destinations..."
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-primary-500 text-white rounded-full p-1.5 hover:bg-primary-600 transition-colors">
              <FiSearch className="text-sm" />
            </button>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearch(!mobileSearch)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <FiSearch className="text-xl text-gray-700" />
            </button>

            {/* Become a Host */}
            {isAuthenticated && !isHost && (
              <Link
                to="/add-property"
                className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-full transition-all"
              >
                <FiPlus className="text-sm" />
                Become a Host
              </Link>
            )}

            <HiOutlineGlobeAlt className="hidden lg:block text-xl text-gray-600 cursor-pointer hover:text-gray-900" />

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-card transition-all duration-200 bg-white"
                aria-label="User menu"
              >
                <FiMenu className="text-gray-600" />
                {isAuthenticated && user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-2 animate-fade-in z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiUser className="text-gray-500" /> Profile & Dashboard
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiCalendar className="text-gray-500" /> My Bookings
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiHeart className="text-gray-500" /> Saved Places
                      </Link>
                      {isHost && (
                        <Link
                          to="/add-property"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiPlus className="text-gray-500" /> Add Property
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiShield className="text-gray-500" /> Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => { logoutUser(); setMenuOpen(false); navigate('/'); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <FiLogOut /> Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearch && (
          <div className="md:hidden pb-4 animate-fade-in">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Where are you going?"
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" onClick={() => setMobileSearch(false)}>
                <FiX className="text-gray-400 hover:text-gray-700" />
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
