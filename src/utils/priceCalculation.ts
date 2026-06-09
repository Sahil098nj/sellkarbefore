/**
 * Price Calculation Utility
 * Calculates final buyback price from warranty_prices or laptop_prices table data.
 * 
 * For iPads/Phones: Uses warranty_prices table with age buckets 0-3, 3-6, 6-11, 12+ months
 * For Laptops: Uses laptop_prices table with age buckets <1yr, 1-3yrs, >3yrs
 */

export interface LaptopPrice {
  id: string;
  variant_id: string;
  price_less_than_1yr: number;
  price_1_to_3yrs: number;
  price_more_than_3yrs: number;
  condition_deduction_good: number;        // percentage to deduct
  condition_deduction_average: number;     // percentage to deduct
  condition_deduction_below_average: number; // percentage to deduct
  charger_deduction_amount: number;
  box_deduction_amount: number;
  bill_deduction_amount: number;
}

export interface WarrantyPrice {
  id: string;
  variant_id: string;
  price_0_3_months: number;
  price_3_6_months: number;
  price_6_11_months: number;
  price_11_plus_months: number;
  charger_deduction_amount: number;
  box_deduction_amount: number;
  bill_deduction_amount: number;
  phoneconditiondeduction_good: number; // multiplier, e.g., 100 = 1.0x
  phoneconditiondeduction_average: number; // e.g., 85 = 0.85x
  phoneconditiondeduction_belowaverage: number; // e.g., 80 = 0.80x
  call_deduction_percentage: number; // applied if can_make_calls = false
  touch_deduction_percentage: number; // applied if is_touch_working = false
  screen_deduction_percentage: number; // applied if is_screen_original = false
  battery_deduction_percentage: number; // applied if is_battery_healthy = false (Apple only)
}

export interface ConditionData {
  ageGroup?: string | null; // '0-3', '3-6', '6-11', '11+'
  overallCondition?: string | null; // 'good', 'average', 'below-average'
  canMakeCalls?: boolean | null; // false = deduction applied
  isTouchWorking?: boolean | null; // false = deduction applied
  isScreenOriginal?: boolean | null; // false = deduction applied
  isBatteryHealthy?: boolean | null; // false = deduction applied (Apple only)
  hasCharger?: boolean | null;
  hasBox?: boolean | null;
  hasBill?: boolean | null;
  isAppleDevice?: boolean; // determines if battery deduction is applied
}

/**
 * Get age bucket price from warranty_prices based on age_group
 */
function getAgeBucketPrice(warrantyPrices: WarrantyPrice, ageGroup?: string | null): number {
  switch (ageGroup) {
    case '0-3':
      return warrantyPrices.price_0_3_months;
    case '3-6':
      return warrantyPrices.price_3_6_months;
    case '6-11':
      return warrantyPrices.price_6_11_months;
    case '11+':
      return warrantyPrices.price_11_plus_months;
    default:
      // Fallback: use highest price bucket (0-3 months)
      return warrantyPrices.price_0_3_months;
  }
}

/**
 * Get condition multiplier from warranty_prices based on overall_condition
 * Returns as decimal (e.g., 85 → 0.85)
 */
function getConditionMultiplier(warrantyPrices: WarrantyPrice, condition?: string | null): number {
  const multiplierValue = (() => {
    switch (condition) {
      case 'good':
        return warrantyPrices.phoneconditiondeduction_good;
      case 'average':
        return warrantyPrices.phoneconditiondeduction_average;
      case 'below-average':
        return warrantyPrices.phoneconditiondeduction_belowaverage;
      default:
        return warrantyPrices.phoneconditiondeduction_good; // default to good
    }
  })();

  return multiplierValue / 100; // Convert from percentage to decimal
}

/**
 * Calculate final buyback price with all deductions.
 * 
 * Follows the exact specification:
 * 1. Start from age bucket price
 * 2. Sum combined percentage deductions for call, touch, screen, battery (if applicable)
 * 3. Apply combined percentage deduction in one step
 * 4. Apply overall condition percentage multiplier
 * 5. Apply fixed rupee deductions for missing accessories (charger, box, bill)
 * 6. Round to nearest whole number
 * 
 * @param warrantyPrices Row from warranty_prices table for the selected variant
 * @param conditionData User's answers to all condition questions
 * @returns Final offer price rounded to nearest whole number
 */
export function calculateFinalPrice(
  warrantyPrices: WarrantyPrice | null,
  conditionData: ConditionData
): number {
  if (!warrantyPrices) return 0;

  // STEP 1: Get age bucket price as starting point
  let price = getAgeBucketPrice(warrantyPrices, conditionData.ageGroup);

  // STEP 2: Sum combined percentage deductions for condition questions
  let combinedDeductionPercentage = 0;

  // Apply call deduction if user cannot make/receive calls
  if (conditionData.canMakeCalls === false) {
    combinedDeductionPercentage += warrantyPrices.call_deduction_percentage;
  }

  // Apply touch deduction if touch is not working
  if (conditionData.isTouchWorking === false) {
    combinedDeductionPercentage += warrantyPrices.touch_deduction_percentage;
  }

  // Apply screen deduction if screen is not original
  if (conditionData.isScreenOriginal === false) {
    combinedDeductionPercentage += warrantyPrices.screen_deduction_percentage;
  }

  // Apply battery deduction only for Apple devices if battery is not healthy
  if (conditionData.isAppleDevice && conditionData.isBatteryHealthy === false) {
    combinedDeductionPercentage += warrantyPrices.battery_deduction_percentage;
  }

  // STEP 3: Apply combined percentage deduction in one step
  price = price * (1 - combinedDeductionPercentage / 100);

  // STEP 4: Apply overall condition percentage multiplier
  const conditionMultiplier = getConditionMultiplier(warrantyPrices, conditionData.overallCondition);
  price = price * conditionMultiplier;

  // STEP 5: Apply fixed rupee amount deductions for missing accessories
  if (conditionData.hasCharger === false) {
    price -= warrantyPrices.charger_deduction_amount;
  }

  if (conditionData.hasBox === false) {
    price -= warrantyPrices.box_deduction_amount;
  }

  if (conditionData.hasBill === false) {
    price -= warrantyPrices.bill_deduction_amount;
  }

  // STEP 6: Round to nearest whole number and ensure non-negative
  return Math.max(Math.round(price), 0);
}

// ── Laptop Price Calculation ────────────────────────────────────────────────

export interface LaptopConditionData {
  ageGroup?: string | null; // 'less_than_1yr', '1_to_3yrs', 'more_than_3yrs'
  overallCondition?: string | null; // 'good', 'average', 'below-average'
  hasCharger?: boolean | null;
  hasBox?: boolean | null;
  hasBill?: boolean | null;
}

/**
 * Get age bucket price from laptop_prices based on age_group
 */
function getLaptopAgePrice(laptopPrices: LaptopPrice, ageGroup?: string | null): number {
  switch (ageGroup) {
    case 'less_than_1yr':
      return laptopPrices.price_less_than_1yr;
    case '1_to_3yrs':
      return laptopPrices.price_1_to_3yrs;
    case 'more_than_3yrs':
      return laptopPrices.price_more_than_3yrs;
    default:
      // Fallback: use middle price bucket (1-3 years)
      return laptopPrices.price_1_to_3yrs;
  }
}

/**
 * Get condition deduction percentage from laptop_prices based on overall_condition
 * Returns as percentage (e.g., 10 = 10% deduction)
 */
function getLaptopConditionDeduction(laptopPrices: LaptopPrice, condition?: string | null): number {
  switch (condition) {
    case 'good':
      return laptopPrices.condition_deduction_good;
    case 'average':
      return laptopPrices.condition_deduction_average;
    case 'below-average':
      return laptopPrices.condition_deduction_below_average;
    default:
      return laptopPrices.condition_deduction_good; // default to good deduction
  }
}

/**
 * Calculate final laptop buyback price with all deductions.
 * 
 * Formula:
 * finalPrice = (basePrice × (1 - conditionDeduction% / 100)) - chargerDeduction - boxDeduction - billDeduction
 * 
 * @param laptopPrices Row from laptop_prices table for the selected variant
 * @param conditionData User's answers to condition questions
 * @returns Final offer price rounded to nearest whole number
 */
export function calculateLaptopPrice(
  laptopPrices: LaptopPrice | null,
  conditionData: LaptopConditionData
): number {
  if (!laptopPrices) return 0;

  // STEP 1: Get age bucket price as starting point
  let price = getLaptopAgePrice(laptopPrices, conditionData.ageGroup);

  // STEP 2: Apply condition deduction (percentage)
  const conditionDeduction = getLaptopConditionDeduction(laptopPrices, conditionData.overallCondition);
  price = price * (1 - conditionDeduction / 100);

  // STEP 3: Apply fixed rupee amount deductions for missing accessories
  // Default deductions if not specified
  const chargerDeduction = conditionData.hasCharger === false ? (laptopPrices.charger_deduction_amount || 1500) : 0;
  const boxDeduction = conditionData.hasBox === false ? (laptopPrices.box_deduction_amount || 500) : 0;
  const billDeduction = conditionData.hasBill === false ? (laptopPrices.bill_deduction_amount || 300) : 0;

  price = price - chargerDeduction - boxDeduction - billDeduction;

  // STEP 4: Round to nearest whole number and ensure non-negative
  return Math.max(Math.round(price), 0);
}
