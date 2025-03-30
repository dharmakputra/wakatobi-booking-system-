import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { BookingFormData } from '@shared/schema';
import { ArrowLeft, Info, Send } from 'lucide-react';
import { accommodations, activities, pelagianCabins, FLIGHT_PRICE, getDiscountRate, getStayDiscountRate } from '@/lib/booking-data';
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
  const tripType = watch('tripType');
  const resortArrivalDate = watch('resortArrivalDate');
  const resortDepartureDate = watch('resortDepartureDate');
  const pelagianArrivalDate = watch('pelagianArrivalDate');
  const pelagianDepartureDate = watch('pelagianDepartureDate');
  const arrivalDate = watch('arrivalDate');
  const departureDate = watch('departureDate');
  const adults = watch('adults') || 0;
  const children = watch('children') || 0;
  const infants = watch('infants') || 0;
  const visitCount = watch('visitCount');
  const accommodationId = watch('accommodationId');
  const activityId = watch('activityId');
  const activityDays = watch('activityDays') || {};
  const pelagianCabinId = watch('pelagianCabinId');
  
  // Calculate resort nights
  const resortNights = useMemo(() => {
    if (resortArrivalDate && resortDepartureDate) {
      return differenceInDays(resortDepartureDate, resortArrivalDate);
    }
    return 0;
  }, [resortArrivalDate, resortDepartureDate]);
  
  // Calculate Pelagian nights
  const pelagianNights = useMemo(() => {
    if (pelagianArrivalDate && pelagianDepartureDate) {
      return differenceInDays(pelagianDepartureDate, pelagianArrivalDate);
    }
    return 0;
  }, [pelagianArrivalDate, pelagianDepartureDate]);
  
  // Total nights (used for legacy and for total night calculation)
  const totalNights = useMemo(() => {
    // For legacy support
    if (arrivalDate && departureDate) {
      return differenceInDays(departureDate, arrivalDate);
    }
    
    // For modern trip types
    return resortNights + pelagianNights;
  }, [arrivalDate, departureDate, resortNights, pelagianNights]);
  
  // Find selected accommodation, activity, and Pelagian cabin
  const selectedAccommodation = useMemo(() => {
    return accommodations.find(acc => acc.id === accommodationId);
  }, [accommodationId]);
  
  const selectedActivity = useMemo(() => {
    return activities.find(act => act.id === activityId);
  }, [activityId]);
  
  const selectedPelagianCabin = useMemo(() => {
    return pelagianCabins.find(cabin => cabin.id === pelagianCabinId);
  }, [pelagianCabinId]);
  
  // Calculate visitor discount rate based on visit count
  const visitorDiscountRate = useMemo(() => {
    return getDiscountRate(visitCount);
  }, [visitCount]);
  
  // Calculate stay length discount rate
  const stayDiscountRate = useMemo(() => {
    return getStayDiscountRate(totalNights);
  }, [totalNights]);
  
  // Always prioritize stay length discount if it's available (they don't stack)
  const effectiveDiscountRate = useMemo(() => {
    // If stay discount exists, use it; otherwise fall back to visitor discount
    return stayDiscountRate > 0 ? stayDiscountRate : visitorDiscountRate;
  }, [visitorDiscountRate, stayDiscountRate]);
  
  // Calculate totals with appropriate discounts
  const totals = useMemo(() => {
    // Base default return value
    const defaultReturnValue = {
      accommodationTotal: 0,
      activityTotal: 0,
      pelagianCabinTotal: 0,
      flightTotal: 0,
      discount: 0,
      discountType: '',
      discountRate: 0,
      subtotal: 0,
      total: 0
    };

    // Base calculations
    const totalGuests = adults + children;
    let accommodationTotal = 0;
    let activityTotal = 0;
    let pelagianCabinTotal = 0;
    
    // Calculate resort costs if applicable
    if (tripType === 'resort-only' || tripType === 'combination-stay') {
      if (selectedAccommodation && resortNights > 0) {
        accommodationTotal = selectedAccommodation.pricePerNight * totalGuests * resortNights;
      }
      
      if (selectedActivity) {
        // Calculate the total number of activity days for all guests
        let totalActivityDays = 0;
        Object.values(activityDays).forEach(days => {
          totalActivityDays += days;
        });
        
        if (totalActivityDays > 0) {
          // Calculate based on actual selected days per guest
          activityTotal = selectedActivity.pricePerDay * totalActivityDays;
        } else {
          // Fallback calculation if no activity days were selected
          activityTotal = 0;
        }
      }
    }
    
    // Calculate Pelagian costs if applicable
    if (tripType === 'pelagian-only' || tripType === 'combination-stay') {
      if (selectedPelagianCabin && pelagianNights > 0) {
        pelagianCabinTotal = selectedPelagianCabin.pricePerNight * totalGuests * pelagianNights;
      }
    }
    
    // Calculate flight costs
    const flightTotal = FLIGHT_PRICE * totalGuests;
    
    // Discount only applies to accommodation, activities, and Pelagian cabin
    const discountableAmount = accommodationTotal + activityTotal + pelagianCabinTotal;
    const discount = discountableAmount * effectiveDiscountRate;
    const subtotal = discountableAmount + flightTotal;
    const total = subtotal - discount;
    
    // Determine which discount type is being applied (for display purposes)
    let discountType = '';
    if (effectiveDiscountRate > 0) {
      if (stayDiscountRate > visitorDiscountRate) {
        discountType = 'stay';
      } else {
        discountType = 'visitor';
      }
    }
    
    return {
      accommodationTotal,
      activityTotal,
      pelagianCabinTotal,
      flightTotal,
      discount,
      discountType,
      discountRate: effectiveDiscountRate,
      subtotal,
      total
    };
  }, [
    tripType, 
    selectedAccommodation, 
    selectedActivity, 
    selectedPelagianCabin,
    adults, 
    children, 
    resortNights,
    pelagianNights,
    effectiveDiscountRate, 
    visitorDiscountRate, 
    stayDiscountRate,
    activityDays
  ]);
  
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
    // Stay length discount is being applied
    if (totals.discountType === 'stay') {
      if (totalNights > 14) {
        return `Stay longer than 14 nights (10% discount)`;
      } else if (totalNights > 7) {
        return `Stay longer than 7 nights (5% discount)`;
      }
    }
    
    // Visitor count discount is being applied (or no discount)
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
              {tripType === 'resort-only' && resortArrivalDate && resortDepartureDate ? (
                <>
                  <p>{format(resortArrivalDate, 'MMMM d, yyyy')} - {format(resortDepartureDate, 'MMMM d, yyyy')}</p>
                  <p className="text-sm text-gray-600">{resortNights} nights</p>
                </>
              ) : tripType === 'pelagian-only' && pelagianArrivalDate && pelagianDepartureDate ? (
                <>
                  <p>{format(pelagianArrivalDate, 'MMMM d, yyyy')} - {format(pelagianDepartureDate, 'MMMM d, yyyy')}</p>
                  <p className="text-sm text-gray-600">{pelagianNights} nights</p>
                </>
              ) : tripType === 'combination-stay' ? (
                <>
                  <p>Total of {totalNights} nights</p>
                  {resortArrivalDate && resortDepartureDate && (
                    <p className="text-sm text-gray-600">Resort: {format(resortArrivalDate, 'MMM d')} - {format(resortDepartureDate, 'MMM d')} ({resortNights} nights)</p>
                  )}
                  {pelagianArrivalDate && pelagianDepartureDate && (
                    <p className="text-sm text-gray-600">Pelagian: {format(pelagianArrivalDate, 'MMM d')} - {format(pelagianDepartureDate, 'MMM d')} ({pelagianNights} nights)</p>
                  )}
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
              {tripType === 'resort-only' || tripType === 'combination-stay' ? (
                <>
                  {selectedAccommodation ? (
                    <>
                      <p>Resort: {selectedAccommodation.name}</p>
                      <p className="text-sm text-gray-600">${selectedAccommodation.pricePerNight} per person per night</p>
                    </>
                  ) : (
                    <p className="text-sm text-red-500">Please select resort accommodation</p>
                  )}
                </>
              ) : null}
              
              {tripType === 'pelagian-only' || tripType === 'combination-stay' ? (
                <>
                  {selectedPelagianCabin ? (
                    <>
                      <p className={tripType === 'combination-stay' ? 'mt-2' : ''}>
                        Pelagian: {selectedPelagianCabin.name}
                      </p>
                      <p className="text-sm text-gray-600">${selectedPelagianCabin.pricePerNight} per person per night</p>
                    </>
                  ) : (
                    <p className="text-sm text-red-500 mt-2">Please select Pelagian cabin</p>
                  )}
                </>
              ) : null}
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-wakatobi-primary">Activities</h4>
              {(tripType === 'resort-only' || tripType === 'combination-stay') && (
                selectedActivity ? (
                  <>
                    <p>{selectedActivity.name}</p>
                    <p className="text-sm text-gray-600">${selectedActivity.pricePerDay} per person per day</p>
                    <p className="text-sm text-gray-600">
                      Total booked: {Object.values(activityDays).reduce((sum, days) => sum + days, 0)} activity days
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-red-500">Please select resort activities</p>
                )
              )}
              
              {tripType === 'pelagian-only' && (
                <p>Included in Pelagian cruise package</p>
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
          {/* Resort Accommodation - Only displayed if selected and has nights */}
          {totals.accommodationTotal > 0 && (
            <div className="flex justify-between">
              <span>Resort Accommodation ({adults + children} persons × {resortNights} nights × ${selectedAccommodation?.pricePerNight || 0})</span>
              <span className="font-medium">{formatCurrency(totals.accommodationTotal)}</span>
            </div>
          )}
          
          {/* Resort Activities - Only displayed if selected and has days */}
          {totals.activityTotal > 0 && (
            <div className="flex justify-between">
              <span>
                Resort Activities ({Object.values(activityDays).reduce((sum, days) => sum + days, 0)} total activity days × ${selectedActivity?.pricePerDay || 0})
              </span>
              <span className="font-medium">{formatCurrency(totals.activityTotal)}</span>
            </div>
          )}
          
          {/* Pelagian Cabin - Only displayed if selected and has nights */}
          {totals.pelagianCabinTotal > 0 && (
            <div className="flex justify-between">
              <span>Pelagian Cabin ({adults + children} persons × {pelagianNights} nights × ${selectedPelagianCabin?.pricePerNight || 0})</span>
              <span className="font-medium">{formatCurrency(totals.pelagianCabinTotal)}</span>
            </div>
          )}
          
          {/* Flights */}
          <div className="flex justify-between">
            <span>Flights ({adults + children} persons × ${FLIGHT_PRICE})</span>
            <span className="font-medium">{formatCurrency(totals.flightTotal)}</span>
          </div>
          
          {/* Subtotal */}
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="font-medium">Subtotal</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
          </div>
          
          {/* Discount */}
          <div className="flex justify-between text-wakatobi-primary">
            <span>{discountText()}</span>
            <span>{formatCurrency(-totals.discount)}</span>
          </div>
          
          {/* Total Package Price */}
          <div className="flex justify-between pt-3 border-t border-gray-200 text-xl font-bold">
            <span>Total Package Price</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600 space-y-2">
          <p className="flex items-start">
            <Info className="h-4 w-4 mr-1 mt-0.5" />
            Repeat visitors receive a 5% discount (2nd-3rd visits) or 10% discount (4th+ visits) on accommodation and activities.
          </p>
          <p className="flex items-start">
            <Info className="h-4 w-4 mr-1 mt-0.5" />
            Extended stays longer than 7 nights receive a 5% discount, and stays longer than 14 nights receive a 10% discount on accommodation and activities.
          </p>
          <p className="flex items-start">
            <Info className="h-4 w-4 mr-1 mt-0.5" />
            Only the highest applicable discount will be applied (discounts don't stack).
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
          {tripType === 'pelagian-only' 
            ? 'Back to Pelagian Cabin' 
            : tripType === 'resort-only' 
              ? 'Back to Activities' 
              : 'Back to Previous Step'}
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
