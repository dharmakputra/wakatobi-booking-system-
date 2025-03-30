import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { accommodations, pelagianCabins } from '@/lib/booking-data';
import { formatCurrency } from '@/lib/utils';

interface CombinedAccommodationStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const CombinedAccommodationStep: React.FC<CombinedAccommodationStepProps> = ({ onNext, onPrev }) => {
  const { register, setValue, watch, trigger, formState: { errors } } = useFormContext<BookingFormData>();
  
  const tripType = watch('tripType');
  const combinationOrder = watch('combinationOrder');
  const accommodationId = watch('accommodationId');
  const pelagianCabinId = watch('pelagianCabinId');
  
  // Handle Continue button click
  const handleContinue = async () => {
    // For combination stays, we need to validate both resort and Pelagian selections
    const isValid1 = await trigger('accommodationId');
    const isValid2 = await trigger('pelagianCabinId');
    
    if (isValid1 && isValid2) {
      onNext();
    }
  };

  return (
    <div id="step-4" className="step-content">
      <h2 className="text-2xl font-montserrat font-semibold text-wakatobi-primary mb-6">
        Select Your Accommodations
      </h2>
      
      {/* Order display - helps the user understand the booking flow */}
      {tripType === 'combination-stay' && (
        <div className="mb-6 bg-wakatobi-light p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-wakatobi-primary mb-2">Your Booking Order</h3>
          <div className="flex items-center">
            <div className="flex-1 text-center p-2 border-r border-wakatobi-primary">
              <span className="inline-block w-8 h-8 rounded-full bg-wakatobi-primary text-white flex items-center justify-center mb-2">1</span>
              <p className="font-medium">{combinationOrder === 'resort-first' ? 'Resort Stay' : 'Pelagian Yacht'}</p>
            </div>
            <div className="flex-1 text-center p-2">
              <span className="inline-block w-8 h-8 rounded-full bg-wakatobi-primary text-white flex items-center justify-center mb-2">2</span>
              <p className="font-medium">{combinationOrder === 'resort-first' ? 'Pelagian Yacht' : 'Resort Stay'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Resort Accommodation Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-montserrat font-semibold text-wakatobi-primary mb-4">
          Resort Accommodation
        </h3>
        <p className="text-gray-600 mb-4">
          Choose from our range of beautiful accommodations at the resort. All prices are per person per night.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {accommodations.map((accommodation) => (
            <div 
              key={accommodation.id}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${accommodationId === accommodation.id ? 'border-wakatobi-primary bg-wakatobi-light/50' : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => setValue('accommodationId', accommodation.id, { shouldValidate: true })}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-montserrat font-semibold text-lg">{accommodation.name}</h4>
                  <p className="text-gray-600 mt-1">{accommodation.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-wakatobi-primary font-semibold">
                    {formatCurrency(accommodation.pricePerNight)}
                  </p>
                  <p className="text-sm text-gray-500">per person/night</p>
                </div>
              </div>
              {accommodation.features && (
                <div className="mt-3 text-sm">
                  <h5 className="font-medium text-wakatobi-primary">Features:</h5>
                  <ul className="list-disc list-inside mt-1 text-gray-600">
                    {accommodation.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Hidden field for form validation */}
        <input type="hidden" {...register('accommodationId')} />
        
        {errors.accommodationId && (
          <p className="text-red-500 text-sm mt-1">{errors.accommodationId.message as string}</p>
        )}
      </div>
      
      {/* Pelagian Cabin Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-montserrat font-semibold text-wakatobi-primary mb-4">
          Pelagian Yacht Cabin
        </h3>
        <p className="text-gray-600 mb-4">
          Select your preferred cabin on the luxury dive yacht Pelagian. All prices are per person per night.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {pelagianCabins.map((cabin) => (
            <div 
              key={cabin.id}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${pelagianCabinId === cabin.id ? 'border-wakatobi-primary bg-wakatobi-light/50' : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => setValue('pelagianCabinId', cabin.id, { shouldValidate: true })}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-montserrat font-semibold text-lg">{cabin.name}</h4>
                  <p className="text-gray-600 mt-1">{cabin.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-wakatobi-primary font-semibold">
                    {formatCurrency(cabin.pricePerNight)}
                  </p>
                  <p className="text-sm text-gray-500">per person/night</p>
                </div>
              </div>
              {cabin.features && (
                <div className="mt-3 text-sm">
                  <h5 className="font-medium text-wakatobi-primary">Features:</h5>
                  <ul className="list-disc list-inside mt-1 text-gray-600">
                    {cabin.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Hidden field for form validation */}
        <input type="hidden" {...register('pelagianCabinId')} />
        
        {errors.pelagianCabinId && (
          <p className="text-red-500 text-sm mt-1">{errors.pelagianCabinId.message as string}</p>
        )}
      </div>
      
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
          onClick={handleContinue}
          className={`
            ${(accommodationId && pelagianCabinId) ? 'bg-wakatobi-secondary hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'}
            text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center
          `}
          disabled={!accommodationId || !pelagianCabinId}
        >
          Continue to Activities
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default CombinedAccommodationStep;