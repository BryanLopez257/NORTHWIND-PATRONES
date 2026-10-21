export interface UserProfile {
  email: string;
  name: string;
}

export interface DecodedTokenPayload {
  email?: string;
  name?: string;
  FullName?: string;
  unique_name?: string;
  sub?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'?: string;
  exp?: number;
  [key: string]: unknown;
}

export function parseJwt(token: string): DecodedTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as DecodedTokenPayload;
  } catch {
    return null;
  }
}

export function extractClaims(token: string): UserProfile {
  const payload = parseJwt(token);
  if (!payload) {
    return { email: '', name: '' };
  }

  // 1. Email detection:
  // In ASP.NET Core Identity with JwtService.cs:
  // new Claim(ClaimTypes.Name, userDto.Email) maps to:
  // "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
  const email =
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    payload.email ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    payload.unique_name ||
    payload.sub ||
    '';

  // 2. Name detection:
  // Backend explicitly injects: new Claim("FullName", $"{userDto.FirstName} {userDto.LastName}")
  const msGivenName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
  const msSurname = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'];
  const combinedMsName = [msGivenName, msSurname].filter(Boolean).join(' ');

  let name = '';
  if (payload.FullName && typeof payload.FullName === 'string') {
    name = payload.FullName.trim();
  } else if (combinedMsName) {
    name = combinedMsName;
  } else if (payload.name && typeof payload.name === 'string' && !payload.name.includes('@')) {
    name = payload.name.trim();
  } else if (email) {
    name = email.split('@')[0];
  } else {
    name = 'Usuario';
  }

  return { email, name };
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowInSeconds;
}
