import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { ArrowLeft, Info, Send } from 'lucide-react';
import { accommodations, activities, FLIGHT_PRICE } from '@/lib/booking-data';
import { differenceInDays, format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface QuoteStepProps {
  onPrev: () => void;
}

const QuoteStep: React.FC<QuoteStepProps> = ({ onPrev }) => {
  const { watch, control, register, formState: { errors } } = useFormContext<BookingFormData>();
  
  // Get form values
  const arrivalDate = watch('arrivalDate');
  const departureDate = watch('departureDate');
  const adults = watch('adults') || 0;
  const children = watch('children') || 0;
  const infants = watch('infants') || 0;
  const visitCount = watch('visitCount');
  const accommodationId = watch('accommodationId');
  const activityId = watch('activityId');
  
  // Calculate nights
  const nights = useMemo(() => {
    if (arrivalDate && departureDate) {
      return differenceInDays(departureDate, arrivalDate);
    }
    return 0;
  }, [arrivalDate, departureDate]);
  
  // Find selected accommodation and activity
  const selectedAccommodation = useMemo(() => {
    return accommodations.find(acc => acc.id === accommodationId);
  }, [accommodationId]);
  
  const selectedActivity = useMemo(() => {
    return activities.find(act => act.id === activityId);
  }, [activityId]);
  
  // Calculate discount rate based on visit count
  const discountRate = useMemo(() => {
    if (visitCount === 'second-third') return 0.05; // 5% discount
    if (visitCount === 'fourth-plus') return 0.10; // 10% discount
    return 0; // No discount for first-time visitors
  }, [visitCount]);
  
  // Calculate totals with appropriate discounts
  const totals = useMemo(() => {
    if (!selectedAccommodation || !selectedActivity) {
      return {
        accommodationTotal: 0,
        activityTotal: 0,
        flightTotal: 0,
        discount: 0,
        subtotal: 0,
        total: 0
      };
    }
    
    // Base calculations
    const totalGuests = adults + children;
    const accommodationTotal = selectedAccommodation.pricePerNight * totalGuests * nights;
    const activityTotal = selectedActivity.pricePerDay * totalGuests * nights;
    const flightTotal = FLIGHT_PRICE * totalGuests;
    
    // Discount only applies to accommodation and activities
    const discount = (accommodationTotal + activityTotal) * discountRate;
    const subtotal = accommodationTotal + activityTotal + flightTotal;
    const total = subtotal - discount;
    
    return {
      accommodationTotal,
      activityTotal,
      flightTotal,
      discount,
      subtotal,
      total
    };
  }, [selectedAccommodation, selectedActivity, adults, children, nights, discountRate]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Get discount text
  const discountText = () => {
    if (visitCount === 'first') return 'First-time visitor (no discount)';
    if (visitCount === 'second-third') return '2nd or 3rd visit (5% discount)';
    return '4th or more visit (10% discount)';
  };
  
  // Get guest text
  const guestText = () => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  return (
    <div id="step-5" className="step-content">
      <h2 className="text-2xl font-montserrat font-semibold text-wakatobi-primary mb-6">
        Your Wakatobi Package Quote
      </h2>
      
      <div className="bg-wakatobi-light p-6 rounded-lg mb-8">
        <h3 className="font-montserrat font-semibold text-lg text-wakatobi-primary mb-4">Booking Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-wakatobi-primary">Dates</h4>
              {arrivalDate && departureDate ? (
                <>
                  <p>{format(arrivalDate, 'MMMM d, yyyy')} - {format(departureDate, 'MMMM d, yyyy')}</p>
                  <p className="text-sm text-gray-600">{nights} nights</p>
                </>
              ) : (
                <p className="text-sm text-red-500">Please select your dates</p>
              )}
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-wakatobi-primary">Guests</h4>
              <p>{guestText()}</p>
              <p className="text-sm text-gray-600">
                {visitCount === 'first' ? 'First-time visitors' : 
                 visitCount === 'second-third' ? '2nd or 3rd time visitors' : 
                 '4th time or more visitors'}
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-wakatobi-primary">Accommodation</h4>
              {selectedAccommodation ? (
                <>
                  <p>{selectedAccommodation.name}</p>
                  <p className="text-sm text-gray-600">${selectedAccommodation.pricePerNight} per person per night</p>
                </>
              ) : (
                <p className="text-sm text-red-500">Please select accommodation</p>
              )}
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-wakatobi-primary">Activities</h4>
              {selectedActivity ? (
                <>
                  <p>{selectedActivity.name}</p>
                  <p className="text-sm text-gray-600">${selectedActivity.pricePerDay} per person per day</p>
                </>
              ) : (
                <p className="text-sm text-red-500">Please select activities</p>
              )}
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-wakatobi-primary">Flights</h4>
              <p>Bali to Wakatobi (roundtrip)</p>
              <p className="text-sm text-gray-600">${FLIGHT_PRICE} per person</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8">
        <h3 className="font-montserrat font-semibold text-lg mb-4 pb-3 border-b border-gray-200">Price Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Accommodation ({adults + children} persons × {nights} nights × ${selectedAccommodation?.pricePerNight || 0})</span>
            <span className="font-medium">{formatCurrency(totals.accommodationTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Activities ({adults + children} persons × {nights} days × ${selectedActivity?.pricePerDay || 0})</span>
            <span className="font-medium">{formatCurrency(totals.activityTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Flights ({adults + children} persons × ${FLIGHT_PRICE})</span>
            <span className="font-medium">{formatCurrency(totals.flightTotal)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="font-medium">Subtotal</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-wakatobi-primary">
            <span>{discountText()}</span>
            <span>{formatCurrency(-totals.discount)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200 text-xl font-bold">
            <span>Total Package Price</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p className="flex items-start">
            <Info className="h-4 w-4 mr-1 mt-0.5" />
            Repeat visitors receive a 5% discount (2nd-3rd visits) or 10% discount (4th+ visits) on accommodation and activities.
          </p>
        </div>
      </div>
      
      <div className="bg-wakatobi-primary text-white p-6 rounded-lg mb-8">
        <h3 className="font-montserrat font-semibold text-lg mb-4">Complete Your Booking</h3>
        <p className="mb-4">To finalize your booking, please provide your contact information below. Our reservation team will contact you soon to confirm your booking and arrange payment.</p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium mb-1">First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your first name"
                      className="w-full p-2 rounded border border-white/30 bg-white/10 text-white placeholder-white/60"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium mb-1">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your last name"
                      className="w-full p-2 rounded border border-white/30 bg-white/10 text-white placeholder-white/60"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium mb-1">Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your@email.com"
                    className="w-full p-2 rounded border border-white/30 bg-white/10 text-white placeholder-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium mb-1">Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Include country code"
                    className="w-full p-2 rounded border border-white/30 bg-white/10 text-white placeholder-white/60"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="specialRequests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium mb-1">Special Requests or Questions</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Let us know if you have any special requests or questions..."
                    className="w-full p-2 rounded border border-white/30 bg-white/10 text-white placeholder-white/60 h-24"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button 
          type="button"
          onClick={onPrev}
          className="border border-wakatobi-primary text-wakatobi-primary font-semibold py-3 px-6 rounded-lg hover:bg-wakatobi-light transition-all flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activities
        </button>
        <button 
          type="submit"
          className="bg-wakatobi-secondary hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
        >
          Submit Booking Request
          <Send className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default QuoteStep;
