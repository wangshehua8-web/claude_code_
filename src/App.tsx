import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import ApplicationDetail from './pages/ApplicationDetail'
import NewApplication from './pages/NewApplication'
import InterviewPrep from './pages/InterviewPrep'
import SelfIntroWorkshop from './pages/SelfIntroWorkshop'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="applications/new" element={<NewApplication />} />
          <Route path="prep/:applicationId" element={<InterviewPrep />} />
          <Route path="intro/:applicationId" element={<SelfIntroWorkshop />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App