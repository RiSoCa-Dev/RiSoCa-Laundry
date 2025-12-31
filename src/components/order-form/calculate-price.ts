import { OrderFormValues } from './types';

export interface PricingResult {
  computedPrice: number;
}

/**
 * Calculates the price for an order based on service package, weight, and distance.
 * Returns null if distance is required but not provided.
 */
export function calculatePrice(
  values: OrderFormValues
): { result: PricingResult | null; loads: number; showDistancePrompt: boolean } {
  const { servicePackage, weight, distance } = values;

  const needsLocationForCalc = servicePackage === 'package2' || servicePackage === 'package3';
  
  if (needsLocationForCalc && (!distance || distance <= 0)) {
    return {
      result: null,
      loads: 1,
      showDistancePrompt: true,
    };
  }

  const isFree = needsLocationForCalc && distance > 0 && distance <= 0.5;
  
  let effectiveWeight = 0;
  if (isFree) {
    effectiveWeight = 7.5;
  } else if (weight && weight > 0) {
    effectiveWeight = weight;
  } else if (servicePackage === 'package1' && (weight === undefined || weight === 0)) {
    effectiveWeight = 7.5;
  }

  const loads = Math.max(1, Math.ceil(effectiveWeight / 7.5));
  const baseCost = loads * 180;

  let transportFee = 0;
  if (!isFree && needsLocationForCalc) {
    const billableDistance = Math.max(0, distance - 1);
    if (servicePackage === 'package2') {
      transportFee = billableDistance * 20;
    } else if (servicePackage === 'package3') {
      transportFee = billableDistance * 20 * 2;
    }
  }
  
  const computedPrice = baseCost + transportFee;

  return {
    result: { computedPrice },
    loads,
    showDistancePrompt: false,
  };
}
