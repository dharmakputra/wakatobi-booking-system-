import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { accommodations } from '@/lib/booking-data';

interface AccommodationStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const AccommodationStep: React.FC<AccommodationStepProps> = ({ onNext, onPrev }) => {
  const { setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  const selectedAccommodationId = watch('accommodationId');
  const tripType = watch('tripType');
  const combinationOrder = watch('combinationOrder');

  const handleSelectAccommodation = (id: string) => {
    setValue('accommodationId', id, { shouldValidate: true });
  };

  return (
    <div id="step-3" className="step-content">
      <h2 className="text-2xl font-montserrat font-semibold text-wakatobi-primary mb-6">
        Select Your Accommodation
      </h2>
      <p className="mb-6 text-gray-600">
        All rates are per person per night. Choose the accommodation that best suits your needs.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {accommodations.map((accommodation) => (
          <div 
            key={accommodation.id}
            className={`accommodation-option border rounded-lg overflow-hidden hover:shadow-lg transition-all ${
              selectedAccommodationId === accommodation.id ? 'border-wakatobi-primary shadow-md' : 'border-gray-300'
            }`}
          >
            <img 
              src={accommodation.image} 
              alt={accommodation.name} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-montserrat font-semibold text-lg">{accommodation.name}</h3>
                <div className="text-wakatobi-primary font-bold text-lg">
                  ${accommodation.pricePerNight}
                  <span className="text-sm font-normal">/person/night</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-2 mb-4">{accommodation.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {accommodation.features.map((feature, index) => (
                  <span 
                    key={index} 
                    className="bg-wakatobi-light text-wakatobi-primary text-xs py-1 px-2 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <button 
                type="button"
                onClick={() => handleSelectAccommodation(accommodation.id)}
                className={`w-full font-medium py-2 rounded transition-all ${
                  selectedAccommodationId === accommodation.id 
                    ? 'bg-wakatobi-primary text-white hover:bg-wakatobi-dark' 
                    : 'bg-white border border-wakatobi-primary text-wakatobi-primary hover:bg-wakatobi-light'
                }`}
              >
                {selectedAccommodationId === accommodation.id ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {errors.accommodationId && (
        <p className="text-red-500 mt-2">{errors.accommodationId.message as string}</p>
      )}
      
      <div className="mt-8 flex justify-between">
        <button 
          type="button"
          onClick={onPrev}
          className="border border-wakatobi-primary text-wakatobi-primary font-semibold py-3 px-6 rounded-lg hover:bg-wakatobi-light transition-all flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Guests
        </button>
        <button 
          type="button"
          onClick={onNext}
          className="bg-wakatobi-secondary hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
        >
          {tripType === 'resort-only' ? (
            <>Continue to Activities</>
          ) : tripType === 'combination-stay' && combinationOrder === 'resort-first' ? (
            <>Continue to Pelagian Dates</>
          ) : (
            <>Continue to Next Step</>
          )}
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default AccommodationStep;
