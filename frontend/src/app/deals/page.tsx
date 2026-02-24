'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaHandshake, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Deal {
  id: number;
  property: string;
  type?: string;
  price?: string;
  date: string;
  url: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/deals?page=${page}&limit=${limit}`);
        setDeals(response.data.data);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Deals</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <Link
              key={`deal-${deal.id}-${index}`}
              href={deal.url}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-blue-300 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2">
                <div className="flex items-center text-blue-700">
                  <FaHandshake className="text-lg mr-3" />
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {deal.type || 'Deal'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-start">
                  <FaMapMarkerAlt className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="truncate">{deal.property}</span>
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-2" />
                    {deal.date}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center space-x-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronLeft />
          </button>
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
