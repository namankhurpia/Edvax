// Mock data for the frontend-first build. Replaced by API calls later.
// All content here is original placeholder copy for EDVAX.

export const courses = [
  {
    id: 1,
    slug: 'gst-litigation-essentials',
    title: 'GST Litigation Essentials',
    subtitle: 'Notices, replies and appellate strategy under the GST regime',
    instructor: 'CA Rohit Mehra',
    category: 'Taxation',
    price: 2499,
    mrp: 5000,
    lessons: 8,
    hours: 16,
    rating: 4.8,
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=60',
    description:
      'A practical course covering GST show-cause notices, drafting replies, and appellate procedure with real case scenarios and sample submissions.',
  },
  {
    id: 2,
    slug: 'corporate-law-foundations',
    title: 'Corporate Law Foundations',
    subtitle: 'Companies Act 2013 — compliance, governance and filings',
    instructor: 'Adv. Priya Nair',
    category: 'Corporate Law',
    price: 1999,
    mrp: 4000,
    lessons: 6,
    hours: 12,
    rating: 4.7,
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=60',
    description:
      'Build a strong base in corporate compliance: board procedures, statutory filings, and governance obligations under the Companies Act, 2013.',
  },
  {
    id: 3,
    slug: 'income-tax-audit-masterclass',
    title: 'Income Tax & Audit Masterclass',
    subtitle: 'Assessments, scrutiny and tax audit walkthroughs',
    instructor: 'CA Abhishek Sanyal',
    category: 'Taxation',
    price: 1299,
    mrp: 3000,
    lessons: 5,
    hours: 10,
    rating: 4.9,
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=60',
    description:
      'Hands-on walkthrough of income-tax assessments, scrutiny proceedings and tax-audit reporting with worked examples.',
  },
  {
    id: 4,
    slug: 'sebi-regulations-comprehensive',
    title: 'SEBI Regulations — Comprehensive',
    subtitle: 'Securities law, disclosures and listing obligations',
    instructor: 'Dr. Priyanka Taktawala',
    category: 'Securities Law',
    price: 2999,
    mrp: 5999,
    lessons: 5,
    hours: 10,
    rating: 4.6,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=60',
    description:
      'Decode SEBI regulations, LODR disclosures and listing obligations through current market case studies.',
  },
  {
    id: 5,
    slug: 'labour-codes-2025',
    title: 'The New Labour Codes',
    subtitle: 'Wages, social security and industrial relations explained',
    instructor: 'Mr. Bala Ranganathan',
    category: 'Labour Law',
    price: 4000,
    mrp: 6000,
    lessons: 3,
    hours: 4,
    rating: 4.5,
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=60',
    description:
      'Understand the four labour codes and draft central rules, with compliance checklists for employers.',
  },
  {
    id: 6,
    slug: 'customs-ftp-live',
    title: 'Customs Act & Foreign Trade Policy',
    subtitle: 'Valuation, classification and FTP incentives',
    instructor: 'Mr. Mihir Shah',
    category: 'Taxation',
    price: 3500,
    mrp: 6499,
    lessons: 6,
    hours: 12,
    rating: 4.7,
    thumbnail: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=900&q=60',
    description:
      'Master customs valuation, tariff classification and the Foreign Trade Policy framework for import-export practice.',
  },
]

export const posts = [
  {
    id: 1,
    slug: 'gst-2-0-what-changes',
    type: 'news',
    title: 'GST 2.0: What the rate rationalisation means for businesses',
    excerpt:
      'A plain-language breakdown of the proposed slab restructuring and its likely impact on compliance.',
    author: 'EDVAX Desk',
    cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=60',
    publishedAt: '2026-06-12',
  },
  {
    id: 2,
    slug: 'drafting-effective-scn-replies',
    type: 'blog',
    title: 'Five principles for drafting effective show-cause-notice replies',
    excerpt:
      'How to structure a reply that addresses the allegations, the law, and the evidence — in that order.',
    author: 'CA Rohit Mehra',
    cover: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=900&q=60',
    publishedAt: '2026-06-05',
  },
  {
    id: 3,
    slug: 'supreme-court-itc-ruling',
    type: 'news',
    title: 'Supreme Court clarifies the scope of input tax credit',
    excerpt:
      'A landmark ruling reshapes how businesses claim ITC on inputs used for exempt supplies.',
    author: 'EDVAX Desk',
    cover: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=900&q=60',
    publishedAt: '2026-05-28',
  },
]

export const caseStudies = [
  {
    id: 1,
    slug: 'mohit-minerals-ocean-freight',
    title: 'Union of India v. Mohit Minerals',
    court: 'Supreme Court of India',
    citation: '(2022) 10 SCC 700',
    category: 'GST',
    summary:
      'The Court held that GST on ocean freight under reverse charge was unconstitutional, affirming that GST Council recommendations are not binding on States.',
  },
  {
    id: 2,
    slug: 'vodafone-international',
    title: 'Vodafone International Holdings v. Union of India',
    court: 'Supreme Court of India',
    citation: '(2012) 6 SCC 613',
    category: 'Income Tax',
    summary:
      'A defining ruling on the taxability of offshore indirect transfers, examining the limits of source-based taxation in India.',
  },
  {
    id: 3,
    slug: 'tata-cyrus-mistry',
    title: 'Tata Consultancy v. Cyrus Investments',
    court: 'Supreme Court of India',
    citation: '(2021) 9 SCC 449',
    category: 'Corporate Law',
    summary:
      'A leading authority on oppression and mismanagement under the Companies Act, and the scope of NCLAT powers.',
  },
]

export const mentors = [
  {
    id: 1,
    name: 'Palash Khurpia',
    qualifications: 'M.Com, LLB, LLM',
    title: 'Taxation Lawyer · Speaker on GST Laws · Litigation Enthusiast',
    role: 'Founder & Owner',
    initials: 'PK',
  },
  {
    id: 2,
    name: 'Bhupesh Khurpia',
    qualifications: 'M.Com, LLB',
    title: 'Taxation Lawyer',
    initials: 'BK',
  },
]

export const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
