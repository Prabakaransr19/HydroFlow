import React, { useEffect, useState } from 'react';
import { invoiceService } from '../../services/invoiceService';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { Receipt, CreditCard, CheckCircle2, ShieldCheck, Zap, QrCode, Home } from 'lucide-react';

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  useEffect(() => {
    fetchMyBills();
  }, []);

  const fetchMyBills = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await invoiceService.getInvoices({ householdId: 1 });
      setBills(data.filter((bill) => bill.status !== 'PAID'));
    } catch (err) {
      setError('Failed to fetch personal billing statements.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayModal = (bill) => {
    setSelectedBill(bill);
    setPaymentMethod('UPI');
    setPaymentSuccess(null);
    setPayModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedBill) return;
    setPaying(true);
    try {
      const invoiceId = selectedBill.invoiceId || selectedBill.id;
      const order = await invoiceService.createRazorpayOrder(invoiceId);
      await loadRazorpayCheckout();
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'HydroFlow',
        description: `Water bill ${selectedBill.billingMonth || ''}`,
        order_id: order.orderId,
        prefill: { name: selectedBill.residentName, email: selectedBill.residentEmail },
        theme: { color: '#0284c7' },
        handler: async (response) => {
          try {
            const verified = await invoiceService.verifyRazorpayPayment(invoiceId, response);
            setPaymentSuccess(verified);
            fetchMyBills();
          } catch (err) {
            setError('Payment verification failed. The bill was not marked as paid.');
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      checkout.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to start Razorpay checkout.');
      setPaying(false);
    } finally {
      if (!window.Razorpay) setPaying(false);
    }
  };

  const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout.'));
    document.body.appendChild(script);
  });

  const columns = [
    { header: 'Billing Period', accessor: 'billingMonth', render: (r) => <strong className="text-slate-900 text-xs font-bold">{r.billingMonth || 'August 2026'}</strong> },
    { header: 'Consumption', accessor: 'consumption', render: (r) => <span className="font-mono text-sky-800 font-extrabold text-xs">{r.consumption} kL</span> },
    { header: 'Base Water Charge', accessor: 'baseWaterCharge', render: (r) => <span className="font-mono text-slate-700 text-xs font-medium">{formatCurrency(r.baseWaterCharge)}</span> },
    { header: 'Shared Area Charge', accessor: 'sharedAreaCharge', render: (r) => <span className="font-mono text-slate-700 text-xs font-medium">{formatCurrency(r.sharedAreaCharge)}</span> },
    { header: 'Total Bill Amount', accessor: 'totalAmount', render: (r) => <strong className="font-mono text-slate-900 text-xs font-extrabold">{formatCurrency(r.totalAmount)}</strong> },
    { header: 'Payment Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Pay Action',
      render: (r) => {
        const isPaid = r.status === 'PAID';
        return isPaid ? (
          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid
          </span>
        ) : (
          <button
            onClick={() => handleOpenPayModal(r)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" /> Pay Now
          </button>
        );
      },
    },
  ];

  if (loading) return <LoadingSpinner message="Loading your billing statements..." />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-slate-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
          <Home className="w-3 h-3 text-sky-600" />
          <span>Flat A101 Billing Statements</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Water Bills</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Itemized water consumption statements with online bill payment</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchMyBills} />}

      <DataTable columns={columns} data={bills} emptyMessage="No billing statements available." />

      {/* Pay Modal Dialog */}
      {selectedBill && (
        <Modal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          title={`Pay Water Bill - ${selectedBill.billingMonth || 'August 2026'}`}
          footer={
            paymentSuccess ? (
              <button
                onClick={() => setPayModalOpen(false)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs"
              >
                Done
              </button>
            ) : (
              <>
                <button
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={paying}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{paying ? 'Processing...' : `Confirm & Pay ${formatCurrency(selectedBill.totalAmount)}`}</span>
                </button>
              </>
            )
          }
        >
          {paymentSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Your bill has been marked as PAID.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-sm mx-auto text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Transaction Ref:</span>
                  <span className="font-bold text-slate-900">{paymentSuccess.paymentReference || 'PAY-' + Date.now()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Method:</span>
                  <span className="font-bold text-slate-900">{paymentSuccess.paymentMethod || paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Amount Paid:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(selectedBill.totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-slate-900">
              {/* Amount Banner */}
              <div className="bg-slate-950 text-white p-5 rounded-xl flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Payable Amount</span>
                  <p className="text-2xl font-extrabold text-sky-400 font-mono mt-0.5">{formatCurrency(selectedBill.totalAmount)}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-slate-200 font-bold">Flat A101</p>
                  <p className="text-slate-400 font-medium">Usage: {selectedBill.consumption} kL</p>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">UPI / QR Code</p>
                      <p className="text-[10px] text-slate-500 font-medium">GPay, PhonePe, Paytm</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Credit / Debit Card</p>
                      <p className="text-[10px] text-slate-500 font-medium">Visa, Mastercard, RuPay</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NETBANKING')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === 'NETBANKING'
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Net Banking</p>
                      <p className="text-[10px] text-slate-500 font-medium">All Indian Banks</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Receipt className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Counter Cash</p>
                      <p className="text-[10px] text-slate-500 font-medium">Society Office Desk</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default MyBills;
