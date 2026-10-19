const API_BASE = 'http://127.0.0.1:8000/api';

export const INDIAN_STATES = [
  'All India',
  'Maharashtra',
  'Delhi NCR',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'West Bengal',
  'Punjab',
  'Rajasthan',
  'Kerala',
  'Uttar Pradesh',
  'Haryana',
];

/**
 * Fetch all vehicles with optional category and Indian state filter
 */
export async function getVehicles(category = 'all', state = 'all') {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (state && state !== 'All India' && state !== 'all') params.append('state', state);
    
    const url = `${API_BASE}/inventory/vehicles/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend error or unavailable:', err);
    throw err;
  }
}

/**
 * Fetch a single vehicle by ID
 */
export async function getVehicle(id) {
  const res = await fetch(`${API_BASE}/inventory/vehicles/${id}/`);
  if (!res.ok) throw new Error(`Failed to fetch vehicle: ${res.status}`);
  return await res.json();
}

/**
 * Universal Search across Indian Vehicles, Accessories, Parts, and Authorized Dealers
 */
export async function searchUniversal(query = '', type = 'all', state = 'all', sort = 'cheapest') {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (type) params.append('type', type);
  if (state && state !== 'All India' && state !== 'all') params.append('state', state);
  if (sort) params.append('sort', sort);

  const res = await fetch(`${API_BASE}/search/?${params.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  return await res.json();
}

/**
 * AI Compare 2 or more Vehicles side-by-side with Cheapest Dealer Discovery
 */
export async function compareVehicles(ids, state = 'all') {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids;
  const stateParam = state && state !== 'All India' ? encodeURIComponent(state) : 'all';
  const res = await fetch(`${API_BASE}/ai/compare-vehicles/?ids=${idStr}&state=${stateParam}`);
  if (!res.ok) throw new Error('Vehicle comparison failed');
  return await res.json();
}

/**
 * AI Compare Accessories & Spare Parts with Cheapest Dealer Discovery
 */
export async function compareParts(ids, state = 'all') {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids;
  const stateParam = state && state !== 'All India' ? encodeURIComponent(state) : 'all';
  const res = await fetch(`${API_BASE}/ai/compare-parts/?ids=${idStr}&state=${stateParam}`);
  if (!res.ok) throw new Error('Parts comparison failed');
  return await res.json();
}

/**
 * Ask AI Automotive Advisor for personalized Indian market recommendations
 */
export async function askAiAdvisor(query, state = 'Maharashtra') {
  const res = await fetch(`${API_BASE}/ai/advisor/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, state: state === 'All India' ? 'Maharashtra' : state }),
  });
  if (!res.ok) throw new Error('AI Advisor request failed');
  return await res.json();
}

/**
 * Fetch Authorized Dealers list filtered by state
 */
export async function getDealers(state = 'all') {
  const stateParam = state && state !== 'All India' && state !== 'all' ? `?state=${encodeURIComponent(state)}` : '';
  const res = await fetch(`${API_BASE}/dms/dealers/${stateParam}`);
  if (!res.ok) throw new Error('Failed to fetch dealers');
  return await res.json();
}

/**
 * Submit an inquiry or test-drive lead to DMS
 */
export async function submitInquiry(data) {
  const res = await fetch(`${API_BASE}/dms/leads/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit inquiry');
  }
  return await res.json();
}

/**
 * Fetch luxury parts and accessories
 */
export async function getParts(category = '', state = 'all') {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (state && state !== 'All India' && state !== 'all') params.append('state', state);

  const url = `${API_BASE}/ecommerce/parts/${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch parts: ${res.status}`);
  return await res.json();
}

/**
 * Create a parts order
 */
export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/ecommerce/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error('Order creation failed');
  return await res.json();
}

/**
 * Book an Atelier service appointment
 */
export async function createServiceAppointment(data) {
  const res = await fetch(`${API_BASE}/service/appointments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to schedule appointment');
  }
  return await res.json();
}

/**
 * Check backend health status
 */
export async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch (e) {
    return { online: false, error: e.message };
  }
}
