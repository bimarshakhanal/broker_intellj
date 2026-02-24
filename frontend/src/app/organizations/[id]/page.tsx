'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrganizationDetail } from '@/lib/api';
import { FiArrowLeft } from 'react-icons/fi';

interface Person {
  id: string;
  name: string;
  title?: string;
}

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

interface OrganizationDetail {
  id: string;
  name: string;
  type?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  members: Person[];
  deals: Deal[];
  stories: Story[];
}

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const response = await getOrganizationDetail(params.id);
        setOrganization(response.data);
      } catch (err) {
        setError('Failed to load organization details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !organization) {
    return <div className="text-center py-12 text-red-600">{error || 'Organization not found'}</div>;
  }

  return (
    <div>
      <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <FiArrowLeft /> Back to People
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex gap-8">
          {organization.logo && (
            <img 
              src={organization.logo} 
              alt={organization.name} 
              className="w-48 h-48 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{organization.name}</h1>
            {organization.type && (
              <p className="text-xl text-gray-600 mb-4">{organization.type}</p>
            )}
            
            <div className="space-y-2 text-gray-700 mb-6">
              {organization.website && (
                <p><strong>Website:</strong> <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">{organization.website}</a></p>
              )}
              {organization.email && <p><strong>Email:</strong> {organization.email}</p>}
              {organization.phone && <p><strong>Phone:</strong> {organization.phone}</p>}
              {organization.address && <p><strong>Address:</strong> {organization.address}</p>}
            </div>

            {organization.description && (
              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-gray-700">{organization.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      {organization.members && organization.members.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organization.members.map((member) => (
              <Link key={member.id} href={`/people/${member.id}`}>
                <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  {member.title && <p className="text-gray-600">{member.title}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Deals */}
      {organization.deals && organization.deals.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organization.deals.map((deal) => (
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
      {organization.stories && organization.stories.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Related Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organization.stories.map((story) => (
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
