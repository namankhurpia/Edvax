// Maps API course rows (paise, snake_case) onto the shape the UI components expect.
export function normalizeCourse(c) {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle || '',
    description: c.description || '',
    instructor: c.instructor || '',
    category: c.category || 'General',
    price: Math.round((c.price_paise || 0) / 100),
    mrp: Math.round((c.mrp_paise || 0) / 100),
    lessons: c.lessons || 0,
    hours: c.hours || 0,
    rating: 4.8, // display-only; not tracked in DB yet
    thumbnail:
      c.thumbnail_url ||
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=60',
    // Ratings are not tracked in the DB. Leave null so the UI hides the rating
    // rather than showing an invented number. (Pre-launch: wire real ratings or drop.)
    rating: null,
    chapters: Array.isArray(c.chapters) ? c.chapters : [],
  }
}

export function normalizePost(p) {
  return {
    id: p.id,
    slug: p.slug,
    type: p.type,
    title: p.title,
    excerpt: p.excerpt || '',
    body: p.body || '',
    author: p.author || 'EDVAX',
    cover:
      p.cover_url ||
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=60',
    publishedAt: p.published_at || p.created_at,
  }
}

export function normalizeCaseStudy(cs) {
  return {
    id: cs.id,
    slug: cs.slug,
    title: cs.title,
    court: cs.court || '',
    citation: cs.citation || '',
    category: cs.category || 'General',
    summary: cs.summary || '',
    body: cs.body || '',
    cover: cs.cover_url || '',
  }
}
