/** @format */

export type jwtPayload = {
  id: number;
  userEmail: string;
  role: 'USER' | 'ADMIN';
};
