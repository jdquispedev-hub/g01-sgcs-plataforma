import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { RolUsuario, RubroIndustria } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-min-32-chars-utp-clara';
const COOKIE_NAME = 'sgcs_session';

export interface UserSessionPayload {
  userId: string;
  email: string;
  nombreCompleto: string;
  rol: RolUsuario;
  organizacionId: string;
  organizacionNombre: string;
  rubro: RubroIndustria;
}

// -------------------------------------------------------------
// HASHING DE CONTRASEÑAS (RNF-01)
// -------------------------------------------------------------

export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

// -------------------------------------------------------------
// MANEJO DE TOKENS JWT (RNF-02, RNF-03)
// -------------------------------------------------------------

export function signSessionToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '8h',
  });
}

export function verifySessionToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// MANEJO DE COOKIES DE SESIÓN (HttpOnly)
// -------------------------------------------------------------

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
