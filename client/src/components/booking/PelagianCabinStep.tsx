import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { pelagianCabins } from '../../lib/booking-data';
import { Check, Info } from 'lucide-react';

interface PelagianCabinStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const PelagianCabinStep = ({ onNext, onPrev }: PelagianCabinStepProps) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  const selectedCabinId = watch('pelagianCabinId');
  
  const handleContinue = () => {
    if (selectedCabinId) {
      onNext();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-wakatobi-primary mb-6">Select Your Pelagian Cabin</h2>
      
      <div className="mb-6">
        <p className="flex items-center text-gray-600 mb-4">
          <Info className="h-5 w-5 mr-2" />
          <span>Choose your preferred cabin onboard the Pelagian luxury dive yacht.</span>
        </p>
        
        <Controller
          name="pelagianCabinId"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {pelagianCabins.map(cabin => (
                <div 
                  key={cabin.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCabinId === cabin.id
                      ? 'border-wakatobi-secondary bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setValue('pelagianCabinId', cabin.id);
                    field.onChange(cabin.id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-wakatobi-primary">{cabin.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">${cabin.pricePerNight} per person per night</p>
                    </div>
                    {selectedCabinId === cabin.id && (
                      <div className="bg-wakatobi-secondary text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{cabin.description}</p>
                  
                  {cabin.image && (
                    <div className="mt-2 rounded-md overflow-hidden h-36">
                      <img src={cabin.image} alt={cabin.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  {cabin.features && cabin.features.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700">Features:</h4>
                      <ul className="flex flex-wrap mt-1 gap-1">
                        {cabin.features.map((feature, index) => (
                          <li key={index} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        />
        
        {errors.pelagianCabinId && (
          <p className="text-red-500 text-sm mt-1">{errors.pelagianCabinId.message as string}</p>
        )}
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedCabinId}
          className={`${
            selectedCabinId
              ? 'bg-wakatobi-secondary hover:bg-orange-600'
              : 'bg-gray-300 cursor-not-allowed'
          } text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center`}
        >
          Continue
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PelagianCabinStep;