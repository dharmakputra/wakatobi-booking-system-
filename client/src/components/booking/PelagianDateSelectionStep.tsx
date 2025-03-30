import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { format, addDays, differenceInCalendarDays, isMonday } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Info } from 'lucide-react';
import { BookingFormData } from '@shared/schema';

interface PelagianDateSelectionStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const PelagianDateSelectionStep = ({ onNext, onPrev }: PelagianDateSelectionStepProps) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  
  const pelagianArrivalDate = watch('pelagianArrivalDate');
  const pelagianDepartureDate = watch('pelagianDepartureDate');
  
  const [departureDateMonth, setDepartureDateMonth] = useState<Date | undefined>(
    pelagianArrivalDate ? new Date(pelagianArrivalDate) : undefined
  );
  
  const [nights, setNights] = useState<number | null>(null);
  
  useEffect(() => {
    if (pelagianArrivalDate && pelagianDepartureDate) {
      const nightCount = differenceInCalendarDays(pelagianDepartureDate, pelagianArrivalDate);
      setNights(nightCount);
    } else {
      setNights(null);
    }
  }, [pelagianArrivalDate, pelagianDepartureDate]);
  
  // When arrival date changes, we might need to update departure date month view
  useEffect(() => {
    if (pelagianArrivalDate) {
      setDepartureDateMonth(new Date(pelagianArrivalDate));
    }
  }, [pelagianArrivalDate]);
  
  const handleContinue = () => {
    if (pelagianArrivalDate && pelagianDepartureDate) {
      onNext();
    }
  };
  
  // Custom disabledDays function to only allow Mondays for arrival date
  const disabledArrivalDays = (date: Date) => {
    return !isMonday(date);
  };
  
  // Custom disabledDays function to only allow Mondays for departure date
  const disabledDepartureDays = (date: Date) => {
    // Only allow Mondays and ensure it's after the arrival date
    if (!isMonday(date)) return true;
    if (pelagianArrivalDate && date <= pelagianArrivalDate) return true;
    return false;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-wakatobi-primary mb-6">Select Pelagian Dates</h2>
      
      <div className="mb-6 flex items-center bg-blue-50 p-4 rounded-md">
        <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
        <p className="text-blue-700 text-sm">
          The Pelagian yacht operates on a weekly schedule, with cruises starting and ending on Mondays only.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="date-selection">
          <label className="block text-wakatobi-primary font-medium mb-2">Cruise Start Date (Monday)</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Controller
              name="pelagianArrivalDate"
              control={control}
              render={({ field }) => (
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(date);
                      
                      // Automatically set departure date to one week later if not already set
                      if (!pelagianDepartureDate) {
                        const defaultDeparture = addDays(date, 7);
                        setValue('pelagianDepartureDate', defaultDeparture);
                      }
                    }
                  }}
                  disabled={disabledArrivalDays}
                  className="rounded-md border-0"
                />
              )}
            />
          </div>
          {errors.pelagianArrivalDate && (
            <p className="text-red-500 text-sm mt-1">{errors.pelagianArrivalDate.message as string}</p>
          )}
        </div>
        
        <div className="date-selection">
          <label className="block text-wakatobi-primary font-medium mb-2">Cruise End Date (Monday)</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Controller
              name="pelagianDepartureDate"
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
          {errors.pelagianDepartureDate && (
            <p className="text-red-500 text-sm mt-1">{errors.pelagianDepartureDate.message as string}</p>
          )}
        </div>
      </div>
      
      {pelagianArrivalDate && pelagianDepartureDate && (
        <div className="mt-6 p-4 bg-wakatobi-light rounded-lg">
          <p className="text-wakatobi-primary flex items-start">
            <Info className="h-5 w-5 mr-2 mt-0.5" />
            <span>
              Your selected cruise: 
              <strong> {format(pelagianArrivalDate, 'MMMM d, yyyy')} - {format(pelagianDepartureDate, 'MMMM d, yyyy')}</strong> 
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
          disabled={!pelagianArrivalDate || !pelagianDepartureDate}
          className={`${
            pelagianArrivalDate && pelagianDepartureDate
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

export default PelagianDateSelectionStep;