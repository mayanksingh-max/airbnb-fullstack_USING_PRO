import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, updateProperty } from '../services/propertyService';
import { FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
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

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', category: 'apartment',
    address: '', city: '', state: '', country: '', zipCode: '',
    pricePerNight: '', cleaningFee: '', maxGuests: '', bedrooms: '', bathrooms: '', beds: '',
    amenities: [], isAvailable: true,
  });
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await getProperty(id);
        const p = data.property;
        setForm({
          title: p.title, description: p.description, category: p.category,
          address: p.location.address, city: p.location.city, state: p.location.state || '',
          country: p.location.country, zipCode: p.location.zipCode || '',
          pricePerNight: p.pricePerNight, cleaningFee: p.cleaningFee || '',
          maxGuests: p.maxGuests, bedrooms: p.bedrooms, bathrooms: p.bathrooms, beds: p.beds,
          amenities: p.amenities || [], isAvailable: p.isAvailable,
        });
        setExistingImages(p.images || []);
      } catch {
        toast.error('Failed to load property');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchProperty();
  }, [id]);

  const updateFormField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toggleAmenity = (amenityId) => {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(amenityId)
        ? p.amenities.filter((a) => a !== amenityId)
        : [...p.amenities, amenityId],
    }));
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      formData.append('beds', form.beds);
      formData.append('amenities', JSON.stringify(form.amenities));
      formData.append('isAvailable', form.isAvailable);
      newImageFiles.forEach((file) => formData.append('images', file));

      await updateProperty(id, formData);
      toast.success('Property updated successfully!');
      navigate(`/properties/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-3xl font-bold font-display text-gray-900 mb-6">Edit Property</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
            <h2 className="font-bold text-gray-900">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input type="text" className="input-field" value={form.title} onChange={(e) => updateFormField('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea className="input-field resize-none h-28" value={form.description} onChange={(e) => updateFormField('description', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => updateFormField('category', cat)}
                    className={`p-2 rounded-xl border-2 text-xs font-medium capitalize transition-all ${
                      form.category === cat ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >{cat}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isAvailable" checked={form.isAvailable}
                onChange={(e) => updateFormField('isAvailable', e.target.checked)}
                className="w-4 h-4 accent-primary-500" />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Property is available for booking</label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Location</h2>
            <input type="text" placeholder="Address" className="input-field" value={form.address} onChange={(e) => updateFormField('address', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="City" className="input-field" value={form.city} onChange={(e) => updateFormField('city', e.target.value)} />
              <input type="text" placeholder="State" className="input-field" value={form.state} onChange={(e) => updateFormField('state', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Country" className="input-field" value={form.country} onChange={(e) => updateFormField('country', e.target.value)} />
              <input type="text" placeholder="Zip Code" className="input-field" value={form.zipCode} onChange={(e) => updateFormField('zipCode', e.target.value)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Pricing & Capacity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Price/Night ($)</label>
                <input type="number" className="input-field" value={form.pricePerNight} onChange={(e) => updateFormField('pricePerNight', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cleaning Fee ($)</label>
                <input type="number" className="input-field" value={form.cleaningFee} onChange={(e) => updateFormField('cleaningFee', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {['maxGuests', 'bedrooms', 'beds', 'bathrooms'].map((field) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input type="number" className="input-field" value={form[field]} onChange={(e) => updateFormField(field, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AMENITIES.map(({ id: amenityId, label }) => (
                <button key={amenityId} type="button" onClick={() => toggleAmenity(amenityId)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                    form.amenities.includes(amenityId) ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Photos</h2>
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Current images</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
              <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to add more photos</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
            </div>
            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {newImagePreviews.map((src, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => { setNewImageFiles((p) => p.filter((_, i) => i !== idx)); setNewImagePreviews((p) => p.filter((_, i) => i !== idx)); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <FiX className="text-red-500 text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pb-6">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary px-8 flex-1 airbnb-gradient">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
