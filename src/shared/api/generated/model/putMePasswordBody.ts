
export type PutMePasswordBody = {
  currentPassword: string;
  /** @minLength 8 */
  newPassword: string;
};
