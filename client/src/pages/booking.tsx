import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingHeader from '@/components/booking/BookingHeader';
import BookingSteps from '@/components/booking/BookingSteps';

const BookingPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <BookingHeader />
        <BookingSteps />
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
