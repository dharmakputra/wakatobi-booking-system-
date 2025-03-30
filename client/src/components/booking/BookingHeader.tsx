import React from 'react';

const BookingHeader: React.FC = () => {
  return (
    <div className="mb-10 text-center">
      <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-wakatobi-primary mb-2">
        Book Your Wakatobi Experience
      </h1>
      <p className="text-wakatobi-greyDark text-lg max-w-3xl mx-auto">
        Complete the following steps to create your custom Wakatobi package and receive a price quotation.
      </p>
    </div>
  );
};

export default BookingHeader;
