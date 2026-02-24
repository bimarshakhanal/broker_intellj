'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDealDetail } from '@/lib/api';
import { FiArrowLeft } from 'react-icons/fi';

interface Participant {
  id: number;
  name: string;
  type: string; // "Person" or "Organization"
  role?: string;
  url?: string;
}

interface Property {
  id: number;
  address: string;
  url: string;
  name?: string;
  type?: string;
  square_feet?: string;
  year_built?: string;
  credifi_score?: string;
}

interface Story {
  id: number;
  title: string;
  source: string;
  url: string;
}

interface DealDetail {
  id: number;
  property: string;
  url: string;
  date: string;
  type?: string;
  price?: string;
  price_per_square_foot?: string;
  floors?: string;
  term_years?: string;
  square_feet?: string;
  acquirer_stake?: string;
  amount?: string;
  financing_types?: string;
  interest_rate?: string;
  structure?: string;
  fixed_vs_floating?: string;
  participants: Participant[];
  properties: Property[];
  stories: Story[];
}

export default function DealActivityPage({ params }: { params: { slug: string[] } }) {
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        const dealPath = `activity/${params.slug.join('/')}`;
        const response = await getDealDetail(dealPath);
        setDeal(response.data);
      } catch (err) {
        setError('Failed to load deal details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [params.slug]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !deal) {
    return <div className="text-center py-12 text-red-600">{error || 'Deal not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/deals" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <FiArrowLeft /> Back to Deals
        </Link>

        {/* Top Section - Date, Type, Property */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Property Address</p>
              <p className="text-xl font-semibold text-gray-900">{deal.property || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Date</p>
              <p className="text-xl font-semibold text-gray-900">{deal.date || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Type</p>
              <p className="text-xl font-semibold text-gray-900 capitalize">{deal.type || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Deal Properties Cards */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Deal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deal.price && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Price</p>
                <p className="text-lg font-semibold text-green-600">${parseFloat(deal.price).toLocaleString()}</p>
              </div>
            )}
            {deal.square_feet && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Square Feet</p>
                <p className="text-lg font-semibold text-gray-900">{deal.square_feet}</p>
              </div>
            )}
            {deal.price_per_square_foot && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Price per Sq Ft</p>
                <p className="text-lg font-semibold text-gray-900">${deal.price_per_square_foot}</p>
              </div>
            )}
            {deal.floors && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Floors</p>
                <p className="text-lg font-semibold text-gray-900">{deal.floors}</p>
              </div>
            )}
            {deal.term_years && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Term (Years)</p>
                <p className="text-lg font-semibold text-gray-900">{deal.term_years}</p>
              </div>
            )}
            {deal.acquirer_stake && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Acquirer Stake</p>
                <p className="text-lg font-semibold text-gray-900">{deal.acquirer_stake}</p>
              </div>
            )}
            {deal.amount && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Amount</p>
                <p className="text-lg font-semibold text-green-600">${parseFloat(deal.amount).toLocaleString()}</p>
              </div>
            )}
            {deal.financing_types && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Financing Types</p>
                <p className="text-lg font-semibold text-gray-900">{deal.financing_types}</p>
              </div>
            )}
            {deal.interest_rate && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Interest Rate</p>
                <p className="text-lg font-semibold text-gray-900">{deal.interest_rate}</p>
              </div>
            )}
            {deal.structure && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Structure</p>
                <p className="text-lg font-semibold text-gray-900">{deal.structure}</p>
              </div>
            )}
            {deal.fixed_vs_floating && (
              <div className="border rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Fixed vs Floating</p>
                <p className="text-lg font-semibold text-gray-900">{deal.fixed_vs_floating}</p>
              </div>
            )}
          </div>
        </div>

        {/* Properties Involved */}
        {deal.properties && deal.properties.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Properties Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deal.properties.map((property, index) => (
                <Link key={`property-${property.id}-${index}`} href={property.url}>
                  <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                    <h3 className="font-semibold text-lg mb-2">{property.name || property.address}</h3>
                    <p className="text-gray-600 text-sm mb-2">{property.address}</p>
                    {property.type && <p className="text-xs text-gray-500">Type: {property.type}</p>}
                    {property.square_feet && <p className="text-xs text-gray-500">Size: {property.square_feet} sq ft</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* People Involved */}
        {deal.participants && deal.participants.filter(p => p.type === 'Person').length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">People Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deal.participants.filter(p => p.type === 'Person').map((participant, index) => (
                <Link 
                  key={`person-${participant.id}-${index}`} 
                  href={participant.url || `/people/${participant.id}`}
                >
                  <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                    <h3 className="font-semibold text-lg mb-1">{participant.name}</h3>
                    {participant.role && (
                      <p className="text-xs text-blue-600">Role: {participant.role}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Organizations Involved */}
        {deal.participants && deal.participants.filter(p => p.type === 'Organization').length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Organizations Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deal.participants.filter(p => p.type === 'Organization').map((participant, index) => (
                <Link 
                  key={`org-${participant.id}-${index}`} 
                  href={participant.url || `/organizations/${participant.id}`}
                >
                  <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                    <h3 className="font-semibold text-lg mb-1">{participant.name}</h3>
                    {participant.role && (
                      <p className="text-xs text-purple-600">Role: {participant.role}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stories */}
        {deal.stories && deal.stories.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Related Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deal.stories.map((story, index) => (
                <a 
                  key={`story-${story.id}-${index}`} 
                  href={story.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg mb-1">{story.title}</h3>
                  <p className="text-sm text-gray-500">{story.source}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
