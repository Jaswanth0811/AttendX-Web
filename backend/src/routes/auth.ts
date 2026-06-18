import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { isFallback, query } from '../db';
import { store } from '../mockStore';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'attendx-jwt-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'attendx-jwt-refresh-secret';

// ---- Middleware to Authenticate JWT ----
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'faculty' | 'student';
    profileId?: string; // profile ID if student or faculty
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ success: false, message: 'Invalid or expired access token' });
      return;
    }
    req.user = decoded;
    next();
  });
};

// ---- Auth Routes ----

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    res.status(400).json({ success: false, message: 'Email, password, and role are required' });
    return;
  }

  try {
    let userRecord: any = null;

    if (isFallback()) {
      // Memory Store lookup
      const found = store.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
      if (found) {
        userRecord = {
          id: found.id,
          email: found.email,
          password_hash: found.passwordHash,
          role: found.role,
          first_name: found.firstName,
          last_name: found.lastName,
          is_active: found.isActive
        };
      }
    } else {
      // Database lookup
      const result = await query('SELECT * FROM users WHERE email = $1 AND role = $2', [email.toLowerCase(), role]);
      if (result.rows.length > 0) {
        userRecord = result.rows[0];
      }
    }

    if (!userRecord) {
      res.status(401).json({ success: false, message: 'Invalid credentials or role' });
      return;
    }

    if (!userRecord.is_active) {
      res.status(403).json({ success: false, message: 'Your account is deactivated' });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, userRecord.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Get specific profile ID for student/faculty
    let profileId: string | undefined = undefined;
    if (role === 'faculty') {
      if (isFallback()) {
        const profile = store.facultyProfiles.find(p => p.userId === userRecord.id);
        profileId = profile?.id;
      } else {
        const profileRes = await query('SELECT id FROM faculty_profiles WHERE user_id = $1', [userRecord.id]);
        if (profileRes.rows.length > 0) {
          profileId = profileRes.rows[0].id;
        }
      }
    } else if (role === 'student') {
      if (isFallback()) {
        const profile = store.studentProfiles.find(p => p.userId === userRecord.id);
        profileId = profile?.id;
      } else {
        const profileRes = await query('SELECT id FROM student_profiles WHERE user_id = $1', [userRecord.id]);
        if (profileRes.rows.length > 0) {
          profileId = profileRes.rows[0].id;
        }
      }
    }

    // Generate JWT
    const payload = {
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      profileId
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); // 1 day for convenient dev
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Update last login
    const nowStr = new Date().toISOString();
    if (isFallback()) {
      const idx = store.users.findIndex(u => u.id === userRecord.id);
      if (idx !== -1) {
        store.users[idx].lastLogin = nowStr;
      }
    } else {
      await query('UPDATE users SET last_login = $1, updated_at = $1 WHERE id = $2', [nowStr, userRecord.id]);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userRecord.id,
          email: userRecord.email,
          role: userRecord.role,
          name: `${userRecord.first_name} ${userRecord.last_name}`,
          firstName: userRecord.first_name,
          lastName: userRecord.last_name,
          profileId
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token is required' });
    return;
  }

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    const payload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      profileId: decoded.profileId
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  });
});

// Get Me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    let userRecord: any = null;

    if (isFallback()) {
      const found = store.users.find(u => u.id === req.user?.id);
      if (found) {
        userRecord = {
          id: found.id,
          email: found.email,
          role: found.role,
          first_name: found.firstName,
          last_name: found.lastName,
          avatar_url: found.avatarUrl,
          is_active: found.isActive
        };
      }
    } else {
      const result = await query('SELECT id, email, role, first_name, last_name, avatar_url, is_active FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length > 0) {
        userRecord = result.rows[0];
      }
    }

    if (!userRecord) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userRecord.id,
          email: userRecord.email,
          role: userRecord.role,
          name: `${userRecord.first_name} ${userRecord.last_name}`,
          firstName: userRecord.first_name,
          lastName: userRecord.last_name,
          avatarUrl: userRecord.avatar_url,
          profileId: req.user.profileId
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Reset password request
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }
  // Simulate dispatching a reset password link
  res.json({
    success: true,
    message: 'Password reset instructions have been sent to your email.'
  });
});

export default router;
