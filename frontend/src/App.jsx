import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import CaseStudies from './pages/CaseStudies.jsx'
import CaseStudyDetail from './pages/CaseStudyDetail.jsx'
import Blog from './pages/Blog.jsx'
import PostDetail from './pages/PostDetail.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import RefundPolicy from './pages/RefundPolicy.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'
import NotFound from './pages/NotFound.jsx'

import RequireAdmin from './admin/RequireAdmin.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import Dashboard from './admin/Dashboard.jsx'
import Purchases from './admin/Purchases.jsx'
import { CoursesAdmin, PostsAdmin, CaseStudiesAdmin } from './admin/resources.jsx'

// Public routes share the marketing Layout; admin routes have their own shell.
function PublicApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<PostDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
      <Route path="/admin/purchases" element={<RequireAdmin><Purchases /></RequireAdmin>} />
      <Route path="/admin/courses" element={<RequireAdmin><CoursesAdmin /></RequireAdmin>} />
      <Route path="/admin/posts" element={<RequireAdmin><PostsAdmin /></RequireAdmin>} />
      <Route path="/admin/case-studies" element={<RequireAdmin><CaseStudiesAdmin /></RequireAdmin>} />
      {/* Public (catch-all) */}
      <Route path="/*" element={<PublicApp />} />
    </Routes>
  )
}
