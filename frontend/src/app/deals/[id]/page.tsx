'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDealDetail } from '@/lib/api';
import { FiArrowLeft } from 'react-icons/fi';

interface Participant {
  id: string;
  name: string;
  type: string; // "Person" or "Organization"
}

interface Property {
  id: string;
  address: string;
  price?: string;
}

interface Story {
  id: string;
  title: string;
  content?: string;
  date?: string;
}

interface DealDetail {
  id: string;
  title: string;
  description?: string;
  value?: string;
  currency?: string;
  status?: string;
  type?: string;
  participants: Participant[];
  properties: Property[];
  stories: Story[];
}

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        const response = await getDealDetail(params.id);
        setDeal(response.data);
      } catch (err) {
        setError('Failed to load deal details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !deal) {
    return <div className="text-center py-12 text-red-600">{error || 'Deal not found'}</div>;
  }

  return (
    <div>
      <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <FiArrowLeft /> Back to People
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-2">{deal.title}</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div>
            <p className="text-gray-600 text-sm">Deal Value</p>
            <p className="text-2xl font-bold">{deal.value} {deal.currency}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-lg font-semibold">{deal.status}</p>
          </div>
          {deal.type && (
            <div>
              <p className="text-gray-600 text-sm">Type</p>
              <p className="text-lg font-semibold">{deal.type}</p>
            </div>
          )}
        </div>

        {deal.description && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{deal.description}</p>
          </div>
        )}
      </div>

      {/* Participants */}
      {deal.participants && deal.participants.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Participants</h2>
          <div className="space-y-3">
            {deal.participants.map((participant) => (
              <Link key={participant.id} href={participant.type === 'Person' ? `/people/${participant.id}` : `/organizations/${participant.id}`}>
                <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{participant.name}</h3>
                    <p className="text-sm text-gray-500">{participant.type}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Properties */}
      {deal.properties && deal.properties.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Properties Involved</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deal.properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                  <h3 className="font-semibold text-lg">{property.address}</h3>
                  {property.price && <p className="text-gray-600">Price: {property.price}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stories */}
      {deal.stories && deal.stories.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Related Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deal.stories.map((story) => (
              <div key={story.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                <h3 className="font-semibold text-lg">{story.title}</h3>
                {story.date && <p className="text-sm text-gray-500">Date: {story.date}</p>}
                {story.content && <p className="text-gray-700 mt-2 line-clamp-3">{story.content}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
