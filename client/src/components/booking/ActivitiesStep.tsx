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

interface GuestActivity {
  activityId: string;
  days: number;
}

const ActivitiesStep: React.FC<ActivitiesStepProps> = ({ onNext, onPrev }) => {
  const { setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  const tripType = watch('tripType');
  const combinationOrder = watch('combinationOrder');
  const resortArrivalDate = watch('resortArrivalDate');
  const resortDepartureDate = watch('resortDepartureDate');
  const pelagianArrivalDate = watch('pelagianArrivalDate');
  const pelagianDepartureDate = watch('pelagianDepartureDate');
  const adults = watch('adults') || 0;
  const children = watch('children') || 0;
  const guestActivities = watch('guestActivities') || {};

  // For backwards compatibility (global activity selection)
  const selectedGlobalActivityId = watch('activityId');
  
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

  // Initialize guest activities for all guests on first render
  useEffect(() => {
    if (!guestActivities || Object.keys(guestActivities).length === 0) {
      const initialGuestActivities: Record<string, GuestActivity> = {};
      
      // If we have a selected activity (from previous implementation), use it
      const defaultActivityId = selectedGlobalActivityId || (activities.length > 0 ? activities[0].id : '');
      
      guestIds.forEach(guestId => {
        initialGuestActivities[guestId] = {
          activityId: defaultActivityId,
          days: 0
        };
      });
      
      setValue('guestActivities', initialGuestActivities);
      
      // Also set the global activity for backward compatibility
      if (defaultActivityId && !selectedGlobalActivityId) {
        setValue('activityId', defaultActivityId);
      }
    }
  }, [guestIds, setValue, guestActivities, selectedGlobalActivityId]);

  const handleSelectGuestActivity = (guestId: string, activityId: string) => {
    // Get the current days for this guest (or 0 if not set)
    const currentDays = guestActivities[guestId]?.days || 0;
    
    // Update the guest's activity
    setValue(`guestActivities.${guestId}`, {
      activityId,
      days: currentDays
    });
  };

  const handleIncrementActivityDays = (guestId: string) => {
    const currentActivity = guestActivities[guestId];
    if (currentActivity && currentActivity.days < maxActivityDays) {
      setValue(`guestActivities.${guestId}.days`, currentActivity.days + 1);
    }
  };

  const handleDecrementActivityDays = (guestId: string) => {
    const currentActivity = guestActivities[guestId];
    if (currentActivity && currentActivity.days > 0) {
      setValue(`guestActivities.${guestId}.days`, currentActivity.days - 1);
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
        Each guest can select their own activity package.
      </p>
      
      <div className="space-y-8">
        {guestIds.map(guestId => (
          <div key={guestId} className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">{getGuestLabel(guestId)}</h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Select an Activity Package:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {activities.map(activity => (
                  <div 
                    key={activity.id}
                    className={`
                      p-3 border rounded cursor-pointer transition-all
                      ${guestActivities[guestId]?.activityId === activity.id 
                        ? 'border-wakatobi-primary bg-wakatobi-light/30' 
                        : 'border-gray-200 hover:border-wakatobi-primary'}
                    `}
                    onClick={() => handleSelectGuestActivity(guestId, activity.id)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{activity.name}</span>
                      <span className="text-wakatobi-primary">${activity.pricePerDay}/day</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {guestActivities[guestId]?.activityId && (
              <div>
                <h4 className="font-medium mb-2">Number of Activity Days:</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Select how many days this guest will participate in their chosen activity.
                  Maximum: {maxActivityDays} days.
                </p>
                
                <div className="flex items-center gap-3 w-fit border rounded p-2">
                  <button
                    type="button"
                    onClick={() => handleDecrementActivityDays(guestId)}
                    disabled={!guestActivities[guestId] || guestActivities[guestId].days <= 0}
                    className="p-1 rounded-full border border-gray-300 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center">
                    {guestActivities[guestId]?.days || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrementActivityDays(guestId)}
                    disabled={!guestActivities[guestId] || guestActivities[guestId].days >= maxActivityDays}
                    className="p-1 rounded-full border border-gray-300 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
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
