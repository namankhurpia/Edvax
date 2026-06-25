import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { content } from '../lib/api'
import { normalizePost } from '../lib/transform'

export default function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    content
      .post(slug)
      .then((d) => setPost(normalizePost(d.post)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container-edvax max-w-3xl py-14">
        <div className="h-6 w-40 animate-pulse rounded bg-white/70" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-white/60" />
        <div className="mt-7 aspect-[16/9] w-full animate-pulse rounded-xl bg-white/60" />
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="container-edvax py-24 text-center">
        <h1 className="font-serif text-2xl font-bold">Article not found</h1>
        <Link to="/blog" className="btn-primary mt-6">Back to blog</Link>
      </div>
    )
  }

  return (
    <article>
      <header className="border-b border-ink/10 bg-white">
        <div className="container-edvax max-w-4xl py-12">
          <Link to="/blog" className="text-sm font-medium text-gold-dark hover:underline">← Back to Blog &amp; News</Link>
          <div className="mt-5 flex items-center gap-2 text-xs">
            <span className={`badge ${post.type === 'news' ? 'bg-gold/15 text-gold-dark' : ''}`}>{post.type === 'news' ? 'News' : 'Blog'}</span>
            <span className="text-ink-muted">{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-ink sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-sm font-medium text-ink-muted">By {post.author}</p>
        </div>
      </header>

      <div className="container-edvax max-w-4xl py-12">
        {post.cover && (
          <img src={post.cover} alt={post.title} className="mb-10 aspect-[21/9] w-full rounded-2xl object-cover shadow-card" />
        )}
        {post.excerpt && (
          <p className="border-l-2 border-gold/60 pl-5 font-serif text-xl leading-relaxed text-ink">{post.excerpt}</p>
        )}
        <div className="mt-8 whitespace-pre-line text-[1.05rem] leading-relaxed text-ink-soft">
          {post.body || 'Full article coming soon.'}
        </div>
      </div>
    </article>
  )
}
