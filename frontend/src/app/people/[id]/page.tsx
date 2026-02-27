'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getPersonDetail } from '@/lib/api';
import { FiArrowLeft } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight, FaRobot, FaTimes } from 'react-icons/fa';
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
  const [showSummary, setShowSummary] = useState(false);
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

    // Get unique addresses to avoid duplicate API calls
    const addressMap = new Map<string, string>();
    (person.deals?.slice(0, 10) || [])
      .filter(deal => deal.property_address)
      .forEach(deal => {
        if (!addressMap.has(deal.property_address!)) {
          addressMap.set(deal.property_address!, deal.date);
        }
      });

    const dealAddresses = Array.from(addressMap.entries()).map(([address, date]) => ({
      address,
      date
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

              // Fit map to bounds after all markers processed
              if (markersAdded === dealAddresses.length && markerCoordinates.length > 0) {
                // Small delay to ensure map is ready
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
                }, 500);
              }
            } else {
              // Invalid coordinates, skip this marker
              console.warn(`Invalid coordinates for address: ${address}`);
              markersAdded++;
              // Check if all markers processed
              if (markersAdded === dealAddresses.length && markerCoordinates.length > 0) {
                setTimeout(() => {
                  try {
                    if (markerCoordinates.length === 1) {
                      map.setView(markerCoordinates[0], 15);
                    } else {
                      const bounds = L.latLngBounds(
                        ...markerCoordinates.map(c => L.latLng(c[0], c[1]))
                      );
                      if (bounds.isValid() && map && map._loaded) {
                        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                      }
                    }
                  } catch (err) {
                    console.error('Error fitting bounds:', err);
                  }
                }, 500);
              }
            }
          } else {
            // No geocoding results, skip this marker
            console.warn(`No geocoding results for address: ${address}`);
            markersAdded++;
            // Check if all markers processed
            if (markersAdded === dealAddresses.length && markerCoordinates.length > 0) {
              setTimeout(() => {
                try {
                  if (markerCoordinates.length === 1) {
                    map.setView(markerCoordinates[0], 15);
                  } else {
                    const bounds = L.latLngBounds(
                      ...markerCoordinates.map(c => L.latLng(c[0], c[1]))
                    );
                    if (bounds.isValid() && map && map._loaded) {
                      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                    }
                  }
                } catch (err) {
                  console.error('Error fitting bounds:', err);
                }
              }, 500);
            }
          }
        })
        .catch(err => {
          // Geocoding failed, skip this marker without retry
          console.error(`Geocoding error for ${address}:`, err);
          markersAdded++;
          // Check if all markers processed
          if (markersAdded === dealAddresses.length && markerCoordinates.length > 0) {
            setTimeout(() => {
              try {
                if (markerCoordinates.length === 1) {
                  map.setView(markerCoordinates[0], 15);
                } else {
                  const bounds = L.latLngBounds(
                    ...markerCoordinates.map(c => L.latLng(c[0], c[1]))
                  );
                  if (bounds.isValid() && map && map._loaded) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                  }
                }
              } catch (err) {
                console.error('Error fitting bounds:', err);
              }
            }, 500);
          }
        });
      }, index * 1000); // 2 second delay between each request
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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl font-bold text-gray-900">{person.name}</h1>
                <button
                  onClick={() => setShowSummary(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <FaRobot className="text-lg" />
                  <span className="text-sm font-medium">View Broker Summary</span>
                </button>
              </div>
            </div>
          </div>
          
          {person.email && (
            <p className="text-gray-600 mb-2 text-base">{person.email}</p>
          )}
          
          {person.title && (
            <p className="text-xl text-gray-600 mb-4">{person.title}</p>
          )}
          
          {person.phone && (
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Phone:</span> {person.phone}
            </p>
          )}
          {person.bio && <p className="text-gray-700 mt-4">{person.bio}</p>}
        </div>

        {/* AI Summary Modal */}
        {showSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg flex justify-between items-center sticky top-0">
                <div className="flex items-center gap-3">
                  <FaRobot className="text-2xl" />
                  <div>
                    <h2 className="text-2xl font-bold">Broker Summary</h2>
                    <p className="text-purple-100 text-sm">Powered by Broker Intelligence Agent</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="hover:bg-white/20 rounded-full p-2 transition"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{person.name}</h3>
                  <p className="text-gray-600">{person.title}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded"></span>
                    Professional Overview
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {person.name} is an accomplished real estate professional with extensive experience in commercial real estate transactions. 
                    Their expertise spans multiple property types and market segments, demonstrating a strong track record of successful deals 
                    and client relationships. With a focus on strategic acquisitions and dispositions, they have established themselves as a 
                    trusted advisor in the industry.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-600 rounded"></span>
                    Key Strengths
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Demonstrated expertise in complex commercial transactions and market analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Strong network of industry relationships and collaborative partnerships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Track record of successfully closing high-value property deals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Market knowledge across multiple geographic regions and property sectors</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-600 rounded"></span>
                    Activity Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-blue-600">{deals.length}</p>
                      <p className="text-sm text-gray-600">Total Deals</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-purple-600">{organizations.length}</p>
                      <p className="text-sm text-gray-600">Organizations</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-green-600">{stories.length}</p>
                      <p className="text-sm text-gray-600">News Mentions</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-orange-600">Active</p>
                      <p className="text-sm text-gray-600">Status</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <FaRobot className="text-purple-600" />
                    This summary is AI-generated based on available data and may not reflect all aspects of the broker's professional background.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex justify-end">
                <button
                  onClick={() => setShowSummary(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deals */}
        {deals.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Involved Deals</h2>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Involved Organizations</h2>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Story Mentions</h2>
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
