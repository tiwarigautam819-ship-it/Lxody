import React, { useState, useEffect } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, Shield, RefreshCw } from 'lucide-react';
import { Transaction } from '../../types';

export const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions/my-transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('ag_auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTransactions(data.transactions || []);
        }
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#1e60d5] text-white rounded-xl flex items-center justify-center shadow-md">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Transaction History</h2>
              <p className="text-xs text-gray-500">Complete record of deposits, charges, refunds and adjustments</p>
            </div>
          </div>

          <button
            onClick={fetchTransactions}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold text-xs flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm">Loading transaction log...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">No transaction records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-extrabold uppercase text-[11px]">
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                          {tx.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              tx.type === 'Deposit'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.type === 'Refund'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                            )}
                            <span>{tx.type}</span>
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 font-black text-sm ${
                            isPositive ? 'text-emerald-600' : 'text-gray-900'
                          }`}
                        >
                          {isPositive ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 max-w-xs truncate" title={tx.description}>
                          {tx.description}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
