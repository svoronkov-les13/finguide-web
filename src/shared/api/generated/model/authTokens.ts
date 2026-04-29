import type { UserProfile } from './userProfile';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}
