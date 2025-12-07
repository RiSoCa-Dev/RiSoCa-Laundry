
// pricing-logic-guidance.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered guidance on laundry service options and pricing.
 *
 * The flow helps users understand available packages and pricing, ensuring they get the best value.
 * It includes:
 *   - pricingLogicGuidance: The main function to initiate the guidance flow.
 *   - PricingLogicGuidanceInput: The input type for the pricingLogicGuidance function.
 *   - PricingLogicGuidanceOutput: The output type for the pricingLogicGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const PricingLogicGuidanceInputSchema = z.object({
  servicePackage: z.string().describe('The service package selected by the user (e.g., package1, package2).'),
  loads: z.number().describe('The number of laundry loads.'),
  distance: z.number().describe('The distance for pickup and/or delivery, in kilometers.'),
});
export type PricingLogicGuidanceInput = z.infer<typeof PricingLogicGuidanceInputSchema>;

// Define the output schema
const PricingLogicGuidanceOutputSchema = z.object({
  isValidCombination: z
    .boolean()
    .describe('Whether the selected service combination is valid or not. All combinations are valid, so this should be true.'),
  suggestedServices: z
    .array(z.string())
    .describe('AI-powered suggestions for service options.'),
  computedPrice: z.number().describe('The computed price in Philippine Peso (PHP).'),
  invalidServiceChoices: z
    .array(z.string())
    .optional()
    .describe('Flags for invalid service choices, if any.'),
});
export type PricingLogicGuidanceOutput = z.infer<typeof PricingLogicGuidanceOutputSchema>;

// Define the main function
export async function pricingLogicGuidance(input: PricingLogicGuidanceInput): Promise<PricingLogicGuidanceOutput> {
  return pricingLogicGuidanceFlow(input);
}

// Define the prompt
const pricingLogicGuidancePrompt = ai.definePrompt({
  name: 'pricingLogicGuidancePrompt',
  input: {schema: PricingLogicGuidanceInputSchema},
  output: {schema: PricingLogicGuidanceOutputSchema},
  prompt: `You are an AI assistant for a laundry service, designed to calculate the price of an order in Philippine Pesos (PHP).

  Here is the pricing structure:
  - Package 1 (Wash, Dry, Fold): ₱180 per load.
  - Pick Up Fee: ₱10 per kilometer.
  - Delivery Fee: ₱10 per kilometer.

  Packages:
  - Package 1: Base service only. No transport.
  - Package 2: Includes Pick Up and Customer returns to pick up.
  - Package 3: Customer drops off and includes Delivery.
  - Package 4: Includes both Pick Up and Delivery.

  User Selections:
  - Package: {{{servicePackage}}}
  - Number of Loads: {{{loads}}}
  - Distance: {{{distance}}} km

  Tasks:
  1.  **isValidCombination**: This is always true.
  2.  **computedPrice**: Calculate the total price in PHP based on the selected package, number of loads, and distance.
      - Calculate the base cost: {{{loads}}} * 180.
      - For Package 2, add a pickup fee: {{{distance}}} * 10.
      - For Package 3, add a delivery fee: {{{distance}}} * 10.
      - For Package 4, add both a pickup and delivery fee: ({{{distance}}} * 10) * 2.
      - Sum the costs to get the final price.
  3.  **suggestedServices**: If the user selects Package 2 or 3, suggest Package 4 as a convenient "All-In" option. If they choose Package 1 with a distance > 0, suggest a package with delivery. Otherwise, provide an empty array.
  4.  **invalidServiceChoices**: This should be an empty array.

  Provide only the JSON output.
`,
});

// Define the flow
const pricingLogicGuidanceFlow = ai.defineFlow(
  {
    name: 'pricingLogicGuidanceFlow',
    inputSchema: PricingLogicGuidanceInputSchema,
    outputSchema: PricingLogicGuidanceOutputSchema,
  },
  async input => {
    const {output} = await pricingLogicGuidancePrompt(input);
    return output!;
  }
);
