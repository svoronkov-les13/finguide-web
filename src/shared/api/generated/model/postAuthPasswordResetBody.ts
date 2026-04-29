
export type PostAuthPasswordResetBody = {
  token: string;
  /** @minLength 8 */
  newPassword: string;
};
