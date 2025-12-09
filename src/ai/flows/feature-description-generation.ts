'use server';

/**
 * @fileOverview AI-powered feature description generator for the RKR Laundry app.
 *
 * - generateFeatureDescription - A function that generates descriptions for app features.
 * - FeatureDescriptionInput - The input type for the generateFeatureDescription function.
 * - FeatureDescriptionOutput - The return type for the generateFeatureDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FeatureDescriptionInputSchema = z.object({
  featureName: z.string().describe('The name of the application feature.'),
});

export type FeatureDescriptionInput = z.infer<typeof FeatureDescriptionInputSchema>;

const FeatureDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed, user-friendly description of the feature.'),
});

export type FeatureDescriptionOutput = z.infer<typeof FeatureDescriptionOutputSchema>;

export async function generateFeatureDescription(input: FeatureDescriptionInput): Promise<FeatureDescriptionOutput> {
  return generateFeatureDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'featureDescriptionPrompt',
  input: {schema: FeatureDescriptionInputSchema},
  output: {schema: FeatureDescriptionOutputSchema},
  prompt: `You are a marketing expert for a software company. Your task is to generate a concise and compelling description for a feature of the "RKR Laundry" application. The description should be engaging for a potential customer.

  Please provide a description for the following feature:

  Feature Name: {{{featureName}}}
  `,
});

const generateFeatureDescriptionFlow = ai.defineFlow(
  {
    name: 'generateFeatureDescriptionFlow',
    inputSchema: FeatureDescriptionInputSchema,
    outputSchema: FeatureDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
