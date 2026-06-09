# Device Buyback Price Calculation Logic

## Overview
This document describes the exact business logic used to calculate the final buyback price offer shown to customers. The system processes information from the customer's device selection and condition responses to arrive at a final price.

---

## Data Sources

### Primary Pricing Table: `warranty_prices`
This table contains ALL the pricing parameters for a specific device variant. When a customer selects a device, the system retrieves exactly one row from `warranty_prices` that matches their selected variant. This single row contains:

- **Age-based price buckets** (four starting prices based on device age)
- **Yes/No question deduction percentages** (call, touch, screen, battery)
- **Overall condition deduction percentages** (good, average, below-average)
- **Fixed rupee deductions** (charger, box, bill accessories)

### Supporting Tables
- **variants**: Stores the variant ID and base price
- **leads**: Stores the calculated price and condition answers after OTP verification
- **pickup_requests**: Stores the final calculated price when pickup is confirmed

---

## The Six-Step Calculation Formula

### Step 1: Select the Age-Based Starting Price

When the customer selects their device's age/month range during the flow, the system uses that selection as the **starting price bucket**. It does not treat this as a deduction—it is the baseline offer amount.

The age buckets are:
- **0-3 months**: Use `price_0_3_months` from the pricing row
- **3-6 months**: Use `price_3_6_months` from the pricing row
- **6-11 months**: Use `price_6_11_months` from the pricing row
- **12+ months**: Use `price_11_plus_months` from the pricing row

If no age is selected, the system defaults to the newest device bucket (0-3 months).

**Example:**
If a customer has a 6-month-old iPhone 14 and the pricing row says `price_6_11_months = 35,000`, then the starting price is ₹35,000.

---

### Step 2: Sum Yes/No Question Deductions

The customer is asked four yes/no condition questions:
1. Can make and receive calls?
2. Is the touch screen working?
3. Is the screen original?
4. (For Apple only) Is the battery healthy?

For each question answered "No," a deduction percentage is applied. These percentages are **not applied iteratively**—they are summed together first.

The deduction percentages come from the `warranty_prices` row:
- Cannot make calls → add `call_deduction_percentage`
- Touch not working → add `touch_deduction_percentage`
- Screen not original → add `screen_deduction_percentage`
- Battery not healthy (Apple only) → add `battery_deduction_percentage`

**Example:**
If the pricing row has:
- `call_deduction_percentage = 5%`
- `touch_deduction_percentage = 8%`
- `screen_deduction_percentage = 15%`

And the customer answers "No" to all three, the combined deduction is: 5 + 8 + 15 = **28%**

---

### Step 3: Apply Combined Percentage Deduction in One Step

Once all applicable percentages are summed, they are reduced from the starting price in a single calculation:

```
Price after deductions = Starting price × (1 - Combined percentage ÷ 100)
```

**Continuing the Example:**
- Starting price: ₹35,000
- Combined deduction: 28%
- Price after deduction: ₹35,000 × (1 - 0.28) = ₹35,000 × 0.72 = **₹25,200**

---

### Step 4: Apply Overall Physical Condition Multiplier

The customer selects an overall physical condition level:
- **Good**: Use `phoneconditiondeduction_good` multiplier
- **Average**: Use `phoneconditiondeduction_average` multiplier
- **Below-average**: Use `phoneconditiondeduction_belowaverage` multiplier

These values are stored as percentages in `warranty_prices` and are used as multipliers. For example:
- If the value is 100, it means 100% = 1.0× (no change)
- If the value is 90, it means 90% = 0.9× (reduce price by 10%)
- If the value is 80, it means 80% = 0.8× (reduce price by 20%)

```
Price after condition = Price after deductions × (Condition multiplier ÷ 100)
```

**Continuing the Example:**
- Price after deductions: ₹25,200
- Customer selects "Average" condition
- `phoneconditiondeduction_average = 85` (i.e., 0.85×)
- Price after condition: ₹25,200 × 0.85 = **₹21,420**

---

### Step 5: Apply Fixed Rupee Accessory Deductions

The customer is asked which accessories they have:
- Do you have the original charger?
- Do you have the original box?
- Do you have the original bill/invoice?

For each accessory the customer does NOT have, a fixed rupee amount is subtracted. These amounts come from the `warranty_prices` row:
- No charger → subtract `charger_deduction_amount`
- No box → subtract `box_deduction_amount`
- No bill → subtract `bill_deduction_amount`

These are absolute rupee deductions, not percentages. They are applied sequentially to the current price.

```
Price after accessories = Price after condition - (Sum of applicable deductions)
```

**Continuing the Example:**
- Price after condition: ₹21,420
- Charger deduction: ₹2,000
- Box deduction: ₹1,500
- Bill deduction: ₹500
- Customer is missing: charger and box
- Price after accessories: ₹21,420 - ₹2,000 - ₹1,500 = **₹17,920**

---

### Step 6: Round to Nearest Whole Number

The final calculated price is rounded to the nearest whole rupee. This ensures a clean, presentable offer amount.

```
Final offer = Round(Price after accessories)
```

**Final Result:** ₹17,920 (already whole, no rounding needed in this example)

---

## Complete Formula in One Expression

For reference, here is the entire calculation as a single formula:

```
Final Price = Round(
  Starting Price 
  × (1 - Combined Question Deductions ÷ 100)
  × (Condition Multiplier ÷ 100)
  - Charger Deduction
  - Box Deduction
  - Bill Deduction
)
```

Where:
- `Starting Price` = age bucket price from `warranty_prices`
- `Combined Question Deductions` = sum of call + touch + screen + battery (if Apple) percentages when answered "No"
- `Condition Multiplier` = one of three values (good/average/below-average) from `warranty_prices`
- All deductions come from a single `warranty_prices` row matched to the selected variant

---

## Key Business Rules

1. **Single Pricing Source**: All pricing parameters for a device come from one row in `warranty_prices` matched by `variant_id`. There are no separate lookup tables for accessories or condition deductions.

2. **Age Selection is the Base Price**: The month/age selection is not a deduction—it determines which price bucket is used as the starting point.

3. **Questions Sum Before Application**: The yes/no condition question deductions are summed first, then applied in one step. They do not compound iteratively.

4. **Condition is a Multiplier, Not a Percentage Reduction**: The overall physical condition works as a multiplier (multiplication), not a direct percentage reduction. A value of 85 means keep 85% of the price (or reduce by 15%).

5. **Accessories are Fixed Amounts**: Missing accessories always result in fixed rupee deductions (₹X amount), not percentage reductions.

6. **Rounding Happens Last**: The final offer is always rounded to the nearest whole rupee after all calculations are complete.

7. **Battery Deduction Only for Apple**: The battery health question deduction only applies to Apple devices (iPhones).

8. **Admin Control**: When the admin updates prices in `warranty_prices`, the new values are used immediately on the next price calculation. No caching or separate configuration needed.

---

## System Workflow

1. Customer selects a device variant
   → System fetches the matching `warranty_prices` row by `variant_id`

2. Customer answers age/month selection
   → System uses this to pick the starting price bucket

3. Customer answers condition questions (call, touch, screen, battery)
   → System determines which percentages to sum

4. Customer selects overall condition (good/average/below-average)
   → System fetches the corresponding multiplier

5. Customer selects accessories (charger, box, bill)
   → System determines fixed amounts to subtract

6. System calculates final price using the six-step formula
   → Price is shown to customer

7. Customer proceeds to OTP verification (Auth screen)
   → Final price, all condition answers, and accessories selection are stored in `leads` table

8. Customer books pickup
   → Final price and condition details are also stored in `pickup_requests` table

---

## Notes for Implementation

- **No Network Round-trips for Pricing**: All pricing data is fetched once from `warranty_prices` when the variant is selected. No subsequent API calls are needed for deductions or condition values.

- **Handling Missing Data**: If a pricing row does not exist for a variant, the system should default to ₹0 or show a message that pricing is not available for that variant.

- **Negative Prices**: If all deductions exceed the starting price, the result is capped at ₹0 (no negative offers).

- **Precision**: Use standard floating-point arithmetic for percentage calculations, then round the final result.

---

## Questions & Clarifications

For any questions about this pricing logic, please refer to this document or contact the product team. The logic is final and has been implemented in the mobile app's price calculation utility.
