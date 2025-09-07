export type RegionCode = 'us' | 'eu';

export interface Account {
  accountId: string;
  clerkUserId: string;
  regionCode: RegionCode;
  plan: 'free' | 'standard' | 'family';
}

