import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Calendar } from '@/components/ui/calendar';
import { isBefore, addDays, differenceInDays, isMonday, isFriday, format } from 'date-fns';
import { Info } from 'lucide-react';
import { BookingFormData } from '@shared/schema';

interface DateSelectionStepProps {
  onNext: () => void;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({ onNext }) => {
  const { setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  const arrivalDate = watch('arrivalDate');
  const departureDate = watch('departureDate');
  
  // Calculate minimum departure date as arrival date + 1 day
  const minDepartureDate = arrivalDate ? addDays(arrivalDate, 1) : undefined;
  
  // Calculate nights between arrival and departure dates
  const nights = arrivalDate && departureDate ? 
    differenceInDays(departureDate, arrivalDate) :
    undefined;

  // Enforce Monday and Friday only restriction
  const isMonFriOnly = (date: Date) => {
    return isMonday(date) || isFriday(date);
  };

  // Disable dates in the past
  const isPastDate = (date: Date) => {
    return isBefore(date, new Date());
  };
  
  // Disable non Monday/Friday dates and past dates for arrival
  const disabledArrivalDays = (date: Date) => {
    return !isMonFriOnly(date) || isPastDate(date);
  };
  
  // Disable non Monday/Friday dates, past dates, and dates before arrival for departure
  const disabledDepartureDays = (date: Date) => {
    return !isMonFriOnly(date) || 
      isPastDate(date) || 
      (arrivalDate ? isBefore(date, arrivalDate) : false);
  };

  // Handle continue button click
  const handleContinue = () => {
    if (arrivalDate && departureDate) {
      onNext();
    } else {
      if (!arrivalDate) setValue('arrivalDate', undefined, { shouldValidate: true });
      if (!departureDate) setValue('departureDate', undefined, { shouldValidate: true });
    }
  };

  return (
    <div id="step-1" className="step-content">
      <h2 className="text-2xl font-montserrat font-semibold text-wakatobi-primary mb-6">
        Select Your Travel Dates
      </h2>
      <p className="mb-6 text-gray-600">
        Please note that flights to Wakatobi operate on <strong>Mondays and Fridays only</strong>. 
        Your journey will start and end on these days.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="date-selection">
          <label className="block text-wakatobi-primary font-medium mb-2">Arrival Date</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Calendar
              mode="single"
              selected={arrivalDate}
              onSelect={(date) => setValue('arrivalDate', date, { shouldValidate: true })}
              onlyMonFri={true}
              disabledDays={isPastDate}
              className="rounded-md border-0"
            />
          </div>
          {errors.arrivalDate && (
            <p className="text-red-500 text-sm mt-1">{errors.arrivalDate.message as string}</p>
          )}
        </div>
        
        <div className="date-selection">
          <label className="block text-wakatobi-primary font-medium mb-2">Departure Date</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Calendar
              mode="single"
              selected={departureDate}
              onSelect={(date) => setValue('departureDate', date, { shouldValidate: true })}
              onlyMonFri={true}
              disabled={!arrivalDate}
              disabledDays={disabledDepartureDays}
              className="rounded-md border-0"
            />
          </div>
          {errors.departureDate && (
            <p className="text-red-500 text-sm mt-1">{errors.departureDate.message as string}</p>
          )}
        </div>
      </div>
      
      {arrivalDate && departureDate && (
        <div className="mt-6 p-4 bg-wakatobi-light rounded-lg">
          <p className="text-wakatobi-primary flex items-start">
            <Info className="h-5 w-5 mr-2 mt-0.5" />
            <span>
              Your selected stay: 
              <strong> {format(arrivalDate, 'MMMM d, yyyy')} - {format(departureDate, 'MMMM d, yyyy')}</strong> 
              {nights && <span> ({nights} nights)</span>}
            </span>
          </p>
        </div>
      )}
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="bg-wakatobi-secondary hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
        >
          Continue to Guests
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DateSelectionStep;
