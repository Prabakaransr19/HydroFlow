import React, { useEffect, useState } from 'react';
import { invoiceService } from '../../services/invoiceService';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency } from '../../utils/formatCurrency';
import { Eye, Printer, Droplets, CheckCircle2, Home, Mail, Building, Gauge, Layers } from 'lucide-react';

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await invoiceService.getInvoices({ householdId: 1 });
      setInvoices(data.filter((invoice) => invoice.status === 'PAID'));
    } catch (err) {
      setError('Failed to fetch personal invoices.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (inv) => {
    setSelectedInvoice(inv);
    setIsDetailOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { header: 'Invoice ID', accessor: 'id', render: (r) => <span className="font-mono font-bold text-slate-800 text-xs">#INV-{r.id || r.invoiceId}</span> },
    { header: 'Billing Period', accessor: 'billingMonth', render: (r) => <span className="font-semibold text-slate-800 text-xs">{r.billingMonth || 'August 2026'}</span> },
    { header: 'Consumption', accessor: 'consumption', render: (r) => <span className="font-mono text-sky-800 font-bold text-xs">{r.consumption} kL</span> },
    { header: 'Total Amount', accessor: 'totalAmount', render: (r) => <strong className="font-mono text-slate-900 text-xs font-extrabold">{formatCurrency(r.totalAmount)}</strong> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenDetail(r)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
            title="View & Print Invoice"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Fetching your invoice statements..." />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-slate-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
          <Home className="w-3 h-3 text-sky-600" />
          <span>Flat A101 Water Invoices</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Water Invoices</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Inspect and print official paid monthly water invoice statements</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchInvoices} />}

      <DataTable columns={columns} data={invoices} emptyMessage="No invoices generated yet." />

      {/* Detailed Itemized Printable Invoice Statement Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Official Invoice #INV-${selectedInvoice.id || selectedInvoice.invoiceId}`}
          footer={
            <>
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Close
              </button>
              <button onClick={handlePrint} className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                Print Invoice
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
                  OFFICIAL INVOICE
                </span>
                <p className="font-mono font-extrabold text-slate-900 text-sm">#INV-{selectedInvoice.id || selectedInvoice.invoiceId}</p>
                <p className="text-xs text-slate-500 font-bold">{selectedInvoice.billingMonth || 'August 2026'}</p>
              </div>
            </div>

            {/* Resident & Account Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed Resident Account</p>
                <p className="font-extrabold text-slate-900 text-sm">{selectedInvoice.residentName || 'Amit Patel (Flat A101)'}</p>
                <p className="text-slate-500 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedInvoice.residentEmail || 'resident1@water.com'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Household Assignment</p>
                <p className="font-extrabold text-slate-900 text-sm">Flat Number {selectedInvoice.flatNumber || 'A101'}</p>
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

export default MyInvoices;
