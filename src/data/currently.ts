/** About page → "Currently". `value` accepts inline HTML. */
export type Current = { key: string; value: string; note?: string };

export const currently: Current[] = [
  { key: 'reading', value: '<em>The Society of Mind</em>' },
  { key: 'thinking', value: 'which problems are worth getting stuck on for the next few years' },
];
