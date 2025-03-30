import React from 'react';
import { Link } from 'wouter';
import { Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-wakatobi-primary shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img
            src="https://www.wakatobi.com/wp-content/themes/wakatobi/dist/images/logo-wakatobi-white.svg"
            alt="Wakatobi Resort"
            className="h-10"
          />
        </Link>
        <nav className="hidden md:flex space-x-6 text-white">
          <Link href="#" className="hover:text-wakatobi-secondary transition">Experience</Link>
          <Link href="#" className="hover:text-wakatobi-secondary transition">Accommodations</Link>
          <Link href="#" className="hover:text-wakatobi-secondary transition">Diving & Snorkeling</Link>
          <Link href="/booking" className="font-semibold text-wakatobi-secondary">Book Now</Link>
        </nav>
        <button className="md:hidden text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
