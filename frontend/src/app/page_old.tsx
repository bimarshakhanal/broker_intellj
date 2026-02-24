'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPeople } from '@/lib/api';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Person {
  id: string;
  name: string;
  title: string;
  image?: string;
}

interface PeopleResponse {
  data: Person[];
  total: number;
  page: number;
  limit: number;
}

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const response: PeopleResponse = await getPeople(page, limit);
        setPeople(response.data);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch people:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">People Directory</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {people.map((person) => (
          <Link key={person.id} href={`/people/${person.id}`}>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden">
              {person.image && (
                <img src={person.image} alt={person.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">{person.name}</h2>
                <p className="text-sm text-gray-600">{person.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
          >
            <FiChevronLeft />
          </button>
          
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
