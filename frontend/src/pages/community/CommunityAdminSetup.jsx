import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { apartmentService } from '../../services/apartmentService';

const emptyApartment = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  totalFlats: '',
};

const CommunityAdminSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [apartmentId, setApartmentId] = useState('new');
  const [formData, setFormData] = useState(emptyApartment);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apartmentService.getApartments()
      .then(setApartments)
      .catch(() => setError('Unable to load existing apartment communities.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (apartmentId === 'new' && (!formData.name || !formData.address || !formData.city || !formData.state || !formData.pincode || !formData.totalFlats)) {
      setError('Complete all apartment fields before continuing.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authService.completeCommunityAdminSetup({
        apartmentId: apartmentId === 'new' ? null : Number(apartmentId),
        apartment: apartmentId === 'new' ? formData : undefined,
        adminId: user?.id,
      });
      updateUser({ ...(result.user || {}), requiresApartmentSetup: false });
      navigate('/community/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save apartment details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading apartment communities...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold mb-2">
          <Building2 className="w-3 h-3 text-sky-600" />
          Apartment onboarding
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Set up your community</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">This is required once after your approval. Other approved admins can manage the same apartment.</p>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="apartmentId">Apartment community</label>
          <select id="apartmentId" value={apartmentId} onChange={(event) => setApartmentId(event.target.value)} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
            <option value="new">Create a new apartment community</option>
            {apartments.map((apartment) => <option key={apartment.id} value={apartment.id}>{apartment.name}</option>)}
          </select>
        </div>

        {apartmentId === 'new' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['name', 'Apartment name'],
              ['address', 'Street address'],
              ['city', 'City'],
              ['state', 'State'],
              ['pincode', 'Pincode'],
              ['totalFlats', 'Total flats'],
            ].map(([name, label]) => (
              <label key={name} className="text-xs font-bold text-slate-700">
                {label}
                <input required name={name} type={name === 'totalFlats' ? 'number' : 'text'} value={formData[name]} onChange={(event) => setFormData({ ...formData, [name]: event.target.value })} className="mt-1 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium" />
              </label>
            ))}
          </div>
        )}

        <button type="submit" disabled={submitting} className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {submitting ? 'Saving apartment details...' : 'Finish setup'}
        </button>
      </form>
    </div>
  );
};

export default CommunityAdminSetup;
