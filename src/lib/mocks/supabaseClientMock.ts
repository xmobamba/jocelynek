import type { PostgrestError } from '@supabase/supabase-js';

type InsertPayload = Record<string, unknown>;

type MockOptions = {
  delayMs?: number;
  error?: Partial<PostgrestError> & { message: string };
};

const wait = (duration: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });

export const createSupabaseNewsletterMock = ({ delayMs = 0, error }: MockOptions = {}) => {
  return {
    async insert(payload: InsertPayload) {
      void payload;
      if (delayMs > 0) {
        await wait(delayMs);
      }

      if (error) {
        return {
          error: {
            code: error.code ?? 'MOCK_ERROR',
            details: error.details ?? 'Erreur simulée pour test manuel.',
            hint: error.hint ?? null,
            message: error.message,
          } satisfies PostgrestError,
        };
      }

      return { error: null };
    },
  };
};

export type SupabaseNewsletterMock = ReturnType<typeof createSupabaseNewsletterMock>;
