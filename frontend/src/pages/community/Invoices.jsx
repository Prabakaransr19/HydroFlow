import React, { useEffect, useState } from 'react';
import { invoiceService } from '../../services/invoiceService';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency } from '../../utils/formatCurrency';
import { FileText, Printer, Plus, Eye, Droplets, CheckCircle2, Building, Mail, Gauge, Layers } from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch (err) {
      setError('Failed to fetch invoice list.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setGenerating(true);
    setError('');
    try {
      await invoiceService.generateInvoice(1);
      showToast('Invoices generated successfully for current cycle!');
      fetchInvoices();
    } catch (err) {
      setError('Failed to generate invoices.');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenDetail = (inv) => {
    setSelectedInvoice(inv);
    setIsDetailOpen(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const columns = [
    {
      header: 'Invoice ID',
      accessor: 'id',
      render: (row) => <span className="font-mono font-bold text-slate-800 text-xs">#INV-{row.id}</span>,
    },
    {
      header: 'Household / Resident',
      accessor: 'flatNumber',
      render: (row) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs">Flat {row.flatNumber}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.residentName}</p>
        </div>
      ),
    },
    {
      header: 'Billing Period',
      accessor: 'billingMonth',
      render: (row) => <span className="text-slate-700 text-xs font-semibold">{row.billingMonth}</span>,
    },
    {
      header: 'Consumption',
      accessor: 'consumption',
      render: (row) => <span className="font-extrabold text-sky-800 text-xs font-mono">{row.consumption} kL</span>,
    },
    {
      header: 'Base Water Charge',
      accessor: 'baseWaterCharge',
      render: (row) => <span className="text-slate-700 text-xs font-mono font-medium">{formatCurrency(row.baseWaterCharge)}</span>,
    },
    {
      header: 'Shared Area Charge',
      accessor: 'sharedAreaCharge',
      render: (row) => <span className="text-slate-700 text-xs font-mono font-medium">{formatCurrency(row.sharedAreaCharge)}</span>,
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      render: (row) => (
        <span className="font-extrabold text-slate-900 text-xs font-mono">{formatCurrency(row.totalAmount)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleOpenDetail(row)}
          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition flex items-center gap-1 font-bold text-xs"
          title="View & Print Invoice"
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Fetching water bill invoices..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
            <Building className="w-3 h-3 text-sky-600" />
            <span>Utility Invoicing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoice Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Generate, inspect, and issue itemized monthly water bills</p>
        </div>

        <button
          onClick={handleGenerateInvoice}
          disabled={generating}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{generating ? 'Generating Invoices...' : 'Generate Invoices'}</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchInvoices} />}

      <DataTable
        columns={columns}
        data={invoices}
        searchKey="flatNumber"
        searchPlaceholder="Search invoices by flat or resident..."
        emptyMessage="No invoices generated yet."
      />

      {/* Detailed & Reliable Itemized Printable Invoice Statement */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Utility Invoice Statement #INV-${selectedInvoice.id}`}
          footer={
            <>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handlePrintInvoice}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Itemized Invoice
              </button>
            </>
          }
        >
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-6 text-slate-800 font-sans print-area shadow-2xs">
            {/* Header: Company & Utility Governance */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-6 h-6 text-sky-600 fill-current" />
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase">
                    {selectedInvoice.companyName || 'Green Valley Residency'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-semibold">HydroFlow Utility & Water Governance Platform</p>
                <p className="text-[11px] text-slate-400 font-medium">100 Lake View Road, Chennai, TN 600001</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-sky-50 text-sky-900 border border-sky-200 rounded-full text-xs font-extrabold uppercase tracking-wider mb-1">
                  UTILITY BILL
                </span>
                <p className="font-mono font-extrabold text-slate-900 text-sm">#INV-{selectedInvoice.id}</p>
                <p className="text-xs text-slate-500 font-bold">{selectedInvoice.billingMonth}</p>
              </div>
            </div>

            {/* Resident & Account Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed Resident Account</p>
                <p className="font-extrabold text-slate-900 text-sm">{selectedInvoice.residentName}</p>
                <p className="text-slate-500 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedInvoice.residentEmail || `resident${selectedInvoice.flatNumber?.toLowerCase()}@water.com`}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Household Assignment</p>
                <p className="font-extrabold text-slate-900 text-sm">Flat Number {selectedInvoice.flatNumber}</p>
                <p className="text-slate-500 font-medium flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Complex: {selectedInvoice.companyName || 'Green Valley Residency'}
                </p>
              </div>
            </div>

            {/* Meter Reading Telemetry Box */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-sky-600" />
                Smart Meter Consumption Telemetry
              </h3>

              <div className="grid grid-cols-3 gap-3 bg-sky-50/60 border border-sky-200/80 rounded-xl p-3.5 text-center text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Previous Reading</span>
                  <p className="font-mono font-extrabold text-slate-900 text-sm mt-0.5">
                    {selectedInvoice.previousReading ?? 120.0} kL
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Current Reading</span>
                  <p className="font-mono font-extrabold text-slate-900 text-sm mt-0.5">
                    {selectedInvoice.currentReading ?? ((selectedInvoice.previousReading ?? 120.0) + selectedInvoice.consumption)} kL
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase">This Month Consumption</span>
                  <p className="font-mono font-extrabold text-sky-900 text-sm mt-0.5">
                    {selectedInvoice.consumption} kL
                  </p>
                </div>
              </div>
            </div>

            {/* Progressive Tariff Tier Cost Breakdown Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600" />
                Progressive 3-Tier Tariff Rate Splitup
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2.5">Tariff Tier Slab</th>
                      <th className="px-3.5 py-2.5">Tier Volume</th>
                      <th className="px-3.5 py-2.5">Unit Rate</th>
                      <th className="px-3.5 py-2.5 text-right">Subtotal Charge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="px-3.5 py-2 font-bold text-slate-900">Tier 1 Slab (0 – 10 kL)</td>
                      <td className="px-3.5 py-2 font-mono">{(selectedInvoice.tier1Usage ?? Math.min(selectedInvoice.consumption, 10.0)).toFixed(1)} kL</td>
                      <td className="px-3.5 py-2 font-mono">{formatCurrency(selectedInvoice.tier1Rate ?? 10.0)} / kL</td>
                      <td className="px-3.5 py-2 font-mono font-bold text-slate-900 text-right">
                        {formatCurrency(selectedInvoice.tier1Charge ?? ((selectedInvoice.tier1Usage ?? Math.min(selectedInvoice.consumption, 10.0)) * 10.0))}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 font-bold text-slate-900">Tier 2 Slab (10 – 25 kL)</td>
                      <td className="px-3.5 py-2 font-mono">{(selectedInvoice.tier2Usage ?? Math.max(0, Math.min(selectedInvoice.consumption - 10.0, 15.0))).toFixed(1)} kL</td>
                      <td className="px-3.5 py-2 font-mono">{formatCurrency(selectedInvoice.tier2Rate ?? 15.0)} / kL</td>
                      <td className="px-3.5 py-2 font-mono font-bold text-slate-900 text-right">
                        {formatCurrency(selectedInvoice.tier2Charge ?? ((selectedInvoice.tier2Usage ?? Math.max(0, Math.min(selectedInvoice.consumption - 10.0, 15.0))) * 15.0))}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 font-bold text-slate-900">Tier 3 Slab (&gt; 25 kL)</td>
                      <td className="px-3.5 py-2 font-mono">{(selectedInvoice.tier3Usage ?? Math.max(0, selectedInvoice.consumption - 25.0)).toFixed(1)} kL</td>
                      <td className="px-3.5 py-2 font-mono">{formatCurrency(selectedInvoice.tier3Rate ?? 25.0)} / kL</td>
                      <td className="px-3.5 py-2 font-mono font-bold text-slate-900 text-right">
                        {formatCurrency(selectedInvoice.tier3Charge ?? ((selectedInvoice.tier3Usage ?? Math.max(0, selectedInvoice.consumption - 25.0)) * 25.0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Line Items */}
            <div className="border-t border-b border-slate-200 py-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 font-semibold text-slate-800">
                <span>Total Base Water Consumption Charge</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedInvoice.baseWaterCharge)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-700">
                <span>Shared Area Bulk Water Allocation</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedInvoice.sharedAreaCharge)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Adjustments / Rebates</span>
                <span className="font-mono font-medium">{formatCurrency(selectedInvoice.adjustments || 0)}</span>
              </div>
            </div>

            {/* Total Amount Due Banner */}
            <div className="p-4 bg-slate-950 text-white rounded-xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-slate-300">TOTAL AMOUNT PAYABLE</span>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Includes Base Metered Charge + Shared Bulk Distribution</p>
              </div>
              <span className="text-2xl font-extrabold font-mono text-sky-400">
                {formatCurrency(selectedInvoice.totalAmount)}
              </span>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="font-bold text-slate-500 uppercase">Payment Status</span>
              <div className="flex items-center gap-3">
                {selectedInvoice.paymentReference && (
                  <span className="font-mono text-[11px] text-slate-500 font-medium">Ref: {selectedInvoice.paymentReference}</span>
                )}
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Invoices;
