import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { activities } from '@/lib/booking-data';

interface ActivitiesStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const ActivitiesStep: React.FC<ActivitiesStepProps> = ({ onNext, onPrev }) => {
  const { setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  const selectedActivityId = watch('activityId');

  const handleSelectActivity = (id: string) => {
    setValue('activityId', id, { shouldValidate: true });
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
                  } font-medium py-2 px-4 rounded transition-all`}
                >
                  {selectedActivityId === activity.id ? 'Selected' : 'Select'}
                </button>
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
          Back to Accommodation
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
