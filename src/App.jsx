import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import Home from './pages/Home'
import ProjectForm from './components/ProjectForm'
import Toast from './components/Toast'
import { loadProjects, saveProjects } from './utils/storage'

function EditProjectRoute({ projects, onSave, onToast }) {
  const { id } = useParams()
  const project = projects.find((item) => item.id === id)
  if (!project) {
    return <main className="not-found"><h1>Project not found</h1><p>It may have been removed or the link is invalid.</p><a href="/">Back to projects</a></main>
  }
  return <ProjectForm initialValue={project} onSave={onSave} onToast={onToast} />
}

export default function App() {
  const [projects, setProjects] = useState(() => loadProjects())
  const [toast, setToast] = useState(null)

  useEffect(() => { saveProjects(projects) }, [projects])

  const showToast = useCallback((value) => {
    setToast(value)
    window.clearTimeout(window.__projectHubToastTimer)
    window.__projectHubToastTimer = window.setTimeout(() => setToast(null), 2800)
  }, [])

  const upsertProject = useCallback((project) => {
    setProjects((current) => {
      const exists = current.some((item) => item.id === project.id)
      const next = exists ? current.map((item) => item.id === project.id ? project : item) : [project, ...current]
      saveProjects(next)
      return next
    })
  }, [])

  return (
    <>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home projects={projects} setProjects={setProjects} onToast={showToast} />} />
          <Route path="/add" element={<ProjectForm onSave={upsertProject} onToast={showToast} />} />
          <Route path="/edit/:id" element={<EditProjectRoute projects={projects} onSave={upsertProject} onToast={showToast} />} />
          <Route path="*" element={<main className="not-found"><h1>Page not found</h1><a href="/">Back to projects</a></main>} />
        </Routes>
      </div>
      <Toast toast={toast} />
    </>
  )
}