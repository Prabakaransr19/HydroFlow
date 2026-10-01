import React, { useEffect, useState } from 'react';
import { apartmentService } from '../../services/apartmentService';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Building2, Plus, Edit, Trash2, MapPin, Eye, Building } from 'lucide-react';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    totalFlats: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apartmentService.getApartments();
      setApartments(data);
    } catch (err) {
      setError('Failed to fetch apartment communities.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedApartment(null);
    setFormData({
      name: '',
      address: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '',
      totalFlats: '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (apt) => {
    setSelectedApartment(apt);
    setFormData({
      name: apt.name || '',
      address: apt.address || '',
      city: apt.city || '',
      state: apt.state || '',
      pincode: apt.pincode || '',
      totalFlats: apt.totalFlats || '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenView = (apt) => {
    setSelectedApartment(apt);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (apt) => {
    setSelectedApartment(apt);
    setIsDeleteOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.city || !formData.pincode || !formData.totalFlats) {
      setFormError('Please fill in all required apartment fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (selectedApartment) {
        await apartmentService.updateApartment(selectedApartment.id, formData);
        showToast('Apartment updated successfully!');
      } else {
        await apartmentService.createApartment(formData);
        showToast('Apartment created successfully!');
      }
      setIsFormOpen(false);
      fetchApartments();
    } catch (err) {
      setFormError('Failed to save apartment details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedApartment) return;
    setSubmitting(true);
    try {
      await apartmentService.deleteApartment(selectedApartment.id);
      showToast('Apartment deleted successfully!');
      setIsDeleteOpen(false);
      setSelectedApartment(null);
      fetchApartments();
    } catch (err) {
      setError('Failed to delete apartment.');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const columns = [
    {
      header: 'Apartment Complex',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-700 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-xs">{row.name}</p>
            <p className="text-[11px] text-slate-500 font-medium">{row.totalFlats} Total Units</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Location / Address',
      accessor: 'address',
      render: (row) => (
        <div className="flex items-start gap-1.5 text-xs text-slate-600 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{row.address}, {row.city}, {row.state} - {row.pincode}</span>
        </div>
      ),
    },
    {
      header: 'Total Capacity',
      accessor: 'totalFlats',
      render: (row) => <span className="font-bold text-slate-800 text-xs">{row.totalFlats} Flats</span>,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenView(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
            title="Edit Apartment"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete Apartment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading apartment directory..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
            <Building className="w-3 h-3 text-sky-600" />
            <span>Property Portfolio</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Apartment Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Configure and manage registered multi-flat residential properties</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Apartment
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs">
          {toast}
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchApartments} />}

      <DataTable
        columns={columns}
        data={apartments}
        searchKey="name"
        searchPlaceholder="Search apartments by name, city, or address..."
        emptyMessage="No apartment communities registered yet."
      />

      {/* Add / Edit Apartment Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedApartment ? 'Edit Apartment Community' : 'Create New Apartment Community'}
        footer={
          <>
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : selectedApartment ? 'Update Apartment' : 'Create Apartment'}
            </button>
          </>
        }
      >
        {formError && <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">{formError}</div>}

        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Apartment Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Green Valley Residency"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Street Address *</label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="100 Waterworks Road, Electronic City Phase 1"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode *</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="560100"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Total Flats *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.totalFlats}
                onChange={(e) => setFormData({ ...formData, totalFlats: e.target.value })}
                placeholder="48"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Apartment Details Modal */}
      {selectedApartment && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Apartment Overview: ${selectedApartment.name}`}
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-sky-50 border border-sky-200/80 rounded-xl">
              <h4 className="font-extrabold text-sky-950 text-sm">{selectedApartment.name}</h4>
              <p className="text-sky-800 font-medium mt-1">{selectedApartment.address}, {selectedApartment.city}, {selectedApartment.state} - {selectedApartment.pincode}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Flat Capacity</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">{selectedApartment.totalFlats} Flats</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
                <p className="text-sm font-bold text-emerald-700 mt-1">Active Complex</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Apartment"
        message={`Are you sure you want to delete apartment "${selectedApartment?.name}"? All related household records will be affected.`}
        confirmText="Delete Property"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};

export default Apartments;
