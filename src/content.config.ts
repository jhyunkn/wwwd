import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const requiredText = z.string().trim().min(1);

const entries = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/entries' }),
  schema: z.object({
    title: requiredText,
    description: requiredText,
    contentType: z.enum(['Investigation', 'Note']),
    date: z.coerce.date(),
    status: z.enum(['draft', 'review', 'published']).default('review'),
    claim: requiredText.optional(),
    investigation: requiredText.optional(),
    artifact: requiredText.optional(),
    consequence: requiredText.optional(),
    externalConsequence: requiredText.optional(),
    discipline: requiredText,
    location: requiredText.optional(),
    tags: z.array(requiredText).min(1),
    hero: requiredText,
    heroAlt: requiredText,
    images: z
      .array(
        z.object({
          src: requiredText,
          alt: requiredText,
          caption: requiredText,
          role: requiredText,
        }),
      )
      .default([]),
  }).superRefine((entry, ctx) => {
    if (entry.contentType === 'Investigation') {
      for (const field of ['claim', 'investigation', 'artifact', 'consequence', 'externalConsequence'] as const) {
        if (!entry[field]) {
          ctx.addIssue({
            code: 'custom',
            path: [field],
            message: 'Investigations require claim, investigation, artifact, consequence, and external consequence. Without the full gate, publish as a Note.',
          });
        }
      }
    }
  }),
});

export const collections = { entries };
