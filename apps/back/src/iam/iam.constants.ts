export const REQUEST_USER_KEY = 'user';

export const AUTH_KINDS = {
    Bearer: 'bearer',
    None: 'none',
} as const;

export type AuthKind = (typeof AUTH_KINDS)[keyof typeof AUTH_KINDS];
