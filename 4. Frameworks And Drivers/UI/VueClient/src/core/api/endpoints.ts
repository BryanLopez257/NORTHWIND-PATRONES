export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/user/Login',
    REGISTER: '/user/Register',
  },
  ORDERS: {
    CREATE: '/CreateOrder',
  },
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: number) => `/products/${id}`,
  },
  INVOICES: {
    BASE: '/invoices',
    BY_ID: (id: number) => `/invoices/${id}`,
  },
} as const;
