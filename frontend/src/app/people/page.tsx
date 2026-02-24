'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaUser, FaBriefcase } from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Person {
  id: number;
  name: string;
  title: string;
  role?: string;
  url?: string;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);

  useEffect(() => {
    async function fetchPeople() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/people?page=${page}&limit=${limit}`);
        setPeople(response.data.data);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching people:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPeople();
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">People</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person, index) => (
            <Link
              key={`person-${person.id}-${index}`}
              href={person.url || `/people/${person.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-purple-300 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2">
                <div className="flex items-center text-purple-700">
                  <FaUser className="text-lg mr-3 flex-shrink-0" />
                  <h2 className="text-base font-semibold truncate">{person.name}</h2>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 flex items-center">
                  <FaBriefcase className="text-gray-400 mr-2" />
                  {person.title}
                </p>
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
