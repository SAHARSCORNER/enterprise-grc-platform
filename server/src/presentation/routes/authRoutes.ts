import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { comparePassword, generateTokens, hashPassword } from '../../infrastructure/auth';
import { UserRole } from '@grc/shared';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
        },
        tokens,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const passwordHash = await hashPassword(password || 'password123');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role || UserRole.READ_ONLY,
        department: department || 'General',
      },
    });

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
        },
        tokens,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
