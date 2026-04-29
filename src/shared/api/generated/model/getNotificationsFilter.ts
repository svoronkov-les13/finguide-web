
export type GetNotificationsFilter = typeof GetNotificationsFilter[keyof typeof GetNotificationsFilter];


export const GetNotificationsFilter = {
  all: 'all',
  unread: 'unread',
} as const;
