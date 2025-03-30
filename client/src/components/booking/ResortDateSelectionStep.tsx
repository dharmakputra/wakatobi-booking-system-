import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { format, addDays, differenceInCalendarDays, isMonday, isFriday } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Info } from 'lucide-react';
import { BookingFormData } from '@shared/schema';

interface ResortDateSelectionStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const ResortDateSelectionStep = ({ onNext, onPrev }: ResortDateSelectionStepProps) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  
  const resortArrivalDate = watch('resortArrivalDate');
  const resortDepartureDate = watch('resortDepartureDate');
  
  const [departureDateMonth, setDepartureDateMonth] = useState<Date | undefined>(
    resortArrivalDate ? new Date(resortArrivalDate) : undefined
  );
  
  const [nights, setNights] = useState<number | null>(null);
  
  // Calculate nights between arrival and departure
  useEffect(() => {
    if (resortArrivalDate && resortDepartureDate) {
      const nightCount = differenceInCalendarDays(resortDepartureDate, resortArrivalDate);
      setNights(nightCount);
    } else {
      setNights(null);
    }
  }, [resortArrivalDate, resortDepartureDate]);
  
  // When arrival date changes, update departure date month view
  useEffect(() => {
    if (resortArrivalDate) {
      // Set departure date month view to arrival date initially
      setDepartureDateMonth(new Date(resortArrivalDate));
      
      // If arrival date is near the end of the month, show next month for departure
      const arrivalDay = resortArrivalDate.getDate();
      const totalDaysInMonth = new Date(
        resortArrivalDate.getFullYear(),
        resortArrivalDate.getMonth() + 1,
        0
      ).getDate();
      
      // If arrival date is within 7 days of the end of the month, show next month
      if (totalDaysInMonth - arrivalDay < 7) {
        const nextMonth = new Date(resortArrivalDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setDepartureDateMonth(nextMonth);
      }
    }
  }, [resortArrivalDate]);
  
  const handleContinue = () => {
    if (resortArrivalDate && resortDepartureDate) {
      onNext();
    }
  };
  
  // Only allow Mondays and Fridays for arrival
  const isMonFriOnly = (date: Date) => {
    return isMonday(date) || isFriday(date);
  };
  
  // Check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  // Custom disabledDays function
  const disabledArrivalDays = (date: Date) => {
    // Disable past dates and non-Monday/Friday dates
    if (isPastDate(date) || !isMonFriOnly(date)) {
      return true;
    }
    return false;
  };
  
  // Custom disabledDays function for departure dates
  const disabledDepartureDays = (date: Date) => {
    // Disable past dates and non-Monday/Friday dates
    if (isPastDate(date) || !isMonFriOnly(date)) {
      return true;
    }
    
    // Disable dates before arrival date
    if (resortArrivalDate && date <= resortArrivalDate) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-wakatobi-primary mb-6">Select Resort Dates</h2>
      
      <div className="mb-6 flex items-center bg-blue-50 p-4 rounded-md">
        <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
        <p className="text-blue-700 text-sm">
          Resort flights are available on Mondays and Fridays only. Please select your arrival and departure dates accordingly.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="date-selection">
          <label className="block text-wakatobi-primary font-medium mb-2">Arrival Date (Mon/Fri)</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Controller
              name="resortArrivalDate"
              control={control}
              render={({ field }) => (
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => date && field.onChange(date)}
                  disabled={disabledArrivalDays}
                  className="rounded-md border-0"
                />
              )}
            />
          </div>
          {errors.resortArrivalDate && (
            <p className="text-red-500 text-sm mt-1">{errors.resortArrivalDate.message as string}</p>
          )}
        </div>
        
        <div className="date-selection">
          <label className="block text-wakatobi-primary font-medium mb-2">Departure Date (Mon/Fri)</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Controller
              name="resortDepartureDate"
              control={control}
              render={({ field }) => (
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => date && field.onChange(date)}
                  disabled={disabledDepartureDays}
                  month={departureDateMonth}
                  onMonthChange={setDepartureDateMonth}
                  className="rounded-md border-0"
                />
              )}
            />
          </div>
          {errors.resortDepartureDate && (
            <p className="text-red-500 text-sm mt-1">{errors.resortDepartureDate.message as string}</p>
          )}
        </div>
      </div>
      
      {resortArrivalDate && resortDepartureDate && (
        <div className="mt-6 p-4 bg-wakatobi-light rounded-lg">
          <p className="text-wakatobi-primary flex items-start">
            <Info className="h-5 w-5 mr-2 mt-0.5" />
            <span>
              Your selected stay: 
              <strong> {format(resortArrivalDate, 'MMMM d, yyyy')} - {format(resortDepartureDate, 'MMMM d, yyyy')}</strong> 
              {nights && <span> ({nights} nights)</span>}
            </span>
          </p>
        </div>
      )}
      
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
          disabled={!resortArrivalDate || !resortDepartureDate}
          className={`${
            resortArrivalDate && resortDepartureDate
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

export default ResortDateSelectionStep;