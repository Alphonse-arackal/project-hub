import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import Home from './pages/Home'
import ProjectForm from './components/ProjectForm'
import Toast from './components/Toast'
import AuthScreen from './components/AuthScreen'
import { loadProjects, saveProjects } from './utils/storage'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { deleteProjectFromCloud, fetchProjects, saveProjectsToCloud } from './lib/projectsApi'

function EditProjectRoute({ projects, onSave, onToast }) {
  const { id } = useParams()
  const project = projects.find((item) => item.id === id)
  if (!project) {
    return <main className="not-found"><h1>Project not found</h1><p>It may have been removed or the link is invalid.</p><a href="/">Back to projects</a></main>
  }
  return <ProjectForm initialValue={project} onSave={onSave} onToast={onToast} />
}

function SetupRequired() {
  return <main className="auth-page"><section className="auth-card setup-card"><div className="auth-brand-mark">☁</div><div className="eyebrow auth-eyebrow"><span className="eyebrow-line" /> CLOUD DATABASE SETUP</div><h1>Connect <span>Supabase</span></h1><p className="auth-intro">Add your Supabase project credentials to enable secure cloud storage and cross-device synchronisation.</p><ol className="setup-steps"><li>Create a project in Supabase.</li><li>Copy <code>.env.example</code> to <code>.env.local</code>.</li><li>Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</li><li>Run <code>supabase/schema.sql</code> in the Supabase SQL Editor.</li><li>Restart the development server.</li></ol><p className="auth-footnote">The browser only uses the publishable/anon key. Never place a service-role key in frontend environment variables.</p></section></main>
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [projects, setProjects] = useState([])
  const [projectsReady, setProjectsReady] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((value) => {
    setToast(value)
    window.clearTimeout(window.__projectHubToastTimer)
    window.__projectHubToastTimer = window.setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return
      if (error) showToast({ type: 'error', message: error.message })
      setSession(data?.session || null)
      setAuthReady(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthReady(true)
    })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [showToast])

  useEffect(() => {
    if (!session?.user?.id || !isSupabaseConfigured) {
      setProjects([])
      setProjectsReady(Boolean(authReady && !session))
      return
    }
    let cancelled = false
    setProjectsReady(false)
    ;(async () => {
      try {
        let cloudProjects = await fetchProjects(session.user.id)
        const migrationKey = `project-hub-cloud-migrated-${session.user.id}`
        if (!cloudProjects.length && localStorage.getItem(migrationKey) !== 'yes') {
          const localProjects = loadProjects()
          if (localProjects.length) cloudProjects = await saveProjectsToCloud(localProjects, session.user.id)
          localStorage.setItem(migrationKey, 'yes')
        }
        if (!cancelled) {
          setProjects(cloudProjects)
          saveProjects(cloudProjects)
        }
      } catch (error) {
        if (!cancelled) showToast({ type: 'error', message: `Could not load cloud projects: ${error.message}` })
      } finally {
        if (!cancelled) setProjectsReady(true)
      }
    })()
    return () => { cancelled = true }
  }, [session?.user?.id, showToast])

  const upsertProject = useCallback(async (project) => {
    if (!session?.user?.id) return
    try {
      const saved = await saveProjectsToCloud([project], session.user.id)
      const persisted = saved[0] || project
      setProjects((current) => {
        const exists = current.some((item) => String(item.id) === String(persisted.id))
        const next = exists ? current.map((item) => String(item.id) === String(persisted.id) ? persisted : item) : [persisted, ...current]
        saveProjects(next)
        return next
      })
    } catch (error) {
      showToast({ type: 'error', message: `Could not save project: ${error.message}` })
      throw error
    }
  }, [session?.user?.id, showToast])

  const importProjects = useCallback(async (newProjects) => {
    if (!session?.user?.id) return
    const saved = await saveProjectsToCloud(newProjects, session.user.id)
    setProjects((current) => {
      const byId = new Map(current.map((project) => [String(project.id), project]))
      saved.forEach((project) => byId.set(String(project.id), project))
      const next = [...byId.values()]
      saveProjects(next)
      return next
    })
  }, [session?.user?.id])

  const removeProject = useCallback(async (projectId) => {
    if (!session?.user?.id) return
    await deleteProjectFromCloud(projectId, session.user.id)
    setProjects((current) => {
      const next = current.filter((project) => String(project.id) !== String(projectId))
      saveProjects(next)
      return next
    })
  }, [session?.user?.id])

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) showToast({ type: 'error', message: error.message })
  }

  if (!isSupabaseConfigured) return <><SetupRequired /><Toast toast={toast} /></>
  if (!authReady) return <main className="auth-page"><div className="auth-loading">Connecting to secure workspace…</div></main>
  if (!session) return <><AuthScreen /><Toast toast={toast} /></>
  if (!projectsReady) return <main className="auth-page"><div className="auth-loading">Loading your cloud projects…</div></main>

  return (
    <>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home projects={projects} setProjects={setProjects} onImportProjects={importProjects} onDeleteProject={removeProject} user={session.user} onSignOut={signOut} onToast={showToast} />} />
          <Route path="/add" element={<ProjectForm onSave={upsertProject} onToast={showToast} />} />
          <Route path="/edit/:id" element={<EditProjectRoute projects={projects} onSave={upsertProject} onToast={showToast} />} />
          <Route path="*" element={<main className="not-found"><h1>Page not found</h1><a href="/">Back to projects</a></main>} />
        </Routes>
      </div>
      <Toast toast={toast} />
    </>
  )
}
