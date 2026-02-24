'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPropertyDetail } from '@/lib/api';
import { FiArrowLeft } from 'react-icons/fi';

interface Deal {
  id: string;
  title: string;
  value?: string;
  status?: string;
}

interface Story {
  id: string;
  title: string;
  content?: string;
  date?: string;
}

interface PropertyDetail {
  id: string;
  address: string;
  price?: string;
  currency?: string;
  description?: string;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  status?: string;
  images?: string[];
  deals: Deal[];
  stories: Story[];
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await getPropertyDetail(params.id);
        setProperty(response.data);
      } catch (err) {
        setError('Failed to load property details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !property) {
    return <div className="text-center py-12 text-red-600">{error || 'Property not found'}</div>;
  }

  return (
    <div>
      <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <FiArrowLeft /> Back to People
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        {property.images && property.images.length > 0 && (
          <div className="mb-8 rounded overflow-hidden">
            <img 
              src={property.images[0]} 
              alt={property.address} 
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-2">{property.address}</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div>
            <p className="text-gray-600 text-sm">Price</p>
            <p className="text-2xl font-bold">{property.price} {property.currency}</p>
          </div>
          {property.type && (
            <div>
              <p className="text-gray-600 text-sm">Type</p>
              <p className="text-lg font-semibold">{property.type}</p>
            </div>
          )}
          {property.bedrooms && (
            <div>
              <p className="text-gray-600 text-sm">Bedrooms</p>
              <p className="text-lg font-semibold">{property.bedrooms}</p>
            </div>
          )}
          {property.bathrooms && (
            <div>
              <p className="text-gray-600 text-sm">Bathrooms</p>
              <p className="text-lg font-semibold">{property.bathrooms}</p>
            </div>
          )}
        </div>

        {property.area && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm">Area</p>
            <p className="text-lg">{property.area}</p>
          </div>
        )}

        {property.description && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{property.description}</p>
          </div>
        )}
      </div>

      {/* Deals */}
      {property.deals && property.deals.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Deals Involving This Property</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.deals.map((deal) => (
              <Link key={deal.id} href={`/deals/${deal.id}`}>
                <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                  <h3 className="font-semibold text-lg">{deal.title}</h3>
                  {deal.value && <p className="text-gray-600">Value: {deal.value}</p>}
                  {deal.status && <p className="text-sm text-gray-500">Status: {deal.status}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stories */}
      {property.stories && property.stories.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Related Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.stories.map((story) => (
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
