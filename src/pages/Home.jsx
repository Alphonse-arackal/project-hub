import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, Copy, ArrowUpRight, Layers3 } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import { saveProjects } from '../utils/storage'

export default function Home({ projects, setProjects, onToast }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return projects
    return projects.filter((project) =>
      [project.name, project.description, ...(project.technologies || [])]
        .some((value) => value?.toLowerCase().includes(query)),
    )
  }, [projects, search])

  function deleteProject() {
    const next = projects.filter((project) => project.id !== deleteTarget.id)
    setProjects(next)
    saveProjects(next)
    setDeleteTarget(null)
    onToast({ type: 'success', message: 'Project deleted.' })
  }

  async function copyAll() {
    const text = projects.map((project) => [
      project.name,
      project.githubUrl ? `GitHub: ${project.githubUrl}` : '',
      project.liveUrl ? `Live: ${project.liveUrl}` : '',
    ].filter(Boolean).join('\n')).filter(Boolean).join('\n\n')
    if (!text) {
      onToast({ type: 'error', message: 'There are no project links to copy yet.' })
      return
    }
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text)
      else {
        const area = document.createElement('textarea')
        area.value = text
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        area.remove()
        if (!ok) throw new Error()
      }
      onToast({ type: 'success', message: 'All project links copied!' })
    } catch {
      onToast({ type: 'error', message: 'Could not copy links. Check browser permissions.' })
    }
  }

  return (
    <main className="home-page">
      <header className="hero-header">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> DEVELOPER PORTFOLIO</div>
          <h1>ALPHONSE<br /><span>ARACKAL</span></h1>
          <div className="hero-caption">PROJECTS <span /></div>
        </div>
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-abstract"><Layers3 size={72} strokeWidth={0.6} /></div>
        <div className="hero-bottomline"><span>PERSONAL PROJECT DIRECTORY</span><span>AA / 001</span></div>
      </header>

      <section className="projects-section">
        <div className="section-top">
          <div>
            <div className="eyebrow section-eyebrow">YOUR WORKSPACE</div>
            <h2>My <span>Projects</span><sup>{projects.length.toString().padStart(2, '0')}</sup></h2>
            <p className="section-description">A collection of my web projects. Access, copy and share easily.</p>
          </div>
          <button className="button button-primary add-button" onClick={() => navigate('/add')}>
            <Plus size={18} /> <span>Add New</span>
          </button>
        </div>

        <div className="toolbar">
          <div className="search-shell">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects or technologies..." aria-label="Search projects" />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}
          </div>
          <button className="copy-all-button" onClick={copyAll}><Copy size={15} /><span>Copy all links</span></button>
        </div>

        {filtered.length ? (
          <div className="project-grid">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} onToast={onToast}
                onEdit={(item) => navigate(`/edit/${encodeURIComponent(item.id)}`)}
                onDelete={setDeleteTarget} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={27} />
            <h3>No projects found</h3>
            <p>Try a different search term or add a new project.</p>
            <button className="button button-secondary" onClick={() => { setSearch(''); if (!projects.length) navigate('/add') }}>Clear search</button>
          </div>
        )}

        <button className="add-project-tile" onClick={() => navigate('/add')}>
          <span className="tile-plus"><Plus size={18} /></span>
          <span>Add another project</span>
        </button>

        <footer className="page-footer">
          <span>DESIGNED FOR BUILDING & SHARING</span>
          <span>MADE BY ALPHONSE <ArrowUpRight size={12} /></span>
        </footer>
      </section>

      {deleteTarget && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null) }}>
          <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="modal-icon"><X size={20} /></div>
            <h3 id="delete-title">Delete project?</h3>
            <p><strong>{deleteTarget.name}</strong> will be removed from this browser's project list. This can't be undone.</p>
            <div className="modal-actions">
              <button className="button button-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="button button-danger" onClick={deleteProject}>Delete project</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}