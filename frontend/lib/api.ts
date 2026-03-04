const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

export async function api<T>(
  endpoint: string,
  options: RequestInit & { token?: boolean; adminToken?: boolean } = {}
): Promise<T> {
  const { token: useToken = true, adminToken: useAdmin = false, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  if (useAdmin && getAdminToken()) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${getAdminToken()}`;
  } else if (useToken && getToken()) {
    (headers as Record<string, string>)['Authorization'] = `Token ${getToken()}`;
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.detail || JSON.stringify(err) || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const auth = {
  signup: (data: { email: string; username: string; password: string; password_confirm: string; first_name?: string; last_name?: string }) =>
    api<{ user: User; token: string }>('/auth/signup/', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    api<{ user: User; token: string }>('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => api<User>('/auth/me/'),
};

// Products
export const products = {
  list: (params?: { page?: number; category?: number; min_price?: number; max_price?: number; search?: string; sort?: string }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.category) sp.set('category', String(params.category));
    if (params?.min_price != null) sp.set('min_price', String(params.min_price));
    if (params?.max_price != null) sp.set('max_price', String(params.max_price));
    if (params?.search) sp.set('search', params.search);
    if (params?.sort) sp.set('sort', params.sort);
    const q = sp.toString();
    return api<PaginatedProducts>(`/products/${q ? '?' + q : ''}`);
  },
  get: (id: number) => api<ProductDetail>(`/products/${id}/`),
  featured: () => api<ProductListItem[]>('/products/featured/'),
};

// Categories
export const categories = {
  list: () => api<Category[]>('/categories/'),
};

// Cart
export const cart = {
  get: () => api<CartResponse>('/cart/'),
  add: (product_id: number, quantity?: number) =>
    api<CartResponse>('/cart/add/', { method: 'POST', body: JSON.stringify({ product_id, quantity: quantity ?? 1 }) }),
  update: (item_id: number, quantity: number) =>
    api<CartResponse>('/cart/update/', { method: 'POST', body: JSON.stringify({ item_id, quantity }) }),
  remove: (item_id: number) =>
    api<CartResponse>('/cart/remove/', { method: 'POST', body: JSON.stringify({ item_id }) }),
};

// Orders
export const orders = {
  list: () => api<Order[]>('/orders/'),
  create: (data: ShippingInfo) => api<Order>('/orders/create/', { method: 'POST', body: JSON.stringify(data) }),
};

// Admin
export const admin = {
  login: (username: string, password: string) =>
    api<{ token: string; username: string }>('/admin/login/', { method: 'POST', token: false, body: JSON.stringify({ username, password }) }),
  dashboard: () => api<AdminDashboard>('/admin/dashboard/', { adminToken: true }),
  orders: (status?: AdminOrderFilter) =>
    api<AdminOrdersResponse>(`/admin/orders/${status && status !== 'all' ? `?status=${status}` : ''}`, { adminToken: true }),
  order: (id: number) => api<Order>(`/admin/orders/${id}/`, { adminToken: true }),
  orderUpdateStatus: (id: number, status: OrderStatusValue) =>
    api<Order>(`/admin/orders/${id}/`, { method: 'PATCH', adminToken: true, body: JSON.stringify({ status }) }),
  products: () => api<ProductListItem[]>('/admin/products/', { adminToken: true }),
  product: (id: number) => api<ProductDetail>(`/admin/products/${id}/`, { adminToken: true }),
  productCreate: (data: FormData | Record<string, unknown>) => {
    const isForm = data instanceof FormData;
    const headers: Record<string, string> = isForm ? {} : { 'Content-Type': 'application/json' };
    const token = getAdminToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE}/admin/products/`, {
      method: 'POST',
      headers,
      body: isForm ? data : JSON.stringify(data),
    }).then(r => {
      if (!r.ok) return r.json().then(j => { throw new Error(j.error || JSON.stringify(j)); });
      return r.json();
    }) as Promise<ProductDetail>;
  },
  productUpdate: (id: number, data: Partial<ProductDetail> | FormData) => {
    if (data instanceof FormData) {
      return fetch(`${API_BASE}/admin/products/${id}/`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getAdminToken()}` },
        body: data,
      }).then(r => { if (!r.ok) return r.json().then((j: { error?: string }) => { throw new Error(j.error || 'Update failed'); }); return r.json(); }) as Promise<ProductDetail>;
    }
    return api<ProductDetail>(`/admin/products/${id}/`, { method: 'PUT', adminToken: true, body: JSON.stringify(data) });
  },
  productDelete: (id: number) =>
    api<void>(`/admin/products/${id}/`, { method: 'DELETE', adminToken: true }),
  productAddImages: (id: number, formData: FormData) =>
    fetch(`${API_BASE}/admin/products/${id}/images/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAdminToken()}` },
      body: formData,
    }).then(r => { if (!r.ok) return r.json().then((j: { error?: string }) => { throw new Error(j.error || 'Upload failed'); }); return r.json(); }) as Promise<ProductDetail>,
  productDeleteImage: (productId: number, imageId: number) =>
    api<void>(`/admin/products/${productId}/images/${imageId}/`, { method: 'DELETE', adminToken: true }),
  categories: () => api<Category[]>('/admin/categories/', { adminToken: true }),
  categoryCreate: (data: { name: string; slug: string; description?: string }) =>
    api<Category>('/admin/categories/', { method: 'POST', adminToken: true, body: JSON.stringify(data) }),
  categoryUpdate: (id: number, data: Partial<Category>) =>
    api<Category>(`/admin/categories/${id}/`, { method: 'PUT', adminToken: true, body: JSON.stringify(data) }),
  categoryDelete: (id: number) =>
    api<void>(`/admin/categories/${id}/`, { method: 'DELETE', adminToken: true }),
  users: () => api<User[]>('/admin/users/', { adminToken: true }),
};

// Types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  created_at?: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  category: number;
  category_name: string;
  stock: number;
  is_featured: boolean;
  primary_image: string | null;
  created_at: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
  order: number;
}

export interface Review {
  id: number;
  user_email: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  images: ProductImage[];
  reviews: Review[];
  average_rating: number | null;
}

export interface PaginatedProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductListItem[];
}

export interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_price: string;
  product_image: string | null;
  quantity: number;
  subtotal: string;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  total: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price: string;
  subtotal?: string;
}

export type OrderStatusValue = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  order_number: string;
  status: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  notes?: string;
  total: string;
  items: OrderItem[];
  created_at: string;
}

export interface ShippingInfo {
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  notes?: string;
}

export interface AdminDashboard {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  orders_last_30_days: number;
  recent_orders: Order[];
}

export type AdminOrderFilter = 'all' | 'pending' | 'sent' | 'complete' | 'return';

export interface AdminOrderStats {
  all: number;
  pending: number;
  sent: number;
  complete: number;
  return: number;
}

export interface AdminOrdersResponse {
  orders: Order[];
  stats: AdminOrderStats;
}
