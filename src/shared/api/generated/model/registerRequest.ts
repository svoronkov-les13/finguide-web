
export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  /** @minLength 8 */
  password: string;
}
