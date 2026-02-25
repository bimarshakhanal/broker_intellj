'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FaHandshake, FaUsers, FaBuilding, FaArrowRight, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaUser, FaBriefcase, FaHome, FaStore } from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Deal {
  id: number;
  property: string;
  type?: string;
  price?: string;
  date: string;
  url: string;
}

interface Person {
  id: number;
  name: string;
  title: string;
  role?: string;
  url?: string;
}

interface Organization {
  id: number;
  name: string;
  type?: string;
  url?: string;
}

interface Property {
  id: number;
  name?: string;
  address: string;
  type?: string;
  url: string;
}

export default function Home() {
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  const [recentPeople, setRecentPeople] = useState<Person[]>([]);
  const [recentOrganizations, setRecentOrganizations] = useState<Organization[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dealsRes, peopleRes, orgsRes, propertiesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/deals/recent?limit=20`),
          axios.get(`${API_BASE}/api/people/recent?limit=20`),
          axios.get(`${API_BASE}/api/organizations/recent?limit=20`),
          axios.get(`${API_BASE}/api/properties/recent?limit=20`),
        ]);

        setRecentDeals(dealsRes.data.data);
        setRecentPeople(peopleRes.data.data);
        setRecentOrganizations(orgsRes.data.data);
        setRecentProperties(propertiesRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Real Estate Dashboard</h1>

        {/* Recent Deals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaHandshake className="mr-3 text-blue-600" />
              Recent Deals
            </h2>
            <Link
              href="/deals"
              className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
            >
              See More <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDeals.map((deal, index) => (
              <Link
                key={`deal-${deal.id}-${index}`}
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
                  <h3 className="font-semibold text-gray-900 mb-3 truncate flex items-start">
                    <FaMapMarkerAlt className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{deal.property}</span>
                  </h3>
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
        </section>

        {/* People with Recent Deals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaUsers className="mr-3 text-blue-600" />
              People with Recent Deals
            </h2>
            <Link
              href="/people"
              className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
            >
              See More <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPeople.map((person, index) => (
              <Link
                key={`person-${person.id}-${index}`}
                href={person.url || `/people/${person.id}`}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-purple-300"
              >
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-2">
                  <div className="flex items-center text-purple-700">
                    <FaUser className="text-sm mr-2 flex-shrink-0" />
                    <span className="text-sm font-semibold truncate">
                      {person.name}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaBriefcase className="text-gray-400 mr-2" />
                    {person.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Organizations Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaStore className="mr-3 text-blue-600" />
              Organizations
            </h2>
            <Link
              href="/organizations"
              className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
            >
              See More <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentOrganizations.map((organization, index) => (
              <Link
                key={`org-${organization.id}-${index}`}
                href={organization.url || `/organizations/${organization.id}`}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-orange-300"
              >
                <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-3 py-2">
                  <div className="flex items-center text-orange-700">
                    <FaStore className="text-sm mr-2 flex-shrink-0" />
                    <span className="text-sm font-semibold truncate">
                      {organization.name}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {organization.type && (
                    <p className="text-sm text-gray-600">
                      Type: {organization.type}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Properties Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaBuilding className="mr-3 text-blue-600" />
              Recent Properties
            </h2>
            <Link
              href="/properties"
              className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
            >
              See More <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProperties.map((property, index) => (
              <Link
                key={`property-${property.id}-${index}`}
                href={property.url}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-green-300"
              >
                <div className="bg-gradient-to-r from-green-100 to-green-200 px-3 py-2">
                  <div className="flex items-center text-green-700">
                    <FaHome className="text-sm mr-2" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {property.type || 'Property'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 truncate">
                    {property.name || property.address}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-start">
                    <FaMapMarkerAlt className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{property.address}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
