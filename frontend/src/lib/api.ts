const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // Try to guess backend URL if hosted on Render
  if (hostname.includes('.onrender.com')) {
    const base = hostname.replace('.onrender.com', '');
    // If the frontend is attendx-web, the backend is likely attendx-web-backend or similar
    if (!base.endsWith('-backend')) {
      return `https://${base}-backend.onrender.com`;
    }
  }
  // Fallback to default production backend URL
  return 'https://attendx-web-backend.onrender.com';
};

export const API_URL = getApiUrl();

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // Retrieve token from storage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('attendx_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed.tokens?.accessToken;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (err) {
        console.warn('Failed to parse auth token for API request', err);
      }
    }
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, mergedOptions);
    
    // Handle unauthorized/session expiry
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('attendx_auth');
        // Force redirect to login page if unauthorized
        const pathname = window.location.pathname;
        if (!pathname.endsWith('/login') && pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error(`API Fetch Error [${url}]:`, err.message);
    return {
      success: false,
      message: 'Failed to connect to the server. Please check your connection.'
    };
  }
}
