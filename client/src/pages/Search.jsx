import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProperties } from '../services/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import { PropertyCardSkeleton } from '../components/property/PropertyGrid';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const CATEGORIES = ['apartment', 'house', 'villa', 'cabin', 'beachfront', 'mountain', 'lake', 'desert', 'city', 'countryside'];

const AMENITIES_LIST = [
  { id: 'wifi', label: 'Wifi' },
  { id: 'pool', label: 'Pool' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'parking', label: 'Free parking' },
  { id: 'pet_friendly', label: 'Pets allowed' },
  { id: 'air_conditioning', label: 'Air conditioning' },
  { id: 'hot_tub', label: 'Hot tub' },
  { id: 'gym', label: 'Gym' },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    guests: searchParams.get('guests') || '',
    sort: searchParams.get('sort') || '-createdAt',
  });

  const [searchInput, setSearchInput] = useState(filters.location);

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 12 };
      if (filters.location) params.location = filters.location;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.guests) params.guests = filters.guests;
      if (filters.sort) params.sort = filters.sort;

      const { data } = await getProperties(params);
      setProperties(data.properties || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, location: searchInput }));
    setCurrentPage(1);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ location: '', category: '', minPrice: '', maxPrice: '', minRating: '', guests: '', sort: '-createdAt' });
    setSearchInput('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.minRating || filters.guests;

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Search Bar Header */}
      <div className="bg-white border-b border-gray-200 py-4 sticky top-16 lg:top-20 z-30">
        <div className="container-custom flex flex-col sm:flex-row gap-3 items-center">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-50 transition-all">
            <FiSearch className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by location..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); updateFilter('location', ''); }}>
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </form>

          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-primary-400"
            >
              <option value="-createdAt">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              hasActiveFilters
                ? 'border-primary-500 bg-primary-50 text-primary-600'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiFilter />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="container-custom mt-4 pb-4 animate-fade-in">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          filters.category === cat
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Price per Night</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min $"
                      className="input-field py-2 text-sm"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="number"
                      placeholder="Max $"
                      className="input-field py-2 text-sm"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Min Rating</label>
                  <div className="flex gap-2">
                    {[3, 3.5, 4, 4.5, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => updateFilter('minRating', filters.minRating === String(r) ? '' : String(r))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          filters.minRating === String(r)
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {r}⭐
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Guests</label>
                  <input
                    type="number"
                    placeholder="Number of guests"
                    min="1"
                    className="input-field py-2 text-sm"
                    value={filters.guests}
                    onChange={(e) => updateFilter('guests', e.target.value)}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button onClick={clearFilters} className="text-sm font-semibold text-primary-600 underline hover:text-primary-700 transition-colors">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? 'Searching...' : `${total.toLocaleString()} property${total !== 1 ? 'ies' : 'y'} found`}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or searching a different location</p>
            <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
