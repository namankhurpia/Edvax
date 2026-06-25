import ResourceManager from './ResourceManager'
import { admin } from '../lib/api'

const statusField = { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] }

export function CoursesAdmin() {
  return (
    <ResourceManager
      title="Courses"
      listKey="courses"
      api={{
        list: admin.courses,
        getOne: admin.course,
        create: admin.createCourse,
        update: admin.updateCourse,
        remove: admin.deleteCourse,
      }}
      emptyItem={{ title: '', subtitle: '', description: '', instructor: '', category: '', price_paise: 0, mrp_paise: 0, lessons: 0, hours: 0, thumbnail_url: '', zoom_recording_url: '', chapters: [], status: 'draft' }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'price_paise', label: 'Price', render: (it) => `₹${(it.price_paise / 100).toLocaleString('en-IN')}` },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'subtitle', label: 'Subtitle', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
        { name: 'instructor', label: 'Instructor', type: 'text' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'price_paise', label: 'Price (in paise — ₹1 = 100)', type: 'number', hint: 'e.g. 249900 = ₹2,499' },
        { name: 'mrp_paise', label: 'MRP (in paise)', type: 'number' },
        { name: 'lessons', label: 'Lessons', type: 'number' },
        { name: 'hours', label: 'Hours', type: 'number' },
        { name: 'chapters', label: 'Chapters', type: 'chapters', hint: 'Choose how many chapters and name each. Set to 0 to show only the description on the course page.' },
        { name: 'thumbnail_url', label: 'Course image', type: 'image' },
        statusField,
      ]}
    />
  )
}

export function PostsAdmin() {
  return (
    <ResourceManager
      title="Blog & News"
      listKey="posts"
      api={{
        list: admin.posts,
        getOne: admin.post,
        create: admin.createPost,
        update: admin.updatePost,
        remove: admin.deletePost,
      }}
      emptyItem={{ type: 'blog', title: '', excerpt: '', body: '', author: '', cover_url: '', status: 'draft' }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type' },
        { key: 'author', label: 'Author' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'type', label: 'Type', type: 'select', options: ['blog', 'news'] },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2 },
        { name: 'body', label: 'Body', type: 'textarea', rows: 10 },
        { name: 'author', label: 'Author', type: 'text' },
        { name: 'cover_url', label: 'Cover image', type: 'image' },
        statusField,
      ]}
    />
  )
}

export function CaseStudiesAdmin() {
  return (
    <ResourceManager
      title="Case Studies"
      listKey="caseStudies"
      api={{
        list: admin.caseStudies,
        getOne: admin.caseStudy,
        create: admin.createCaseStudy,
        update: admin.updateCaseStudy,
        remove: admin.deleteCaseStudy,
      }}
      emptyItem={{ title: '', court: '', citation: '', category: '', summary: '', body: '', cover_url: '', status: 'draft' }}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'court', label: 'Court' },
        { key: 'citation', label: 'Citation' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'court', label: 'Court', type: 'text' },
        { name: 'citation', label: 'Citation', type: 'text' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'summary', label: 'Summary', type: 'textarea', rows: 3 },
        { name: 'body', label: 'Full text', type: 'textarea', rows: 10 },
        { name: 'cover_url', label: 'Cover image', type: 'image' },
        statusField,
      ]}
    />
  )
}
