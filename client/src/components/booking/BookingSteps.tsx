import React, { useState } from 'react';
import { BookingFormData } from '@shared/schema';
import DateSelectionStep from './DateSelectionStep';
import GuestsStep from './GuestsStep';
import AccommodationStep from './AccommodationStep';
import ActivitiesStep from './ActivitiesStep';
import QuoteStep from './QuoteStep';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingFormSchema } from '@shared/schema';
import { addDays, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { accommodations, activities, FLIGHT_PRICE } from '@/lib/booking-data';

const steps = [
  { id: 1, name: 'Dates' },
  { id: 2, name: 'Guests' },
  { id: 3, name: 'Accommodation' },
  { id: 4, name: 'Activities' },
  { id: 5, name: 'Review & Quote' }
];

const BookingSteps: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  
  // Initialize form with default values
  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
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

  const nextStep = () => {
    if (currentStep < 5) {
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
      // Calculate price totals
      const adults = data.adults || 0;
      const children = data.children || 0;
      const selectedAccommodation = accommodations.find(acc => acc.id === data.accommodationId);
      const selectedActivity = activities.find(act => act.id === data.activityId);
      const arrivalDate = data.arrivalDate;
      const departureDate = data.departureDate;
      
      if (!selectedAccommodation || !selectedActivity || !arrivalDate || !departureDate) {
        toast({
          title: "Form Error",
          description: "Missing required booking information. Please complete all steps.",
          variant: "destructive",
        });
        return;
      }
      
      // Calculate nights
      const nights = differenceInDays(departureDate, arrivalDate);
      
      // Calculate visitor discount
      const visitorDiscountRate = data.visitCount === 'second-third' ? 0.05 : 
                                 data.visitCount === 'fourth-plus' ? 0.10 : 0;
      
      // Calculate stay length discount
      const stayDiscountRate = nights > 14 ? 0.10 : nights > 7 ? 0.05 : 0;
      
      // Always prioritize stay length discount if it's available (they don't stack)
      const effectiveDiscountRate = stayDiscountRate > 0 ? stayDiscountRate : visitorDiscountRate;
      
      // Calculate totals
      const totalGuests = adults + children;
      const accommodationTotal = selectedAccommodation.pricePerNight * totalGuests * nights;
      const activityTotal = selectedActivity.pricePerDay * totalGuests * nights;
      const flightTotal = FLIGHT_PRICE * totalGuests;
      
      // Discount only applies to accommodation and activities
      const discount = (accommodationTotal + activityTotal) * effectiveDiscountRate;
      const totalPrice = Math.round((accommodationTotal + activityTotal + flightTotal - discount) * 100);
      
      const response = await apiRequest('POST', '/api/bookings', {
        ...data,
        // Convert dates to ISO strings for the backend
        arrivalDate: data.arrivalDate.toISOString(),
        departureDate: data.departureDate.toISOString(),
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
            {currentStep === 1 && <DateSelectionStep onNext={nextStep} />}
            {currentStep === 2 && <GuestsStep onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 3 && <AccommodationStep onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 4 && <ActivitiesStep onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 5 && <QuoteStep onPrev={prevStep} />}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default BookingSteps;
