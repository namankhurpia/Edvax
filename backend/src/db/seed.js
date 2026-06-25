import bcrypt from 'bcryptjs'
import { pool, query } from './pool.js'
import { runMigrations } from './migrate.js'
import { config } from '../config.js'
import { slugify } from '../utils/slug.js'

// Seeds the first admin + sample published content.
// Safe to re-run: uses ON CONFLICT / existence checks. Does NOT wipe data.
async function seed() {
  await runMigrations()

  // --- Admin ---
  const hash = await bcrypt.hash(config.admin.password, 12)
  await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
    ['EDVAX Admin', config.admin.email.toLowerCase(), hash],
  )
  console.log(`[seed] admin ready: ${config.admin.email}`)

  // --- Sample courses (only if table empty) ---
  const { rows: existing } = await query('SELECT COUNT(*)::int AS n FROM courses')
  if (existing[0].n === 0) {
    const courses = [
      ['GST Litigation Essentials', 'Notices, replies and appellate strategy under GST', 'CA Rohit Mehra', 'Taxation', 249900, 500000, 8, 16, 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=60'],
      ['Corporate Law Foundations', 'Companies Act 2013 — compliance & governance', 'Adv. Priya Nair', 'Corporate Law', 199900, 400000, 6, 12, 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=60'],
      ['Income Tax & Audit Masterclass', 'Assessments, scrutiny and tax-audit walkthroughs', 'CA Abhishek Sanyal', 'Taxation', 129900, 300000, 5, 10, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=60'],
    ]
    const sampleChapters = JSON.stringify([
      { title: 'Introduction & legal framework' },
      { title: 'Core provisions explained' },
      { title: 'Practical case scenarios' },
      { title: 'Drafting & compliance walkthrough' },
    ])
    for (const c of courses) {
      await query(
        `INSERT INTO courses (slug,title,subtitle,instructor,category,price_paise,mrp_paise,lessons,hours,thumbnail_url,zoom_recording_url,chapters,status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'published')`,
        [slugify(c[0]) + '-' + Math.random().toString(36).slice(2, 7), c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], 'https://zoom.us/rec/placeholder-link', sampleChapters],
      )
    }
    console.log(`[seed] ${courses.length} sample courses created`)
  }

  // --- Sample purchases (dummy, for the admin Purchases view) ---
  const { rows: pays } = await query('SELECT COUNT(*)::int AS n FROM payments')
  if (pays[0].n === 0) {
    // Attach each purchase to a published course (cycled).
    const { rows: pubCourses } = await query(
      `SELECT id, price_paise FROM courses WHERE status = 'published' ORDER BY id`,
    )
    if (pubCourses.length > 0) {
      const buyers = [
        ['Aarav Sharma', 'aarav.sharma@example.com', '+91 98100 11223', '12 MG Road, Bengaluru, Karnataka 560001', true],
        ['Diya Patel', 'diya.patel@example.com', '+91 99200 33445', '45 Linking Road, Mumbai, Maharashtra 400050', false],
        ['Rohan Verma', 'rohan.verma@example.com', '+91 98300 55667', '7 Park Street, Kolkata, West Bengal 700016', true],
        ['Sneha Iyer', 'sneha.iyer@example.com', '+91 97400 77889', '23 Anna Salai, Chennai, Tamil Nadu 600002', false],
      ]
      for (let i = 0; i < buyers.length; i++) {
        const [name, email, phone, address, inviteSent] = buyers[i]
        const course = pubCourses[i % pubCourses.length]
        const orderId = 'order_dummy_' + Math.random().toString(36).slice(2, 12)
        const paymentId = 'pay_dummy_' + Math.random().toString(36).slice(2, 12)
        await query(
          `INSERT INTO payments
            (course_id, buyer_name, buyer_email, buyer_phone, buyer_address,
             razorpay_order_id, razorpay_payment_id, amount_paise, status, invite_sent)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'paid',$9)`,
          [course.id, name, email, phone, address, orderId, paymentId, course.price_paise, inviteSent],
        )
      }
      console.log(`[seed] ${buyers.length} dummy purchases created`)
    }
  }

  // --- Sample post ---
  const { rows: posts } = await query('SELECT COUNT(*)::int AS n FROM posts')
  if (posts[0].n === 0) {
    await query(
      `INSERT INTO posts (slug,type,title,excerpt,body,author,status,published_at)
       VALUES ($1,'news',$2,$3,$4,'EDVAX Desk','published',now())`,
      ['gst-2-0-overview-' + Math.random().toString(36).slice(2, 7),
       'GST 2.0: what the rate rationalisation means',
       'A plain-language breakdown of the proposed slab restructuring.',
       'Full article body goes here. Admins edit this through the admin panel.'],
    )
    console.log('[seed] sample post created')
  }

  // --- Sample case study ---
  const { rows: cs } = await query('SELECT COUNT(*)::int AS n FROM case_studies')
  if (cs[0].n === 0) {
    await query(
      `INSERT INTO case_studies (slug,title,court,citation,category,summary,status)
       VALUES ($1,$2,'Supreme Court of India','(2022) 10 SCC 700','GST',$3,'published')`,
      ['mohit-minerals-' + Math.random().toString(36).slice(2, 7),
       'Union of India v. Mohit Minerals',
       'The Court held GST on ocean freight under reverse charge unconstitutional.'],
    )
    console.log('[seed] sample case study created')
  }

  console.log('[seed] done')
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[seed] failed:', e)
    process.exit(1)
  })
