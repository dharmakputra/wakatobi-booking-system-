import React, { useEffect, useState } from 'react';
import { BookingFormData, validateBookingData } from '@shared/schema';
import DateSelectionStep from './DateSelectionStep';
import ResortDateSelectionStep from './ResortDateSelectionStep';
import PelagianDateSelectionStep from './PelagianDateSelectionStep';
import GuestsStep from './GuestsStep';
import AccommodationStep from './AccommodationStep';
import PelagianCabinStep from './PelagianCabinStep';
import ActivitiesStep from './ActivitiesStep';
import TripTypeSelection from './TripTypeSelection';
import QuoteStep from './QuoteStep';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingFormSchema } from '@shared/schema';
import { addDays, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { accommodations, activities, pelagianCabins, FLIGHT_PRICE } from '@/lib/booking-data';

const getStepsForTripType = (tripType: string | undefined, combinationOrder?: string) => {
  const baseSteps = [
    { id: 1, name: 'Trip Type' },
    { id: 2, name: 'Dates' },
    { id: 3, name: 'Guests' }
  ];

  if (!tripType) return baseSteps;

  switch (tripType) {
    case 'resort-only':
      return [
        ...baseSteps,
        { id: 4, name: 'Accommodation' },
        { id: 5, name: 'Activities' },
        { id: 6, name: 'Review & Quote' }
      ];
    case 'combination-stay':
      if (combinationOrder === 'resort-first') {
        return [
          ...baseSteps,
          { id: 4, name: 'Resort Accommodation' },
          { id: 5, name: 'Pelagian Dates' },
          { id: 6, name: 'Pelagian Cabin' },
          { id: 7, name: 'Activities' },
          { id: 8, name: 'Review & Quote' }
        ];
      } else if (combinationOrder === 'pelagian-first') {
        return [
          ...baseSteps,
          { id: 4, name: 'Pelagian Dates' },
          { id: 5, name: 'Pelagian Cabin' },
          { id: 6, name: 'Resort Dates' },
          { id: 7, name: 'Accommodation' },
          { id: 8, name: 'Activities' },
          { id: 9, name: 'Review & Quote' }
        ];
      } else {
        return [
          ...baseSteps,
          { id: 4, name: 'Resort Accommodation' },
          { id: 5, name: 'Pelagian Cabin' },
          { id: 6, name: 'Activities' },
          { id: 7, name: 'Review & Quote' }
        ];
      }
    case 'pelagian-only':
      return [
        ...baseSteps,
        { id: 4, name: 'Pelagian Cabin' },
        { id: 5, name: 'Review & Quote' }
      ];
    default:
      return baseSteps;
  }
};

const BookingSteps: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  
  // Initialize form with default values
  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      tripType: undefined,
      adults: 2,
      children: 0,
      infants: 0,
      visitCount: 'first',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
    }
  });

  const watchTripType = methods.watch('tripType');
  const watchCombinationOrder = methods.watch('combinationOrder');
  const [steps, setSteps] = useState(getStepsForTripType(watchTripType, watchCombinationOrder));

  // Update steps when trip type or combination order changes
  useEffect(() => {
    setSteps(getStepsForTripType(watchTripType, watchCombinationOrder));
  }, [watchTripType, watchCombinationOrder]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      // Validate fields based on trip type
      const validationErrors = validateBookingData(data);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessage = Object.values(validationErrors)[0];
        toast({
          title: "Form Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      // Calculate price totals
      const adults = data.adults || 0;
      const children = data.children || 0;
      const totalGuests = adults + children;
      let accommodationTotal = 0;
      let activityTotal = 0;
      let pelagianCabinTotal = 0;
      let flightTotal = FLIGHT_PRICE * totalGuests;
      let totalNights = 0;

      // Calculate Resort stay (if applicable)
      if (data.tripType === 'resort-only' || data.tripType === 'combination-stay') {
        if (!data.resortArrivalDate || !data.resortDepartureDate || !data.accommodationId) {
          toast({
            title: "Form Error",
            description: "Missing required resort information. Please complete all steps.",
            variant: "destructive",
          });
          return;
        }
        
        const selectedAccommodation = accommodations.find(acc => acc.id === data.accommodationId);
        const selectedActivity = activities.find(act => act.id === data.activityId);
        
        if (!selectedAccommodation || !selectedActivity) {
          toast({
            title: "Form Error",
            description: "Missing accommodation or activity selection. Please complete all steps.",
            variant: "destructive",
          });
          return;
        }
        
        const resortNights = differenceInDays(data.resortDepartureDate, data.resortArrivalDate);
        totalNights += resortNights;
        
        accommodationTotal = selectedAccommodation.pricePerNight * totalGuests * resortNights;
        activityTotal = selectedActivity.pricePerDay * totalGuests * resortNights;
      }
      
      // Calculate Pelagian stay (if applicable)
      if (data.tripType === 'pelagian-only' || data.tripType === 'combination-stay') {
        if (!data.pelagianArrivalDate || !data.pelagianDepartureDate || !data.pelagianCabinId) {
          toast({
            title: "Form Error",
            description: "Missing required Pelagian information. Please complete all steps.",
            variant: "destructive",
          });
          return;
        }
        
        const selectedCabin = pelagianCabins.find(cab => cab.id === data.pelagianCabinId);
        
        if (!selectedCabin) {
          toast({
            title: "Form Error",
            description: "Missing cabin selection. Please complete all steps.",
            variant: "destructive",
          });
          return;
        }
        
        const pelagianNights = differenceInDays(data.pelagianDepartureDate, data.pelagianArrivalDate);
        totalNights += pelagianNights;
        
        pelagianCabinTotal = selectedCabin.pricePerNight * totalGuests * pelagianNights;
      }
      
      // Calculate visitor discount
      const visitorDiscountRate = data.visitCount === 'second-third' ? 0.05 : 
                                 data.visitCount === 'fourth-plus' ? 0.10 : 0;
      
      // Calculate stay length discount
      const stayDiscountRate = totalNights > 14 ? 0.10 : totalNights > 7 ? 0.05 : 0;
      
      // Always prioritize stay length discount if it's available (they don't stack)
      const effectiveDiscountRate = stayDiscountRate > 0 ? stayDiscountRate : visitorDiscountRate;
      
      // Discount only applies to accommodation, activities, and Pelagian cabin
      const discountableAmount = accommodationTotal + activityTotal + pelagianCabinTotal;
      const discount = discountableAmount * effectiveDiscountRate;
      
      // Set totalPrice in cents for storage
      const totalPrice = Math.round((discountableAmount + flightTotal - discount) * 100);
      
      // For compatibility with existing API, copy resort dates to legacy fields if this is resort-only
      if (data.tripType === 'resort-only' && data.resortArrivalDate && data.resortDepartureDate) {
        data.arrivalDate = data.resortArrivalDate;
        data.departureDate = data.resortDepartureDate;
      }
      
      const response = await apiRequest('POST', '/api/bookings', {
        ...data,
        // Convert dates to ISO strings for the backend
        resortArrivalDate: data.resortArrivalDate?.toISOString(),
        resortDepartureDate: data.resortDepartureDate?.toISOString(),
        pelagianArrivalDate: data.pelagianArrivalDate?.toISOString(),
        pelagianDepartureDate: data.pelagianDepartureDate?.toISOString(),
        arrivalDate: data.arrivalDate?.toISOString(),
        departureDate: data.departureDate?.toISOString(),
        totalPrice, // Add the calculated total price (in cents)
      });
      
      if (response.ok) {
        toast({
          title: "Booking Request Submitted",
          description: "Our team will contact you shortly to confirm your reservation.",
        });
      } else {
        console.error("Submission Error:", response);
        toast({
          title: "Submission Error",
          description: "There was a problem submitting your booking. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render different steps based on trip type
  const renderCurrentStep = () => {
    // First step is always Trip Type Selection
    if (currentStep === 1) {
      return <TripTypeSelection onNext={nextStep} />;
    }
    
    // Dates step depends on trip type
    if (currentStep === 2) {
      switch (watchTripType) {
        case 'resort-only':
          return <ResortDateSelectionStep onNext={nextStep} onPrev={prevStep} />;
        case 'pelagian-only':
          return <PelagianDateSelectionStep onNext={nextStep} onPrev={prevStep} />;
        case 'combination-stay':
          // For combination stay, select based on the chosen order
          const combinationOrder = methods.watch('combinationOrder');
          if (combinationOrder === 'resort-first') {
            return <ResortDateSelectionStep onNext={nextStep} onPrev={prevStep} />;
          } else {
            return <PelagianDateSelectionStep onNext={nextStep} onPrev={prevStep} />;
          }
        default:
          return <DateSelectionStep onNext={nextStep} />;
      }
    }
    
    // Guests step is always the same
    if (currentStep === 3) {
      return <GuestsStep onNext={nextStep} onPrev={prevStep} />;
    }
    
    // Different paths based on trip type for subsequent steps
    if (watchTripType === 'resort-only') {
      if (currentStep === 4) return <AccommodationStep onNext={nextStep} onPrev={prevStep} />;
      if (currentStep === 5) return <ActivitiesStep onNext={nextStep} onPrev={prevStep} />;
      if (currentStep === 6) return <QuoteStep onPrev={prevStep} />;
    } 
    else if (watchTripType === 'pelagian-only') {
      if (currentStep === 4) return <PelagianCabinStep onNext={nextStep} onPrev={prevStep} />;
      if (currentStep === 5) return <QuoteStep onPrev={prevStep} />;
    } 
    else if (watchTripType === 'combination-stay') {
      const combinationOrder = methods.watch('combinationOrder');
      
      // Handle different step orders based on combination order
      if (combinationOrder === 'resort-first') {
        // Resort First -> Pelagian Second
        if (currentStep === 4) return <AccommodationStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 5) return <PelagianDateSelectionStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 6) return <PelagianCabinStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 7) return <ActivitiesStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 8) return <QuoteStep onPrev={prevStep} />;
      } else {
        // Pelagian First -> Resort Second
        if (currentStep === 4) return <PelagianDateSelectionStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 5) return <PelagianCabinStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 6) return <ResortDateSelectionStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 7) return <AccommodationStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 8) return <ActivitiesStep onNext={nextStep} onPrev={prevStep} />;
        if (currentStep === 9) return <QuoteStep onPrev={prevStep} />;
      }
    }
    
    // Fallback
    return <TripTypeSelection onNext={nextStep} />;
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-10">
      {/* Progress Tracker */}
      <div className="flex flex-wrap justify-between mb-8 relative">
        <div className="w-full absolute top-1/2 h-1 bg-gray-200 -z-10"></div>
        
        {steps.map((step) => (
          <div 
            key={step.id} 
            className="step-item flex flex-col items-center z-10"
          >
            <div 
              className={`step-circle w-10 h-10 rounded-full ${
                step.id <= currentStep ? 'bg-wakatobi-primary text-white' : 'bg-gray-200 text-gray-600'
              } flex items-center justify-center font-semibold`}
            >
              {step.id}
            </div>
            <div className="step-title mt-2 text-sm md:text-base font-montserrat font-medium">
              {step.name}
            </div>
          </div>
        ))}
      </div>
      
      {/* Form Container */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="booking-form">
            {renderCurrentStep()}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default BookingSteps;
