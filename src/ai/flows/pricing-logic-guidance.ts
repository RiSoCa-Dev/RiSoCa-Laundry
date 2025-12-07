// pricing-logic-guidance.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered guidance on laundry service options and pricing.
 *
 * The flow helps users understand available services and pricing, avoid incorrect selections, and ensure they get the best value.
 * It includes:
 *   - pricingLogicGuidance: The main function to initiate the guidance flow.
 *   - PricingLogicGuidanceInput: The input type for the pricingLogicGuidance function.
 *   - PricingLogicGuidanceOutput: The output type for the pricingLogicGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const PricingLogicGuidanceInputSchema = z.object({
  serviceTypes: z
    .array(z.string())
    .describe('An array of service types selected by the user (e.g., wash, dry, fold).'),
  distance: z.number().describe('The distance for pickup and delivery, in miles.'),
  addOns: z
    .array(z.string())
    .optional()
    .describe('Optional add-on services selected by the user (e.g., stain removal, ironing).'),
});
export type PricingLogicGuidanceInput = z.infer<typeof PricingLogicGuidanceInputSchema>;

// Define the output schema
const PricingLogicGuidanceOutputSchema = z.object({
  isValidCombination: z
    .boolean()
    .describe('Whether the selected service combination is valid or not.'),
  suggestedServices: z
    .array(z.string())
    .describe('AI-powered suggestions for service options.'),
  computedPrice: z.number().describe('The computed price based on selected services and distance.'),
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
  prompt: `You are an AI assistant designed to guide users in selecting laundry service options and understanding pricing.

  Based on the user's selections for service types ({{{serviceTypes}}}), distance ({{{distance}}} miles), and add-ons ({{{addOns}}}), provide the following:

  1.  isValidCombination: Determine if the selected service combination is valid.
  2.  suggestedServices: Offer AI-powered suggestions for alternative or additional service options that might provide better value or meet the user's needs more effectively.  Explain WHY you are suggesting the service.
  3.  computedPrice: Compute the total price based on the service selections, distance, and any applicable surcharges or discounts.
      Consider a base price per service, distance-based surcharges (e.g., $1 per mile), and add-on costs.
  4.  invalidServiceChoices: If there are any invalid or incompatible service choices, flag them and explain why they are not valid.

  Ensure that the output is well-structured and easy to understand for the user.
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
