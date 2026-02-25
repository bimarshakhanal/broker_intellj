'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getPersonDetail } from '@/lib/api';
import { FiArrowLeft } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Script from 'next/script';

interface Deal {
  id: number;
  property: string;
  property_address?: string;
  date: string;
  role?: string;
  url: string;
  type?: string;
}

interface Organization {
  id: string;
  name: string;
  type?: string;
  role?: string;
  url?: string;
}

interface Story {
  id: string;
  title: string;
  content?: string;
  date?: string;
  url?: string;
}

interface PersonDetail {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  image?: string;
  bio?: string;
  deals: Deal[];
  organizations: Organization[];
  stories: Story[];
}

export default function PersonDetailPage({ params }: { params: { id: string } }) {
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [dealsPage, setDealsPage] = useState(1);
  const [orgsPage, setOrgsPage] = useState(1);
  const [storiesPage, setStoriesPage] = useState(1);
  const itemsPerPage = 8;

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true);
        const response = await getPersonDetail(params.id);
        setPerson(response.data);
      } catch (err) {
        setError('Failed to load person details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [params.id]);

  // Cleanup map on person change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if (typeof window !== 'undefined' && (window as any).L) {
      setMapLoaded(true);
    } else {
      setMapLoaded(false);
    }
  }, [params.id]);

  // Initialize map when Leaflet is loaded and we have person data
  useEffect(() => {
    if (!mapLoaded || !person || !mapRef.current || mapInstanceRef.current) return;

    // Clear container
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
    }

    const dealAddresses = (person.deals?.slice(0, 10) || [])
      .filter(deal => deal.property_address)
      .map(deal => ({
        address: deal.property_address!,
        date: deal.date
      }));

    if (dealAddresses.length === 0) return;

    // @ts-ignore
    const L = window.L;
    if (!L) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([40.7128, -74.0060], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Geocode and add markers for each address with delay to avoid rate limiting
    const markerCoordinates: [number, number][] = [];
    let markersAdded = 0;

    dealAddresses.forEach(({ address, date }, index) => {
      // Add delay between requests (2 seconds per request to respect rate limits)
      setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
          headers: {
            'User-Agent': 'BrokerIntellijApp/1.0'
          }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            if (!isNaN(lat) && !isNaN(lon)) {
              // Add marker with red icon
              const redIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });

              const marker = L.marker([lat, lon], { icon: redIcon }).addTo(map);
              marker.bindPopup(`<b>${address}</b><br/>${date || ''}`);

              markerCoordinates.push([lat, lon]);
              markersAdded++;

              // Fit map to bounds after all markers added
              if (markersAdded === dealAddresses.length && markerCoordinates.length > 0) {
                setTimeout(() => {
                  try {
                    if (markerCoordinates.every(coord => !isNaN(coord[0]) && !isNaN(coord[1]))) {
                      const minLat = Math.min(...markerCoordinates.map(c => c[0]));
                      const maxLat = Math.max(...markerCoordinates.map(c => c[0]));
                      const minLon = Math.min(...markerCoordinates.map(c => c[1]));
                      const maxLon = Math.max(...markerCoordinates.map(c => c[1]));

                      if (markerCoordinates.length === 1) {
                        map.setView(markerCoordinates[0], 15);
                      } else {
                        const bounds = L.latLngBounds(
                          L.latLng(minLat, minLon),
                          L.latLng(maxLat, maxLon)
                        );
                        if (bounds.isValid() && map && map._loaded) {
                          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                        }
                      }
                    }
                  } catch (err) {
                    console.error('Error fitting bounds:', err);
                  }
                }, 1000);
              }
            }
          }
        })
        .catch(err => {
          console.error('Geocoding error:', err);
          markersAdded++;
        });
      }, index * 2000); // 2 second delay between each request
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, person]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">Loading...</div></div>;
  }

  if (error || !person) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-red-600">{error || 'Person not found'}</div></div>;
  }

  const deals = person.deals || [];
  const organizations = person.organizations || [];
  const stories = person.stories || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin="anonymous"
        onLoad={() => setMapLoaded(true)}
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin="anonymous"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <FiArrowLeft /> Back to Home
        </Link>

        {/* Person Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{person.name}</h1>
          {person.title && <p className="text-xl text-gray-600 mb-4">{person.title}</p>}
          {person.email && (
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Email:</span> {person.email}
            </p>
          )}
          {person.phone && (
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Phone:</span> {person.phone}
            </p>
          )}
          {person.bio && <p className="text-gray-700 mt-4">{person.bio}</p>}
        </div>

        {/* Deals */}
        {deals.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.slice((dealsPage - 1) * itemsPerPage, dealsPage * itemsPerPage).map((deal, index) => (
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
                    <h3 className="font-semibold text-gray-900 mb-3 truncate">
                      {deal.property}
                    </h3>
                    <p className="text-sm text-gray-600">{deal.date}</p>
                    {deal.role && <p className="text-sm text-gray-600">Role: {deal.role}</p>}
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

        {/* Map Section */}
        {deals.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Deals Locations</h2>
            <div
              ref={mapRef}
              className="w-full h-96 rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* Organizations */}
        {organizations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.slice((orgsPage - 1) * itemsPerPage, orgsPage * itemsPerPage).map((org, index) => (
                <Link
                  key={`org-${org.id}-${(orgsPage - 1) * itemsPerPage + index}`}
                  href={org.url || '#'}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-orange-300"
                >
                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-3 py-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-orange-700">
                      Organization
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{org.name}</h3>
                    {org.role && <p className="text-sm text-gray-600">Role: {org.role}</p>}
                  </div>
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

        {/* Stories */}
        {stories.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stories.slice((storiesPage - 1) * itemsPerPage, storiesPage * itemsPerPage).map((story, index) => (
                <div
                  key={`story-${story.id}-${(storiesPage - 1) * itemsPerPage + index}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{story.title}</h3>
                  {story.content && <p className="text-sm text-gray-600 mb-2">{story.content}</p>}
                  {story.date && <p className="text-xs text-gray-500">{story.date}</p>}
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
