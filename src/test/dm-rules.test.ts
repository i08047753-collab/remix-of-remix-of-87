import { describe, expect, it } from 'vitest';
import { DM_MAX_LENGTH, dmSendSchema, memberSearchPrefix } from '@/lib/dm-rules';

const ids = { conversationId: '00000000-0000-4000-8000-000000000001', clientId: '00000000-0000-4000-8000-000000000002' };
describe('private messages', () => {
  it('rejects empty or whitespace-only messages', () => {
    expect(dmSendSchema.safeParse({ ...ids, body: '   ' }).success).toBe(false);
  });
  it('limits messages to 2000 characters', () => {
    expect(DM_MAX_LENGTH).toBe(2000);
    expect(dmSendSchema.safeParse({ ...ids, body: 'a'.repeat(2000) }).success).toBe(true);
    expect(dmSendSchema.safeParse({ ...ids, body: 'a'.repeat(2001) }).success).toBe(false);
  });
  it('never accepts a sender id from the browser', () => {
    const parsed = dmSendSchema.parse({ ...ids, body: 'مرحبا', senderId: 'forged' });
    expect('senderId' in parsed).toBe(false);
  });
  it('turns search text into a safe username prefix', () => {
    expect(memberSearchPrefix(' @Storm_Ali%* ')).toBe('storm_ali');
  });
});
