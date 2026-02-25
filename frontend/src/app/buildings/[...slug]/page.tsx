'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { FaHome, FaMapMarkerAlt, FaCalendarAlt, FaRuler, FaHandshake, FaDollarSign, FaUser, FaBuilding, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Deal {
  id: number;
  property: string;
  url: string;
  date: string;
  type?: string;
  price?: string;
  square_feet?: string;
}

interface Story {
  id: number;
  title: string;
  source?: string;
  url?: string;
}

interface Participant {
  id: number;
  name?: string;
  type: string;
  role?: string;
  url?: string;
}

interface PropertyDetail {
  id: number;
  address?: string;
  url: string;
  name?: string;
  type?: string;
  square_feet?: string;
  year_built?: string;
  credifi_score?: string;
  deals: Deal[];
  stories: Story[];
  participants: Participant[];
}

export default function PropertyDetailPage({ params }: { params: { slug: string[] } }) {
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealsPage, setDealsPage] = useState(1);
  const [peoplePage, setPeoplePage] = useState(1);
  const [orgsPage, setOrgsPage] = useState(1);
  const [storiesPage, setStoriesPage] = useState(1);
  const itemsPerPage = 8;

  const propertyPath = params.slug.join('/');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/properties/${propertyPath}`);
        setProperty(response.data.data);
      } catch (err) {
        setError('Failed to load property details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyPath]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">Loading...</div></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-red-600">{error}</div></div>;
  }

  if (!property) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-red-600">Property not found</div></div>;
  }

  // After guards, property is definitely defined
  const prop = property as PropertyDetail;

  // Extract name from address (part before first comma)
  const addressPart = prop?.address?.split(',')[0]?.trim();
  const propertyName = prop?.name || addressPart || 'Property';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop?.address || 'Unknown')}`;

  // Get all property fields dynamically, excluding known fields
  const excludedFields = ['id', '_id', 'address', 'url', 'name', 'deals', 'stories', 'participants'];
  const propertyDetails = Object.entries(prop as Record<string, any>)
    .filter(([key, value]) => !excludedFields.includes(key) && value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({
      key: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: String(value)
    }));

  const people = prop.participants?.filter(p => p.type === 'Person') || [];
  const organizations = prop.participants?.filter(p => p.type === 'Organization') || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <FiArrowLeft /> Back to Home
        </Link>

        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <FaHome className="text-4xl text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{propertyName}</h1>
              <div className="flex items-start text-gray-600 text-lg mb-3">
                <FaMapMarkerAlt className="mr-2 text-green-500 mt-1 flex-shrink-0" />
                <span>{prop.address}</span>
              </div>
              <a 
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <FiExternalLink />
                View on Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Property Details */}
        {propertyDetails.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertyDetails.map(({ key, value }, index) => (
                <div key={`detail-${index}-${key}`} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">{key}</p>
                  <p className="text-lg font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deals Involving This Property */}
        {prop.deals && prop.deals.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Deals Involving This Property</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prop.deals.slice((dealsPage - 1) * itemsPerPage, dealsPage * itemsPerPage).map((deal, index) => (
                <Link
                  key={`deal-${deal.id}-${(dealsPage - 1) * itemsPerPage + index}`}
                  href={deal.url}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-blue-300"
                >
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2">
                    <div className="flex items-center text-blue-700">
                      <FaHandshake className="text-sm mr-2" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {deal.type || 'Deal'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 truncate">
                      {deal.property}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        {deal.date}
                      </p>
                      {deal.square_feet && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <FaRuler className="text-gray-400 mr-2" />
                          {deal.square_feet} sq ft
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {prop.deals.length > itemsPerPage && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setDealsPage(p => Math.max(1, p - 1))}
                  disabled={dealsPage === 1}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-gray-700">
                  Page {dealsPage} of {Math.ceil(prop.deals.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setDealsPage(p => Math.min(Math.ceil(prop.deals.length / itemsPerPage), p + 1))}
                  disabled={dealsPage === Math.ceil(prop.deals.length / itemsPerPage)}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* People Involved */}
        {people.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">People Involved in Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.slice((peoplePage - 1) * itemsPerPage, peoplePage * itemsPerPage).map((person, index) => (
                <Link
                  key={`person-${person.id}-${(peoplePage - 1) * itemsPerPage + index}`}
                  href={person.url || '#'}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-purple-300"
                >
                  <div className="bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-2">
                    <div className="flex items-center text-purple-700">
                      <FaUser className="text-sm mr-2" />
                      <span className="text-sm font-semibold truncate">
                        {person.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  {person.role && (
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Role:</span> {person.role}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
            {people.length > itemsPerPage && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPeoplePage(p => Math.max(1, p - 1))}
                  disabled={peoplePage === 1}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-gray-700">
                  Page {peoplePage} of {Math.ceil(people.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setPeoplePage(p => Math.min(Math.ceil(people.length / itemsPerPage), p + 1))}
                  disabled={peoplePage === Math.ceil(people.length / itemsPerPage)}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Organizations Involved */}
        {organizations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizations Involved in Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.slice((orgsPage - 1) * itemsPerPage, orgsPage * itemsPerPage).map((org, index) => (
                <Link
                  key={`org-${org.id}-${(orgsPage - 1) * itemsPerPage + index}`}
                  href={org.url || '#'}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-orange-300"
                >
                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-3 py-2">
                    <div className="flex items-center text-orange-700">
                      <FaBuilding className="text-sm mr-2" />
                      <span className="text-sm font-semibold truncate">
                        {org.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  {org.role && (
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Role:</span> {org.role}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
            {organizations.length > itemsPerPage && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setOrgsPage(p => Math.max(1, p - 1))}
                  disabled={orgsPage === 1}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-gray-700">
                  Page {orgsPage} of {Math.ceil(organizations.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setOrgsPage(p => Math.min(Math.ceil(organizations.length / itemsPerPage), p + 1))}
                  disabled={orgsPage === Math.ceil(organizations.length / itemsPerPage)}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Related Stories */}
        {prop.stories && prop.stories.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prop.stories.slice((storiesPage - 1) * itemsPerPage, storiesPage * itemsPerPage).map((story, index) => (
                <div key={`story-${story.id}-${(storiesPage - 1) * itemsPerPage + index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{story.title}</h3>
                  {story.source && <p className="text-sm text-gray-500">Source: {story.source}</p>}
                  {story.url && (
                    <a 
                      href={story.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              ))}
            </div>
            {prop.stories.length > itemsPerPage && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setStoriesPage(p => Math.max(1, p - 1))}
                  disabled={storiesPage === 1}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-gray-700">
                  Page {storiesPage} of {Math.ceil(prop.stories.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setStoriesPage(p => Math.min(Math.ceil(prop.stories.length / itemsPerPage), p + 1))}
                  disabled={storiesPage === Math.ceil(prop.stories.length / itemsPerPage)}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
