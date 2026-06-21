/** Branded identifier for a user row. */
export type UserId = string & { readonly __brand: 'UserId' };
/** Branded identifier for a carbon entry row. */
export type EntryId = string & { readonly __brand: 'EntryId' };

/** Supported emission categories aligned with DEFRA factors. */
export type EmissionCategory =
  | 'transport'
  | 'food'
  | 'home_energy'
  | 'shopping'
  | 'services';

/** Persisted carbon entry record. */
export type CarbonEntry = {
  id: EntryId;
  userId: UserId;
  category: EmissionCategory;
  subcategory: string;
  value: number;
  unit: string;
  kgCO2e: number;
  date: Date;
  note?: string;
  createdAt: Date;
};

/** DEFRA emission conversion factor definition. */
export type EmissionFactor = {
  category: EmissionCategory;
  subcategory: string;
  factor: number;
  unit: string;
  source: string;
  version: string;
};

/** Canonical list of trackable emission categories. */
export const EMISSION_CATEGORIES: EmissionCategory[] = [
  'transport',
  'food',
  'home_energy',
  'shopping',
  'services',
];

/** Subcategory options grouped by emission category. */
export const SUBCATEGORIES: Record<EmissionCategory, { value: string; label: string }[]> = {
  transport: [
    { value: 'car_petrol', label: 'Car (petrol)' },
    { value: 'car_diesel', label: 'Car (diesel)' },
    { value: 'car_electric', label: 'Car (electric)' },
    { value: 'train', label: 'Train' },
    { value: 'flight_short', label: 'Flight (short haul)' },
    { value: 'flight_long', label: 'Flight (long haul)' },
    { value: 'bus', label: 'Bus' },
    { value: 'cycling', label: 'Cycling' },
  ],
  food: [
    { value: 'vegan_meal', label: 'Vegan meal' },
    { value: 'vegetarian_meal', label: 'Vegetarian meal' },
    { value: 'pescatarian_meal', label: 'Pescatarian meal' },
    { value: 'omnivore_meal', label: 'Omnivore meal' },
    { value: 'meat_heavy_meal', label: 'Meat-heavy meal' },
    { value: 'food_waste', label: 'Food waste' },
  ],
  home_energy: [
    { value: 'electricity', label: 'Electricity' },
    { value: 'gas', label: 'Natural gas' },
    { value: 'heating_oil', label: 'Heating oil' },
  ],
  shopping: [
    { value: 'clothing', label: 'Clothing' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
  ],
  services: [
    { value: 'streaming', label: 'Streaming' },
    { value: 'banking', label: 'Banking' },
    { value: 'healthcare', label: 'Healthcare' },
  ],
};

/** Supported measurement units for carbon entries. */
export const UNITS = ['km', 'miles', 'kWh', 'GBP', 'EUR', 'USD', 'meals', 'kg', 'hours'] as const;
export type Unit = (typeof UNITS)[number];
