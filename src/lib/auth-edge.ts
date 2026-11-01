import { jwtVerify } from 'jose';
import { RolUsuario, RubroIndustria } from '@prisma/client';

export const AUTH_COOKIE_NAME = 'sgcs_session';

export interface UserSessionPayload {
  userId: string;
  email: string;
  nombreCompleto: string;
  rol: RolUsuario;
  organizacionId: string;
  organizacionNombre: string;
  rubro: RubroIndustria;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-min-32-chars-utp-clara';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function verifySessionTokenEdge(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as UserSessionPayload;
  } catch {
    return null;
  }
}
