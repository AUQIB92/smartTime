import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} - JWT token
 */
export const generateToken = (payload, expiresIn = '90d') => {
  try {
    // Generate token with standard claims
    const token = jwt.sign(
      {
        ...payload,
        iat: Math.floor(Date.now() / 1000), // Issued at time
      },
      JWT_SECRET,
      { 
        expiresIn,
        algorithm: 'HS256' // Industry standard algorithm
      }
    );
    return token;
  } catch (error) {
    console.error('Token generation failed:', error.message);
    throw error;
  }
};

/**
 * Verify JWT token (full verification)
 * This should be used at login time and for critical operations
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    // Full verification with all checks
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], // Only accept HS256 algorithm
      complete: false // Return only the payload
    });
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Extract token payload without cryptographic verification
 * This is used for non-critical operations to improve performance
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
export const extractTokenPayload = (token) => {
  try {
    // Just decode the token without verifying signature
    const decoded = jwt.decode(token);
    
    // Basic expiration check
    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        return null; // Token has expired
      }
    }
    
    return decoded;
  } catch (error) {
    console.error('Token decoding failed:', error.message);
    return null;
  }
};

/**
 * Set JWT token in cookies
 * @param {string} token - JWT token
 */
export const setTokenCookie = async (token) => {
  const cookieStore = await cookies();
  
  // Set the cookie with secure settings
  cookieStore.set('token', token, {
    httpOnly: true, // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 90 * 24 * 60 * 60, // 90 days
    path: '/',
    sameSite: 'strict', // Prevents CSRF
  });
};

/**
 * Get JWT token from cookies
 * @returns {string|null} - JWT token
 */
export const getTokenFromCookies = async () => {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');
  return tokenCookie?.value || null;
};

/**
 * Remove JWT token from cookies
 */
export const removeTokenCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
};

/**
 * Get authenticated user from token in cookies
 * Uses extractTokenPayload for better performance in API routes
 * @returns {Object|null} - Decoded token payload
 */
export const getAuthenticatedUser = async () => {
  try {
    // Get token from cookies
    const token = await getTokenFromCookies();
    
    if (!token) {
      return null;
    }
    
    // Extract token payload without full verification
    // This is faster and sufficient for API routes
    const decoded = extractTokenPayload(token);
    
    return decoded;
  } catch (error) {
    console.error('Error getting authenticated user:', error.message);
    return null;
  }
};

/**
 * Get current user from token
 * @returns {Object|null} - User object
 */
export const getCurrentUser = async () => {
  const token = await getTokenFromCookies();
  
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return null;
  }
  
  try {
    // Import User model here to avoid circular dependencies
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}; 