import React, { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';
import { activities } from '@/lib/booking-data';
import { calculateNights } from '@/lib/utils';

interface ActivitiesStepProps {
  onNext: () => void;
  onPrev: () => void;
}

// Helper function to generate unique guest IDs
const generateGuestIds = (adults: number, children: number): string[] => {
  const guestIds: string[] = [];
  
  // Adult IDs (a1, a2, etc.)
  for (let i = 1; i <= adults; i++) {
    guestIds.push(`a${i}`);
  }
  
  // Child IDs (c1, c2, etc.)
  for (let i = 1; i <= children; i++) {
    guestIds.push(`c${i}`);
  }
  
  return guestIds;
};

const ActivitiesStep: React.FC<ActivitiesStepProps> = ({ onNext, onPrev }) => {
  const { setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  const selectedActivityId = watch('activityId');
  const tripType = watch('tripType');
  const combinationOrder = watch('combinationOrder');
  const resortArrivalDate = watch('resortArrivalDate');
  const resortDepartureDate = watch('resortDepartureDate');
  const pelagianArrivalDate = watch('pelagianArrivalDate');
  const pelagianDepartureDate = watch('pelagianDepartureDate');
  const adults = watch('adults') || 0;
  const children = watch('children') || 0;
  const activityDays = watch('activityDays') || {};

  // Calculate maximum activity days based on total nights
  const maxActivityDays = useMemo(() => {
    let totalNights = 0;
    
    if (tripType === 'resort-only' && resortArrivalDate && resortDepartureDate) {
      totalNights = calculateNights(resortArrivalDate, resortDepartureDate);
    } else if (tripType === 'pelagian-only' && pelagianArrivalDate && pelagianDepartureDate) {
      totalNights = calculateNights(pelagianArrivalDate, pelagianDepartureDate);
    } else if (tripType === 'combination-stay') {
      let resortNights = 0;
      let pelagianNights = 0;
      
      if (resortArrivalDate && resortDepartureDate) {
        resortNights = calculateNights(resortArrivalDate, resortDepartureDate);
      }
      
      if (pelagianArrivalDate && pelagianDepartureDate) {
        pelagianNights = calculateNights(pelagianArrivalDate, pelagianDepartureDate);
      }
      
      totalNights = resortNights + pelagianNights;
    }
    
    // Max activity days is total nights minus 1 (but minimum 0)
    return Math.max(0, totalNights - 1);
  }, [
    tripType, 
    resortArrivalDate, 
    resortDepartureDate, 
    pelagianArrivalDate, 
    pelagianDepartureDate
  ]);

  // Generate guest IDs
  const guestIds = useMemo(() => {
    return generateGuestIds(adults, children);
  }, [adults, children]);

  // Initialize activity days for all guests on first render
  useEffect(() => {
    if (!activityDays || Object.keys(activityDays).length === 0) {
      const initialActivityDays: Record<string, number> = {};
      guestIds.forEach(guestId => {
        initialActivityDays[guestId] = 0;
      });
      setValue('activityDays', initialActivityDays);
    }
  }, [guestIds, setValue, activityDays]);

  const handleSelectActivity = (id: string) => {
    setValue('activityId', id, { shouldValidate: true });
  };

  const handleIncrementActivityDays = (guestId: string) => {
    const currentDays = activityDays[guestId] || 0;
    if (currentDays < maxActivityDays) {
      setValue(`activityDays.${guestId}`, currentDays + 1);
    }
  };

  const handleDecrementActivityDays = (guestId: string) => {
    const currentDays = activityDays[guestId] || 0;
    if (currentDays > 0) {
      setValue(`activityDays.${guestId}`, currentDays - 1);
    }
  };

  const getGuestLabel = (guestId: string): string => {
    if (guestId.startsWith('a')) {
      const adultNum = parseInt(guestId.substring(1));
      return `Adult ${adultNum}`;
    } else {
      const childNum = parseInt(guestId.substring(1));
      return `Child ${childNum}`;
    }
  };

  return (
    <div id="step-4" className="step-content">
      <h2 className="text-2xl font-montserrat font-semibold text-wakatobi-primary mb-6">
        Select Your Activities
      </h2>
      <p className="mb-6 text-gray-600">
        All activity packages are per person per day. Choose the experiences that will make your stay unforgettable.
      </p>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className={`activity-option border rounded-lg overflow-hidden hover:shadow-lg transition-all ${
              selectedActivityId === activity.id ? 'border-wakatobi-primary shadow-md' : 'border-gray-300'
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {activity.image && (
                <img 
                  src={activity.image} 
                  alt={activity.name} 
                  className="w-full md:w-1/3 h-60 md:h-auto object-cover"
                />
              )}
              <div className={`p-4 ${activity.image ? 'md:w-2/3' : 'w-full'}`}>
                <div className="flex justify-between items-start">
                  <h3 className="font-montserrat font-semibold text-lg">{activity.name}</h3>
                  <div className="text-wakatobi-primary font-bold text-lg">
                    ${activity.pricePerDay}
                    <span className="text-sm font-normal">/person/day</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2 mb-4">{activity.description}</p>
                
                {activity.features && activity.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activity.features.map((feature, index) => (
                      <span 
                        key={index} 
                        className="bg-wakatobi-light text-wakatobi-primary text-xs py-1 px-2 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
                
                <button 
                  type="button"
                  onClick={() => handleSelectActivity(activity.id)}
                  className={`${
                    selectedActivityId === activity.id 
                      ? 'bg-wakatobi-primary text-white hover:bg-wakatobi-dark' 
                      : 'bg-white border border-wakatobi-primary text-wakatobi-primary hover:bg-wakatobi-light'
                  } font-medium py-2 px-4 rounded transition-all mb-4`}
                >
                  {selectedActivityId === activity.id ? 'Selected' : 'Select'}
                </button>
                
                {selectedActivityId === activity.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold mb-2">Activity Days per Guest</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Select how many days each guest will participate in this activity.
                      Maximum: {maxActivityDays} days per guest.
                    </p>
                    
                    <div className="grid gap-3">
                      {guestIds.map(guestId => (
                        <div key={guestId} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="font-medium">{getGuestLabel(guestId)}</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleDecrementActivityDays(guestId)}
                              disabled={!activityDays[guestId] || activityDays[guestId] <= 0}
                              className="p-1 rounded-full border border-gray-300 disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center">
                              {activityDays[guestId] || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrementActivityDays(guestId)}
                              disabled={(activityDays[guestId] || 0) >= maxActivityDays}
                              className="p-1 rounded-full border border-gray-300 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {errors.activityId && (
        <p className="text-red-500 mt-2">{errors.activityId.message as string}</p>
      )}
      
      <div className="mt-8 flex justify-between">
        <button 
          type="button"
          onClick={onPrev}
          className="border border-wakatobi-primary text-wakatobi-primary font-semibold py-3 px-6 rounded-lg hover:bg-wakatobi-light transition-all flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tripType === 'combination-stay' && combinationOrder === 'resort-first' ? (
            <>Back to Pelagian Cabin</>
          ) : (
            <>Back to Accommodation</>
          )}
        </button>
        <button 
          type="button"
          onClick={onNext}
          className="bg-wakatobi-secondary hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
        >
          Continue to Quote
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ActivitiesStep;
