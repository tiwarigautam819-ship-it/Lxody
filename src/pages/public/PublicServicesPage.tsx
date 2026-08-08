import React, { useState, useEffect } from 'react';
import { List, Search, Filter, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Service, ServiceCategory } from '../../types';

interface PublicServicesPageProps {
  onNavigate: (page: string) => void;
}

export const PublicServicesPage: React.FC<PublicServicesPageProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories || []);
          setServices(data.services || []);
        }
      })
      .catch((err) => console.error('Error fetching services:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredServices = services.filter((srv) => {
    const matchesCat = selectedCategory === 'all' || srv.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#1e60d5] text-white rounded-xl flex items-center justify-center shadow-md">
              <List className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Services Catalog</h2>
              <p className="text-xs text-gray-500">Explore high speed engagement packages and live pricing per 1,000</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-[#28a745] hover:bg-[#218838] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm uppercase shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            + Place Order
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Service ID, Name or Platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5] focus:bg-white transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-72 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e60d5]"
            >
              <option value="all">All Categories ({services.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Services List Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm">Loading services list...</div>
          ) : filteredServices.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">No services found for your criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-extrabold uppercase text-[11px]">
                    <th className="py-3.5 px-4 w-16">ID</th>
                    <th className="py-3.5 px-4">Service Name</th>
                    <th className="py-3.5 px-4">Rate / 1000</th>
                    <th className="py-3.5 px-4">Min / Max</th>
                    <th className="py-3.5 px-4 text-center">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredServices.map((srv) => {
                    const isExpanded = expandedServiceId === srv.id;
                    return (
                      <React.Fragment key={srv.id}>
                        <tr className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-500">
                            {srv.id}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            {srv.name}
                            <p className="text-[11px] text-gray-400 font-normal">{srv.categoryName}</p>
                          </td>
                          <td className="py-3.5 px-4 font-black text-emerald-700 text-sm whitespace-nowrap">
                            ₹{srv.finalPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-gray-600 whitespace-nowrap">
                            {srv.minQuantity.toLocaleString()} / {srv.maxQuantity.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setExpandedServiceId(isExpanded ? null : srv.id)}
                              className="bg-blue-50 hover:bg-blue-100 text-[#1e60d5] font-bold px-3 py-1 rounded-lg text-xs inline-flex items-center space-x-1"
                            >
                              <span>Details</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-gray-50/80">
                            <td colSpan={5} className="p-4">
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                <p className="font-bold text-gray-900 mb-1">Service Specifications:</p>
                                {srv.description || 'No detailed description provided.'}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
