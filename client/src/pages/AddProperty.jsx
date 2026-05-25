import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../services/propertyService';
import { FiUpload, FiX, FiMapPin, FiDollarSign, FiUsers, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = ['apartment', 'house', 'villa', 'cabin', 'beachfront', 'mountain', 'lake', 'desert', 'city', 'countryside'];
const AMENITIES = [
  { id: 'wifi', label: '📶 Wifi' }, { id: 'pool', label: '🏊 Pool' },
  { id: 'kitchen', label: '🍳 Kitchen' }, { id: 'parking', label: '🅿️ Parking' },
  { id: 'tv', label: '📺 TV' }, { id: 'air_conditioning', label: '❄️ AC' },
  { id: 'heating', label: '🔥 Heating' }, { id: 'washer', label: '🌀 Washer' },
  { id: 'fireplace', label: '🔥 Fireplace' }, { id: 'pet_friendly', label: '🐾 Pets' },
  { id: 'hot_tub', label: '🛁 Hot Tub' }, { id: 'bbq_grill', label: '🍖 BBQ' },
  { id: 'gym', label: '💪 Gym' }, { id: 'workspace', label: '💼 Workspace' },
  { id: 'balcony', label: '🌇 Balcony' }, { id: 'garden', label: '🌿 Garden' },
];

const STEPS = ['Basic Info', 'Location', 'Details', 'Photos & Submit'];

const AddProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', category: 'apartment',
    address: '', city: '', state: '', country: '', zipCode: '',
    pricePerNight: '', cleaningFee: '', maxGuests: '', bedrooms: '', bathrooms: '', beds: '',
    amenities: [],
  });

  const updateForm = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toggleAmenity = (id) => {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(id)
        ? p.amenities.filter((a) => a !== id)
        : [...p.amenities, id],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    const newFiles = [...imageFiles, ...files];
    const newPreviews = [...imagePreviews, ...files.map((f) => URL.createObjectURL(f))];
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) { toast.error('Title is required'); return false; }
      if (!form.description.trim()) { toast.error('Description is required'); return false; }
      if (!form.category) { toast.error('Please select a category'); return false; }
    }
    if (step === 1) {
      if (!form.address.trim()) { toast.error('Address is required'); return false; }
      if (!form.city.trim()) { toast.error('City is required'); return false; }
      if (!form.country.trim()) { toast.error('Country is required'); return false; }
    }
    if (step === 2) {
      if (!form.pricePerNight) { toast.error('Price per night is required'); return false; }
      if (!form.maxGuests) { toast.error('Max guests is required'); return false; }
      if (!form.bedrooms) { toast.error('Number of bedrooms is required'); return false; }
      if (!form.bathrooms) { toast.error('Number of bathrooms is required'); return false; }
    }
    if (step === 3) {
      if (imageFiles.length === 0) { toast.error('Please upload at least one photo'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('location', JSON.stringify({
        address: form.address, city: form.city, state: form.state,
        country: form.country, zipCode: form.zipCode,
      }));
      formData.append('pricePerNight', form.pricePerNight);
      formData.append('cleaningFee', form.cleaningFee || '0');
      formData.append('maxGuests', form.maxGuests);
      formData.append('bedrooms', form.bedrooms);
      formData.append('bathrooms', form.bathrooms);
      formData.append('beds', form.beds || form.bedrooms);
      formData.append('amenities', JSON.stringify(form.amenities));
      imageFiles.forEach((file) => formData.append('images', file));

      const { data } = await createProperty(formData);
      toast.success('Property listed successfully! 🎉');
      navigate(`/properties/${data.property._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">List Your Property</h1>
          <p className="text-gray-500">Fill in the details to list your space on StayHub</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i === step ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded transition-colors ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Step 0 — Basic Info */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                <input type="text" className="input-field" placeholder="e.g. Cozy Beach House with Ocean View"
                  value={form.title} onChange={(e) => updateForm('title', e.target.value)} maxLength={100} />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea className="input-field resize-none h-32" placeholder="Describe your property, what makes it special..."
                  value={form.description} onChange={(e) => updateForm('description', e.target.value)} maxLength={2000} />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => updateForm('category', cat)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                        form.category === cat ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >{cat}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Location */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input type="text" className="input-field" placeholder="123 Ocean Drive"
                  value={form.address} onChange={(e) => updateForm('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input type="text" className="input-field" placeholder="Miami"
                    value={form.city} onChange={(e) => updateForm('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  <input type="text" className="input-field" placeholder="Florida"
                    value={form.state} onChange={(e) => updateForm('state', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input type="text" className="input-field" placeholder="United States"
                    value={form.country} onChange={(e) => updateForm('country', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                  <input type="text" className="input-field" placeholder="33139"
                    value={form.zipCode} onChange={(e) => updateForm('zipCode', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night ($) *</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" className="input-field pl-8" placeholder="150" min="1"
                      value={form.pricePerNight} onChange={(e) => updateForm('pricePerNight', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Fee ($)</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" className="input-field pl-8" placeholder="50" min="0"
                      value={form.cleaningFee} onChange={(e) => updateForm('cleaningFee', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { key: 'maxGuests', label: 'Max Guests', icon: '👥', min: 1 },
                  { key: 'bedrooms', label: 'Bedrooms', icon: '🛏️', min: 0 },
                  { key: 'beds', label: 'Beds', icon: '🛏️', min: 1 },
                  { key: 'bathrooms', label: 'Bathrooms', icon: '🚿', min: 0 },
                ].map(({ key, label, icon, min }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{icon} {label} *</label>
                    <input type="number" className="input-field" placeholder="1" min={min}
                      value={form[key]} onChange={(e) => updateForm(key, e.target.value)} />
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMENITIES.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleAmenity(id)}
                      className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all text-left ${
                        form.amenities.includes(id) ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Photos */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Photos</h2>
              <p className="text-sm text-gray-500">Upload at least 1 photo (max 10). First photo will be the cover image.</p>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group"
              >
                <FiUpload className="mx-auto text-4xl text-gray-400 group-hover:text-primary-500 transition-colors mb-3" />
                <p className="font-medium text-gray-700 group-hover:text-primary-600">Click to upload photos</p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG or WebP up to 5MB each</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-[4/3] rounded-xl overflow-hidden">
                      <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                          Cover
                        </div>
                      )}
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <FiX className="text-red-500 text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="btn-secondary px-6 disabled:opacity-40"
            >
              Previous
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={handleNext} className="btn-primary px-8">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary px-8 airbnb-gradient">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </span>
                ) : 'Publish Listing 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
