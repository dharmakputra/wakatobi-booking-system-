import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Ship, Building, Combine } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookingFormData } from '@shared/schema';

interface TripTypeSelectionProps {
  onNext: () => void;
}

const TripTypeSelection = ({ onNext }: TripTypeSelectionProps) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext<BookingFormData>();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const tripType = watch('tripType');
  
  const [combinationOrder, setCombinationOrder] = useState<'resort-first' | 'pelagian-first'>('resort-first');
  
  const handleTripTypeChange = (value: string) => {
    setSelectedType(value);
    setValue('tripType', value as "resort-only" | "combination-stay" | "pelagian-only");
    
    // Set the combination order property if this is a combination stay
    if (value === 'combination-stay') {
      setValue('combinationOrder', combinationOrder);
    }
  };
  
  const handleContinue = () => {
    if (selectedType) {
      onNext();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-wakatobi-primary mb-6">Choose Your Trip Type</h2>
      
      <Controller
        name="tripType"
        control={control}
        defaultValue={undefined}
        render={({ field }) => (
          <RadioGroup
            onValueChange={(value) => {
              handleTripTypeChange(value);
              field.onChange(value);
            }}
            value={field.value}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className={`relative ${tripType === 'resort-only' ? 'ring-2 ring-wakatobi-secondary' : ''}`}>
              <RadioGroupItem value="resort-only" id="resort-only" className="sr-only" />
              <Label
                htmlFor="resort-only"
                className="cursor-pointer"
              >
                <Card className={`h-full transition ${tripType === 'resort-only' ? 'border-wakatobi-secondary' : 'hover:border-gray-300'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-center">
                      <Building size={48} className="text-wakatobi-primary mb-2" />
                    </div>
                    <CardTitle className="text-center">Resort Only</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Experience our luxury resort accommodations with world-class diving and amenities.
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <p className="text-sm text-center w-full">
                      Flights available Mondays & Fridays only.
                    </p>
                  </CardFooter>
                </Card>
              </Label>
            </div>
            
            <div className={`relative ${tripType === 'combination-stay' ? 'ring-2 ring-wakatobi-secondary' : ''}`}>
              <RadioGroupItem value="combination-stay" id="combination-stay" className="sr-only" />
              <Label
                htmlFor="combination-stay"
                className="cursor-pointer"
              >
                <Card className={`h-full transition ${tripType === 'combination-stay' ? 'border-wakatobi-secondary' : 'hover:border-gray-300'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-center">
                      <Combine size={48} className="text-wakatobi-primary mb-2" />
                    </div>
                    <CardTitle className="text-center">Combination Stay</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Enjoy both resort amenities and a cruise on our luxury yacht, the Pelagian.
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <p className="text-sm text-center w-full">
                      Resort flights: Mon/Fri, Pelagian cruises: Mon only.
                    </p>
                  </CardFooter>
                </Card>
              </Label>
            </div>
            
            <div className={`relative ${tripType === 'pelagian-only' ? 'ring-2 ring-wakatobi-secondary' : ''}`}>
              <RadioGroupItem value="pelagian-only" id="pelagian-only" className="sr-only" />
              <Label
                htmlFor="pelagian-only"
                className="cursor-pointer"
              >
                <Card className={`h-full transition ${tripType === 'pelagian-only' ? 'border-wakatobi-secondary' : 'hover:border-gray-300'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-center">
                      <Ship size={48} className="text-wakatobi-primary mb-2" />
                    </div>
                    <CardTitle className="text-center">Pelagian Only</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Embark on a premium diving cruise aboard our luxury yacht, the Pelagian.
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <p className="text-sm text-center w-full">
                      Cruises start and end on Mondays only.
                    </p>
                  </CardFooter>
                </Card>
              </Label>
            </div>
          </RadioGroup>
        )}
      />
      
      {errors.tripType && (
        <p className="text-red-500 text-sm mt-2">{errors.tripType.message}</p>
      )}
      
      {/* Combination Order Selection */}
      {tripType === 'combination-stay' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-wakatobi-primary mb-3">Select Your Itinerary Order</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                combinationOrder === 'resort-first' 
                  ? 'border-wakatobi-secondary bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setCombinationOrder('resort-first');
                setValue('combinationOrder', 'resort-first');
              }}
            >
              <div className="flex items-center mb-2">
                <Building className="h-5 w-5 mr-2 text-wakatobi-primary" />
                <span className="font-semibold">Resort First, Then Pelagian</span>
              </div>
              <p className="text-sm text-gray-600">
                Start with your stay at our luxury resort, then embark on the Pelagian yacht cruise.
              </p>
            </div>
            
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                combinationOrder === 'pelagian-first' 
                  ? 'border-wakatobi-secondary bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setCombinationOrder('pelagian-first');
                setValue('combinationOrder', 'pelagian-first');
              }}
            >
              <div className="flex items-center mb-2">
                <Ship className="h-5 w-5 mr-2 text-wakatobi-primary" />
                <span className="font-semibold">Pelagian First, Then Resort</span>
              </div>
              <p className="text-sm text-gray-600">
                Begin with the Pelagian yacht cruise, followed by relaxation at our resort.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedType}
          className={`${
            selectedType
              ? 'bg-wakatobi-secondary hover:bg-orange-600'
              : 'bg-gray-300 cursor-not-allowed'
          } text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center`}
        >
          Continue to Dates
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TripTypeSelection;