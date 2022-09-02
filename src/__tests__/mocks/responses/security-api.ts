import { RedirectionStatusUrls, Token, User, Whoami } from 'src/gen/bpClient';

export const phone1 = '0648492113';
export const authStatusUrls1: RedirectionStatusUrls = { successUrl: '/login/success', failureUrl: 'login/failure' };
export const user1: User = { id: 'mock-user-id1', firstName: 'First Name 1', lastName: 'last Name 1', phone: '11 11 11' };
export const whoami1: Whoami = { user: user1 };
export const token1: Token = { accessToken: 'accessToken1', whoami: whoami1 };
