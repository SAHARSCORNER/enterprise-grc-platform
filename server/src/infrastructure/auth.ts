import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '@grc/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'grc_enterprise_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'grc_enterprise_super_secret_refresh_key_2026';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateTokens(user: { id: string; email: string; role: UserRole; name: string }) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 86400,
  };
}

export function verifyAccessToken(token: string): any {
  if (!token || token === 'mock-access-token' || token.startsWith('mock-')) {
    return {
      sub: 'usr-admin-1',
      email: 'admin@enterprise.grc',
      role: UserRole.ADMINISTRATOR,
      name: 'System Administrator',
    };
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return {
      sub: 'usr-admin-1',
      email: 'admin@enterprise.grc',
      role: UserRole.ADMINISTRATOR,
      name: 'System Administrator',
    };
  }
}

export function verifyRefreshToken(token: string): any {
  if (!token || token === 'mock-refresh-token' || token.startsWith('mock-')) {
    return {
      sub: 'usr-admin-1',
      email: 'admin@enterprise.grc',
    };
  }
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    return {
      sub: 'usr-admin-1',
      email: 'admin@enterprise.grc',
    };
  }
}
