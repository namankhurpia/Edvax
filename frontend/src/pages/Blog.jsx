import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { content } from '../lib/api'
import { normalizePost } from '../lib/transform'
import { SectionHeading } from '../components/Section.jsx'

const tabs = ['All', 'Blog', 'News']

export default function Blog() {
  const [tab, setTab] = useState('All')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    content
      .posts()
      .then((d) => setPosts(d.posts.map(normalizePost)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const list = posts.filter((p) => tab === 'All' || p.type === tab.toLowerCase())

  return (
    <div className="container-edvax py-14">
      <SectionHeading eyebrow="Insights" title="Blog & News" subtitle="Commentary, explainers and the latest developments in tax and law." />

      <div className="mt-8 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t ? 'bg-navy-800 text-white' : 'bg-white text-ink-muted ring-1 ring-ink/10 hover:ring-gold'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-white/60 ring-1 ring-ink/5" />)}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-16 text-center text-ink-muted">No articles published yet. Add one from the admin panel.</p>
      ) : (
        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="card group overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`badge ${p.type === 'news' ? 'bg-gold/15 text-gold-dark' : ''}`}>{p.type === 'news' ? 'News' : 'Blog'}</span>
                  <span className="text-ink-muted">{new Date(p.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-ink group-hover:text-gold-dark">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{p.excerpt}</p>
                <p className="mt-3 text-xs font-medium text-ink-soft">By {p.author}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
