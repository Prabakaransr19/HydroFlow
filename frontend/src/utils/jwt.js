/**
 * Helper utility to safely parse JSON Web Tokens (JWT) without external libraries.
 */

export const parseJwt = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
};

/**
 * Standardize role name from JWT claims or user object.
 * Strips any 'ROLE_' prefix if present (e.g., ROLE_SUPER_ADMIN -> SUPER_ADMIN).
 */
export const normalizeRole = (role) => {
  if (!role) return '';
  const cleanRole = String(role).toUpperCase().replace(/^ROLE_/, '');
  return cleanRole;
};

/**
 * Extracts user role from JWT token payload or user object.
 */
export const extractRoleFromToken = (token) => {
  const payload = parseJwt(token);
  if (!payload) return null;

  const rawRole = payload.role || payload.roles?.[0] || payload.authorities?.[0] || payload.authority;
  return normalizeRole(rawRole);
};

/**
 * Checks whether a JWT token has expired.
 */
export const isTokenExpired = (token) => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};
