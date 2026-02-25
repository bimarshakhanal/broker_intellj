'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight, FaStore, FaUser } from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Person {
  id: number;
  name: string;
  title?: string;
  role?: string;
  url?: string;
}

interface Deal {
  id: number;
  property: string;
  date: string;
  url: string;
  type?: string;
  role?: string;
}

interface Story {
  id: number;
  title: string;
  source?: string;
  url?: string;
}

interface OrganizationDetail {
  id: number;
  name: string;
  type?: string;
  url: string;
  role?: string;
  members: Person[];
  deals: Deal[];
  stories: Story[];
}

export default function OrganizationDetailPage({ params }: { params: { slug: string[] } }) {
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealsPage, setDealsPage] = useState(1);
  const [membersPage, setMembersPage] = useState(1);
  const [storiesPage, setStoriesPage] = useState(1);
  const itemsPerPage = 8;

  const organizationPath = params.slug.join('/');

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/organizations/${organizationPath}`);
        console.log('Organization data:', response.data.data);
        console.log('Members:', response.data.data.members);
        setOrganization(response.data.data);
        // Reset pagination when new organization is loaded
        setMembersPage(1);
        setDealsPage(1);
        setStoriesPage(1);
      } catch (err) {
        setError('Failed to load organization details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationPath]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">Loading...</div></div>;
  }

  if (error || !organization) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-red-600">{error || 'Organization not found'}</div></div>;
  }

  const members = organization.members || [];
  const deals = organization.deals || [];
  const stories = organization.stories || [];

  const startIdx = (membersPage - 1) * itemsPerPage;
  const endIdx = membersPage * itemsPerPage;
  const slicedMembers = members.slice(startIdx, endIdx);
  
  console.log('=== PAGINATION DEBUG ===');
  console.log('membersPage:', membersPage);
  console.log('itemsPerPage:', itemsPerPage);
  console.log('Total members:', members.length);
  console.log('Start index:', startIdx);
  console.log('End index:', endIdx);
  console.log('Sliced members length:', slicedMembers.length);
  console.log('Should show pagination?', members.length > itemsPerPage);
  console.log('First member in slice:', slicedMembers[0]?.name);
  console.log('Last member in slice:', slicedMembers[slicedMembers.length - 1]?.name);
  console.log('=======================');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/organizations" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <FiArrowLeft /> Back to Organizations
        </Link>

        {/* Organization Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <FaStore className="text-4xl text-orange-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{organization.name}</h1>
              {organization.type && (
                <p className="text-lg text-gray-600 mb-2">
                  <span className="font-medium">Type:</span> {organization.type}
                </p>
              )}
              {organization.role && (
                <p className="text-lg text-gray-600">
                  <span className="font-medium">Role:</span> {organization.role}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Members */}
        {members.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Members ({members.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slicedMembers.map((member, index) => {
                console.log(`Rendering member ${index + 1}/${slicedMembers.length}:`, member.name);
                return (
                  <Link
                    key={`member-${member.id}-${startIdx + index}`}
                    href={member.url || '#'}
                    className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-purple-300"
                  >
                    <div className="bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-2">
                      <div className="flex items-center text-purple-700">
                        <FaUser className="text-sm mr-2" />
                        <span className="text-sm font-semibold truncate">
                          {member.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      {member.title && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Title:</span> {member.title}
                        </p>
                      )}
                      {member.role && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {member.role}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            {members.length > itemsPerPage && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setMembersPage(p => Math.max(1, p - 1))}
                  disabled={membersPage === 1}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-gray-700">
                  Page {membersPage} of {Math.ceil(members.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setMembersPage(p => Math.min(Math.ceil(members.length / itemsPerPage), p + 1))}
                  disabled={membersPage === Math.ceil(members.length / itemsPerPage)}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Deals */}
        {deals.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Deals ({deals.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals
                .slice((dealsPage - 1) * itemsPerPage, dealsPage * itemsPerPage)
                .map((deal, index) => (
                  <Link
                    key={`deal-${deal.id}-${(dealsPage - 1) * itemsPerPage + index}`}
                    href={deal.url}
                    className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-blue-300"
                  >
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-blue-700">
                        {deal.type || 'Deal'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 truncate">
                        {deal.property || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Date:</span> {deal.date || 'N/A'}
                      </p>
                      {deal.role && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {deal.role}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
            {deals.length > itemsPerPage && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setDealsPage(p => Math.max(1, p - 1))}
                  disabled={dealsPage === 1}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-gray-700">
                  Page {dealsPage} of {Math.ceil(deals.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setDealsPage(p => Math.min(Math.ceil(deals.length / itemsPerPage), p + 1))}
                  disabled={dealsPage === Math.ceil(deals.length / itemsPerPage)}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stories */}
        {stories.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Stories ({stories.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stories.slice((storiesPage - 1) * itemsPerPage, storiesPage * itemsPerPage).map((story, index) => (
                <div
                  key={`story-${story.id}-${(storiesPage - 1) * itemsPerPage + index}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{story.title}</h3>
                  {story.source && <p className="text-sm text-gray-600 mb-2">Source: {story.source}</p>}
                  {story.url && (
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 inline-block"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              ))}
            </div>
            {stories.length > itemsPerPage && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setStoriesPage(p => Math.max(1, p - 1))}
                  disabled={storiesPage === 1}
                  className="p-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-gray-700">
                  Page {storiesPage} of {Math.ceil(stories.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setStoriesPage(p => Math.min(Math.ceil(stories.length / itemsPerPage), p + 1))}
                  disabled={storiesPage === Math.ceil(stories.length / itemsPerPage)}
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
