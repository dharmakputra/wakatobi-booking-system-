import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';

interface GuestsStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const GuestsStep: React.FC<GuestsStepProps> = ({ onNext, onPrev }) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  
  const visitCount = watch('visitCount');
  const adults = watch('adults') || 1;
  const children = watch('children') || 0;
  const infants = watch('infants') || 0;

  const handleVisitCountChange = (value: 'first' | 'second-third' | 'fourth-plus') => {
    setValue('visitCount', value, { shouldValidate: true });
  };

  const incrementGuests = (type: 'adults' | 'children' | 'infants') => {
    const currentValue = watch(type) || 0;
    
    // Set max values
    if (type === 'adults' && currentValue >= 10) return;
    if ((type === 'children' || type === 'infants') && currentValue >= 5) return;
    
    setValue(type, currentValue + 1, { shouldValidate: true });
  };

  const decrementGuests = (type: 'adults' | 'children' | 'infants') => {
    const currentValue = watch(type) || 0;
    // Ensure adults doesn't go below 1, and children/infants don't go below 0
    if (type === 'adults' && currentValue <= 1) return;
    if ((type === 'children' || type === 'infants') && currentValue <= 0) return;
    
    setValue(type, currentValue - 1, { shouldValidate: true });
  };

  return (
    <div id="step-2" className="step-content">
      <h2 className="text-2xl font-montserrat font-semibold text-wakatobi-primary mb-6">Guest Information</h2>
      
      <div className="mb-8">
        <label className="block text-wakatobi-primary font-medium mb-2">
          Is this your first visit to Wakatobi?
        </label>
        <div className="flex flex-wrap gap-4">
          <RadioGroup value={visitCount} onValueChange={handleVisitCountChange} className="flex flex-wrap gap-4">
            <div className="flex items-center bg-white border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-wakatobi-light hover:border-wakatobi-primary transition">
              <RadioGroupItem id="first-visit" value="first" className="mr-2" />
              <Label htmlFor="first-visit">Yes, first visit</Label>
            </div>
            <div className="flex items-center bg-white border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-wakatobi-light hover:border-wakatobi-primary transition">
              <RadioGroupItem id="second-third-visit" value="second-third" className="mr-2" />
              <Label htmlFor="second-third-visit">2nd or 3rd visit (5% discount)</Label>
            </div>
            <div className="flex items-center bg-white border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-wakatobi-light hover:border-wakatobi-primary transition">
              <RadioGroupItem id="fourth-plus-visit" value="fourth-plus" className="mr-2" />
              <Label htmlFor="fourth-plus-visit">4th visit or more (10% discount)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-wakatobi-primary font-medium mb-2">Number of Guests</label>
          
        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Adults</h3>
              <p className="text-sm text-gray-600">Age 12+</p>
            </div>
            <div className="flex items-center">
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-wakatobi-light"
                onClick={() => decrementGuests('adults')}
              >
                <Minus className="h-4 w-4 text-wakatobi-primary" />
              </button>
              <span className="mx-4 w-6 text-center font-medium">{adults}</span>
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-wakatobi-light"
                onClick={() => incrementGuests('adults')}
              >
                <Plus className="h-4 w-4 text-wakatobi-primary" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium">Children</h3>
              <p className="text-sm text-gray-600">Age 6-11</p>
            </div>
            <div className="flex items-center">
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-wakatobi-light"
                onClick={() => decrementGuests('children')}
              >
                <Minus className="h-4 w-4 text-wakatobi-primary" />
              </button>
              <span className="mx-4 w-6 text-center font-medium">{children}</span>
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-wakatobi-light"
                onClick={() => incrementGuests('children')}
              >
                <Plus className="h-4 w-4 text-wakatobi-primary" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Infants</h3>
              <p className="text-sm text-gray-600">Age 0-5</p>
            </div>
            <div className="flex items-center">
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-wakatobi-light"
                onClick={() => decrementGuests('infants')}
              >
                <Minus className="h-4 w-4 text-wakatobi-primary" />
              </button>
              <span className="mx-4 w-6 text-center font-medium">{infants}</span>
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-wakatobi-light"
                onClick={() => incrementGuests('infants')}
              >
                <Plus className="h-4 w-4 text-wakatobi-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button 
          type="button"
          onClick={onPrev}
          className="border border-wakatobi-primary text-wakatobi-primary font-semibold py-3 px-6 rounded-lg hover:bg-wakatobi-light transition-all flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dates
        </button>
        <button 
          type="button"
          onClick={onNext}
          className="bg-wakatobi-secondary hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
        >
          Continue to Accommodation
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default GuestsStep;
