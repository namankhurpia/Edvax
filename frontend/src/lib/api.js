// Thin fetch wrapper. Cookies (httpOnly JWT) are sent automatically with credentials.
const BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.status
    err.details = data?.details
    throw err
  }
  return data
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
}

// --- Auth ---
export const auth = {
  me: () => api.get('/auth/me'),
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),
}

// --- Public content ---
export const content = {
  courses: () => api.get('/courses'),
  course: (slug) => api.get(`/courses/${slug}`),
  posts: (type) => api.get(`/posts${type ? `?type=${type}` : ''}`),
  post: (slug) => api.get(`/posts/${slug}`),
  caseStudies: () => api.get('/case-studies'),
  caseStudy: (slug) => api.get(`/case-studies/${slug}`),
}

// --- Image upload (admin) ---
export async function uploadImage(file) {
  const fd = new FormData()
  fd.append('image', file)
  const res = await fetch(`${BASE}/uploads/image`, {
    method: 'POST',
    credentials: 'include',
    body: fd, // no Content-Type header — browser sets multipart boundary
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`)
  return data.url
}

// --- Admin ---
export const admin = {
  courses: () => api.get('/courses/admin/all'),
  course: (id) => api.get(`/courses/admin/${id}`).then((d) => d.course),
  createCourse: (b) => api.post('/courses/admin', b),
  updateCourse: (id, b) => api.put(`/courses/admin/${id}`, b),
  deleteCourse: (id) => api.del(`/courses/admin/${id}`),

  posts: () => api.get('/posts/admin/all'),
  post: (id) => api.get(`/posts/admin/${id}`).then((d) => d.post),
  createPost: (b) => api.post('/posts/admin', b),
  updatePost: (id, b) => api.put(`/posts/admin/${id}`, b),
  deletePost: (id) => api.del(`/posts/admin/${id}`),

  caseStudies: () => api.get('/case-studies/admin/all'),
  caseStudy: (id) => api.get(`/case-studies/admin/${id}`).then((d) => d.caseStudy),
  createCaseStudy: (b) => api.post('/case-studies/admin', b),
  updateCaseStudy: (id, b) => api.put(`/case-studies/admin/${id}`, b),
  deleteCaseStudy: (id) => api.del(`/case-studies/admin/${id}`),

  purchases: (onlyPaid) => api.get(`/payments/admin/all${onlyPaid ? '?status=paid' : ''}`),
  resendReceipt: (id) => api.post(`/payments/admin/${id}/resend`),
  setInviteSent: (id, sent) => api.post(`/payments/admin/${id}/invite`, { sent }),
}
