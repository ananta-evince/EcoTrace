/** Converts miles to kilometres. */
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}

/** Converts pounds to kilograms. */
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

/** Converts gallons to litres. */
export function gallonsToLitres(gallons: number): number {
  return gallons * 3.78541;
}

/** Normalises input value to the factor's base unit. */
export function normaliseToFactorUnit(
  value: number,
  inputUnit: string,
  factorUnit: string,
): number {
  if (inputUnit === factorUnit) return value;

  if (inputUnit === 'miles' && factorUnit === 'km') return milesToKm(value);
  if (inputUnit === 'kg' && factorUnit === 'kg') return value;
  if (inputUnit === 'EUR' && factorUnit === 'GBP') return value * 0.86;
  if (inputUnit === 'USD' && factorUnit === 'GBP') return value * 0.79;

  return value;
}
