import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { addDays, format, isMonday, isFriday, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface CombinedDateSelectionStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const CombinedDateSelectionStep: React.FC<CombinedDateSelectionStepProps> = ({ onNext, onPrev }) => {
  const { setValue, watch, trigger, formState: { errors } } = useFormContext<BookingFormData>();
  
  const tripType = watch('tripType');
  const combinationOrder = watch('combinationOrder');
  
  // Resort dates
  const resortArrivalDate = watch('resortArrivalDate');
  const resortDepartureDate = watch('resortDepartureDate');
  
  // Pelagian dates
  const pelagianArrivalDate = watch('pelagianArrivalDate');
  const pelagianDepartureDate = watch('pelagianDepartureDate');

  // Handle Continue button click
  const handleContinue = async () => {
    let isValid = true;
    
    if (tripType === 'resort-only') {
      isValid = await trigger(['resortArrivalDate', 'resortDepartureDate']);
    } else if (tripType === 'pelagian-only') {
      isValid = await trigger(['pelagianArrivalDate', 'pelagianDepartureDate']);
    } else if (tripType === 'combination-stay') {
      isValid = await trigger(['resortArrivalDate', 'resortDepartureDate', 'pelagianArrivalDate', 'pelagianDepartureDate']);
    }
    
    if (isValid) {
      onNext();
    }
  };

  // Resort date validation and selection
  const isPastDate = (date: Date) => {
    const today = startOfDay(new Date());
    return date < today;
  };

  const isMonFri = (date: Date) => {
    return isMonday(date) || isFriday(date);
  };

  const disabledResortArrivalDays = (date: Date) => {
    return !isMonFri(date) || isPastDate(date);
  };

  const disabledResortDepartureDays = (date: Date) => {
    if (!resortArrivalDate) return true;
    if (date < resortArrivalDate) return true;
    return !isMonFri(date);
  };

  // Pelagian date validation and selection (only Mondays)
  const isMonday = (date: Date) => {
    return isMonday(date);
  };

  const disabledPelagianArrivalDays = (date: Date) => {
    return !isMonday(date) || isPastDate(date);
  };

  const disabledPelagianDepartureDays = (date: Date) => {
    if (!pelagianArrivalDate) return true;
    if (date < pelagianArrivalDate) return true;
    return !isMonday(date);
  };

  // Auto-suggest departure date (7 days after arrival for Pelagian, next Mon/Fri for Resort)
  const handleResortArrivalChange = (date: Date) => {
    setValue('resortArrivalDate', date, { shouldValidate: true });
    
    // If no departure date is set, suggest the next Monday or Friday
    if (!resortDepartureDate) {
      let suggestedDeparture = addDays(date, 7); // Start with +7 days
      
      // Make sure it's a Monday or Friday
      while (!isMonFri(suggestedDeparture)) {
        suggestedDeparture = addDays(suggestedDeparture, 1);
      }
      
      setValue('resortDepartureDate', suggestedDeparture, { shouldValidate: true });
    }
  };

  const handlePelagianArrivalChange = (date: Date) => {
    setValue('pelagianArrivalDate', date, { shouldValidate: true });
    
    // If no departure date is set, suggest the next Monday (Pelagian trips are usually 7 days)
    if (!pelagianDepartureDate) {
      const suggestedDeparture = addDays(date, 7);
      setValue('pelagianDepartureDate', suggestedDeparture, { shouldValidate: true });
    }
  };

  return (
    <div id="step-2" className="step-content">
      <h2 className="text-2xl font-montserrat font-semibold text-wakatobi-primary mb-6">
        Select Your Travel Dates
      </h2>
      
      {/* Resort Date Selection - Show for Resort and Combination stays */}
      {(tripType === 'resort-only' || tripType === 'combination-stay') && (
        <div className="mb-8">
          <h3 className="text-xl font-montserrat font-semibold text-wakatobi-primary mb-4">
            Resort Stay Dates
          </h3>
          <p className="text-gray-600 mb-4">
            Flights to and from the resort operate only on Mondays and Fridays. Please select your arrival and departure dates accordingly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Resort Arrival Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resort Arrival Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !resortArrivalDate && "text-muted-foreground",
                      errors.resortArrivalDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {resortArrivalDate ? (
                      format(resortArrivalDate, "PPP")
                    ) : (
                      <span>Select arrival date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={resortArrivalDate}
                    onSelect={(date) => date && handleResortArrivalChange(date)}
                    disabled={disabledResortArrivalDays}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.resortArrivalDate && (
                <p className="text-red-500 text-sm mt-1">{errors.resortArrivalDate.message as string}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Only Mondays and Fridays available</p>
            </div>
            
            {/* Resort Departure Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resort Departure Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !resortDepartureDate && "text-muted-foreground",
                      errors.resortDepartureDate && "border-red-500"
                    )}
                    disabled={!resortArrivalDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {resortDepartureDate ? (
                      format(resortDepartureDate, "PPP")
                    ) : (
                      <span>Select departure date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={resortDepartureDate}
                    onSelect={(date) => date && setValue('resortDepartureDate', date, { shouldValidate: true })}
                    disabled={disabledResortDepartureDays}
                    initialFocus
                    fromDate={resortArrivalDate}
                  />
                </PopoverContent>
              </Popover>
              {errors.resortDepartureDate && (
                <p className="text-red-500 text-sm mt-1">{errors.resortDepartureDate.message as string}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Must be after arrival date, Mondays and Fridays only</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Pelagian Date Selection - Show for Pelagian and Combination stays */}
      {(tripType === 'pelagian-only' || tripType === 'combination-stay') && (
        <div className="mb-8">
          <h3 className="text-xl font-montserrat font-semibold text-wakatobi-primary mb-4">
            Pelagian Yacht Dates
          </h3>
          <p className="text-gray-600 mb-4">
            The Pelagian Yacht operates on a weekly schedule with departures and arrivals on Mondays only.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Pelagian Arrival Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pelagian Arrival Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !pelagianArrivalDate && "text-muted-foreground",
                      errors.pelagianArrivalDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pelagianArrivalDate ? (
                      format(pelagianArrivalDate, "PPP")
                    ) : (
                      <span>Select arrival date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pelagianArrivalDate}
                    onSelect={(date) => date && handlePelagianArrivalChange(date)}
                    disabled={disabledPelagianArrivalDays}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.pelagianArrivalDate && (
                <p className="text-red-500 text-sm mt-1">{errors.pelagianArrivalDate.message as string}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Only Mondays available</p>
            </div>
            
            {/* Pelagian Departure Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pelagian Departure Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !pelagianDepartureDate && "text-muted-foreground",
                      errors.pelagianDepartureDate && "border-red-500"
                    )}
                    disabled={!pelagianArrivalDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pelagianDepartureDate ? (
                      format(pelagianDepartureDate, "PPP")
                    ) : (
                      <span>Select departure date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={pelagianDepartureDate}
                    onSelect={(date) => date && setValue('pelagianDepartureDate', date, { shouldValidate: true })}
                    disabled={disabledPelagianDepartureDays}
                    initialFocus
                    fromDate={pelagianArrivalDate}
                  />
                </PopoverContent>
              </Popover>
              {errors.pelagianDepartureDate && (
                <p className="text-red-500 text-sm mt-1">{errors.pelagianDepartureDate.message as string}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Must be after arrival date, Mondays only</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Combination Stay Order - Show for Combination stays only */}
      {tripType === 'combination-stay' && (
        <div className="bg-wakatobi-light p-4 rounded-lg mb-8">
          <h3 className="text-lg font-montserrat font-semibold text-wakatobi-primary mb-2">
            Stay Order
          </h3>
          <p className="text-gray-600 mb-4">
            Choose the order of your combination stay:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => setValue('combinationOrder', 'resort-first', { shouldValidate: true })}
              className={`flex-1 p-4 rounded-lg border transition-all ${
                combinationOrder === 'resort-first'
                  ? 'border-wakatobi-primary bg-wakatobi-light/70'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <h4 className="font-montserrat font-medium text-wakatobi-primary">Resort First → Pelagian</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Start at the resort, then continue to the Pelagian yacht
                </p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setValue('combinationOrder', 'pelagian-first', { shouldValidate: true })}
              className={`flex-1 p-4 rounded-lg border transition-all ${
                combinationOrder === 'pelagian-first'
                  ? 'border-wakatobi-primary bg-wakatobi-light/70'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <h4 className="font-montserrat font-medium text-wakatobi-primary">Pelagian First → Resort</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Start on the Pelagian yacht, then continue to the resort
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex justify-between">
        <button 
          type="button"
          onClick={onPrev}
          className="border border-wakatobi-primary text-wakatobi-primary font-semibold py-3 px-6 rounded-lg hover:bg-wakatobi-light transition-all flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trip Type
        </button>
        <button 
          type="button"
          onClick={handleContinue}
          className="bg-wakatobi-secondary hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
        >
          Continue to Guests
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default CombinedDateSelectionStep;