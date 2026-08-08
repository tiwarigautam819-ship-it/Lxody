import React, { useState, useEffect } from 'react';
import {
  Wallet,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { FundRequest } from '../../types';

interface AddFundsPageProps {
  onNavigate: (page: string) => void;
}

export const AddFundsPage: React.FC<AddFundsPageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const { payment } = useSettings();

  const [amount, setAmount] = useState<string>('100');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [qrError, setQrError] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [myRequests, setMyRequests] = useState<FundRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/funds/my-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMyRequests(data.requests || []);
        }
      }
    } catch (err) {
      console.error('Error fetching deposit requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleCopyUPI = () => {
    if (payment?.upiId) {
      navigator.clipboard.writeText(payment.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < (payment?.minDeposit || 10)) {
      setErrorMsg(`Minimum deposit amount is ₹${payment?.minDeposit || 10}`);
      return;
    }

    if (!utrNumber || utrNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid 12-digit UTR / Transaction ID from your payment receipt');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/funds/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}`
        },
        body: JSON.stringify({
          amount: numAmount,
          utrNumber: utrNumber.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to submit deposit request');
      } else {
        setSuccessMsg(data.message);
        setUtrNumber('');
        await fetchMyRequests();
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting deposit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Current Balance Banner */}
        <div className="bg-gradient-to-r from-[#1e60d5] to-blue-700 rounded-2xl shadow-md p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Current Wallet Balance</p>
              <h2 className="text-3xl sm:text-4xl font-black mt-0.5">₹{user?.walletBalance.toFixed(2) || '0.00'}</h2>
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-white/20 sm:pl-6">
            <p className="text-xs text-blue-100 font-medium">Total Spent</p>
            <p className="text-xl font-bold text-white">₹{user?.totalSpent.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Add Funds Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-[#1e60d5]" />
              <span>Add Funds via Payment QR / UPI</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Pay using any UPI App and enter your Transaction UTR ID below to credit funds instantly after verification.
            </p>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Left Column: QR Code & UPI ID */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-gray-50 border border-gray-200/80 rounded-2xl text-center space-y-4">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Scan QR Code to Pay
              </p>

              {payment?.qrCodeUrl && !qrError ? (
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200">
                  <img
                    src={payment.qrCodeUrl}
                    alt="Payment QR Code"
                    onError={() => setQrError(true)}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi://pay?pa=${encodeURIComponent(payment?.upiId || 'agtech@upi')}&pn=AGTechSMM`}
                    alt="Payment QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                  />
                </div>
              )}

              {/* UPI ID Box */}
              {payment?.upiId && (
                <div className="w-full bg-white border border-gray-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-gray-400">UPI ID</p>
                    <p className="text-xs font-extrabold text-gray-900 truncate font-mono">{payment.upiId}</p>
                  </div>
                  <button
                    onClick={handleCopyUPI}
                    className="bg-blue-50 hover:bg-blue-100 text-[#1e60d5] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors shrink-0"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}

              <div className="text-[11px] text-gray-500 space-y-1 text-left w-full pt-2">
                <p className="font-bold text-gray-700 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Accepted Apps:</span>
                </p>
                <p className="pl-4 text-gray-600">Google Pay, PhonePe, Paytm, BHIM, Amazon Pay & all UPI Apps.</p>
              </div>
            </div>

            {/* Right Column: Deposit Request Form */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2">Submit Payment Verification</h4>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitDeposit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Deposit Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all"
                      min={payment?.minDeposit || 10}
                      max={payment?.maxDeposit || 50000}
                      required
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Min Deposit: ₹{payment?.minDeposit || 10} | Max Deposit: ₹{payment?.maxDeposit || 50000}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Transaction ID / UTR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 12-digit UTR No. from Payment Receipt"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all"
                      required
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Check your GPay / PhonePe payment details screen for the 12-digit UTR or Reference Number.
                    </p>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                    <p className="font-bold">Important Instructions:</p>
                    <p>1. Make payment first to the QR code / UPI ID on the left.</p>
                    <p>2. Enter the exact Amount and 12-digit UTR Number above.</p>
                    <p>3. Do NOT submit fake UTR numbers (doing so may lead to account suspension).</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#28a745] hover:bg-[#218838] text-white font-extrabold py-3.5 rounded-xl text-sm tracking-wide uppercase shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'SUBMITTING REQUEST...' : 'SUBMIT PAYMENT REQUEST'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

        {/* Deposit History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#1e60d5]" />
            <span>Deposit Requests History</span>
          </h3>

          {loadingRequests ? (
            <div className="text-center py-6 text-sm text-gray-500">Loading requests history...</div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
              No deposit requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">UTR Number</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Admin Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/60">
                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-gray-900">
                        ₹{req.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-700">
                        {req.utrNumber}
                      </td>
                      <td className="py-3 px-3">
                        {req.status === 'Approved' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </span>
                        )}
                        {req.status === 'Pending' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs italic">
                        {req.adminNote || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
