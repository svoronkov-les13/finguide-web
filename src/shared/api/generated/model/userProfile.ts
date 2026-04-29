import type { Gender } from './gender';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  /** @nullable */
  phone?: string | null;
  /** @nullable */
  avatarUrl?: string | null;
  /**
     * @minimum 16
     * @maximum 100
     * @nullable
     */
  age?: number | null;
  gender?: Gender | null;
  /** @minimum 0 */
  initialBalance: number;
  createdAt: string;
  updatedAt: string;
}
