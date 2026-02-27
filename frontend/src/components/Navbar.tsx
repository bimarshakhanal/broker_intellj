'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUsers, FaHandshake, FaBuilding, FaNewspaper, FaStore, FaSearch } from 'react-icons/fa';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/people', label: 'People', icon: FaUsers },
    { href: '/organizations', label: 'Organizations', icon: FaStore },
    { href: '/deals', label: 'Deals', icon: FaHandshake },
    { href: '/properties', label: 'Properties', icon: FaBuilding },
    { href: '/stories', label: 'Stories', icon: FaNewspaper },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Navigation Links */}
          <div className="flex space-x-8">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || 
                              (link.href !== '/' && pathname?.startsWith(link.href));
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="mr-2" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="flex-shrink-0 w-80">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
