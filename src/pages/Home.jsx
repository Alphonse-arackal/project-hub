import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, Copy, ArrowUpRight, Layers3, Github, Download, LoaderCircle, Check, ExternalLink } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import { saveProjects } from '../utils/storage'

export default function Home({ projects, setProjects, onToast }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [githubOpen, setGithubOpen] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')
  const [githubRepos, setGithubRepos] = useState([])
  const [selectedRepos, setSelectedRepos] = useState([])
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState('')
  const [githubSearch, setGithubSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return projects
    return projects.filter((project) =>
      [project.name, project.description, ...(project.technologies || [])]
        .some((value) => value?.toLowerCase().includes(query)),
    )
  }, [projects, search])

  async function findGithubRepos(event) {
    event.preventDefault()
    const username = githubUsername.trim().replace(/^@/, '')
    if (!username) { setGithubError('Enter a GitHub username to continue.'); return }
    setGithubLoading(true)
    setGithubError('')
    setGithubRepos([])
    setSelectedRepos([])
    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100&type=owner`)
      if (response.status === 404) throw new Error('That GitHub username could not be found.')
      if (response.status === 403) throw new Error('GitHub API rate limit reached. Please wait a little and try again.')
      if (!response.ok) throw new Error('Could not load repositories from GitHub. Please try again.')
      const repos = await response.json()
      if (!Array.isArray(repos) || repos.length === 0) throw new Error('No public repositories were found for this account.')
      setGithubRepos(repos.filter((repo) => !repo.fork))
    } catch (error) {
      setGithubError(error.message || 'Something went wrong while contacting GitHub.')
    } finally {
      setGithubLoading(false)
    }
  }

  function importGithubRepos() {
    const selected = githubRepos.filter((repo) => selectedRepos.includes(repo.id))
    if (!selected.length) { setGithubError('Select at least one repository to import.'); return }
    const imported = selected.map((repo) => ({
      id: `github-${repo.id}`,
      name: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      description: repo.description || 'Imported from GitHub repository.',
      githubUrl: repo.html_url,
      liveUrl: repo.homepage && /^https?:\/\//i.test(repo.homepage) ? repo.homepage : '',
      icon: 'code',
      technologies: [...new Set([repo.language, ...(repo.topics || []).slice(0, 4)].filter(Boolean))].slice(0, 5),
    }))
    const existingUrls = new Set(projects.map((project) => project.githubUrl?.replace(/\/$/, '').toLowerCase()).filter(Boolean))
    const newProjects = imported.filter((project) => !existingUrls.has(project.githubUrl.replace(/\/$/, '').toLowerCase()))
    if (!newProjects.length) {
      setGithubError('All selected repositories are already in your project hub.')
      return
    }
    const next = [...newProjects, ...projects]
    setProjects(next)
    saveProjects(next)
    setGithubOpen(false)
    setGithubRepos([])
    setSelectedRepos([])
    setGithubSearch('')
    setGithubError('')
    onToast({ type: 'success', message: `Imported ${newProjects.length} ${newProjects.length === 1 ? 'repository' : 'repositories'} from GitHub.` })
  }

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
          <div className="section-actions">
            <button className="button button-secondary github-import-button" onClick={() => { setGithubOpen(true); setGithubError('') }}>
              <Github size={17} /> <span>Import from GitHub</span>
            </button>
            <button className="button button-primary add-button" onClick={() => navigate('/add')}>
              <Plus size={18} /> <span>Add New</span>
            </button>
          </div>
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

      {githubOpen && (
        <div className="modal-backdrop github-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGithubOpen(false) }}>
          <section className="github-modal" role="dialog" aria-modal="true" aria-labelledby="github-import-title">
            <div className="github-modal-heading">
              <div className="github-modal-icon"><Github size={22} /></div>
              <button type="button" className="github-close-button" aria-label="Close GitHub import" onClick={() => setGithubOpen(false)}><X size={18} /></button>
              <div>
                <div className="eyebrow">REPOSITORY SYNC</div>
                <h3 id="github-import-title">Import from <span>GitHub</span></h3>
                <p>Fetch your public repositories and add them to your project directory.</p>
              </div>
            </div>
            <form className="github-lookup-form" onSubmit={findGithubRepos}>
              <label htmlFor="github-username">GitHub username</label>
              <div className="github-lookup-row">
                <div className="input-shell"><Github size={17} /><input id="github-username" value={githubUsername} onChange={(event) => setGithubUsername(event.target.value)} placeholder="e.g. Alphonse-arackal" autoFocus /></div>
                <button className="button button-primary" type="submit" disabled={githubLoading}>{githubLoading ? <LoaderCircle size={16} className="spin-icon" /> : <Search size={16} />}{githubLoading ? 'Loading' : 'Find repos'}</button>
              </div>
              <span className="field-hint">Only public, non-fork repositories are listed. No GitHub token is required.</span>
            </form>
            {githubError && <div className="github-error" role="alert">{githubError}</div>}
            {githubRepos.length > 0 && (
              <div className="github-repo-picker">
                <div className="github-repo-toolbar"><strong>{githubRepos.length} repositories found</strong><button type="button" onClick={() => setSelectedRepos(selectedRepos.length === githubRepos.length ? [] : githubRepos.map((repo) => repo.id))}>{selectedRepos.length === githubRepos.length ? 'Deselect all' : 'Select all'}</button></div>
                <div className="search-shell github-repo-search"><Search size={15} /><input value={githubSearch} onChange={(event) => setGithubSearch(event.target.value)} placeholder="Filter repositories..." aria-label="Filter GitHub repositories" /></div>
                <div className="github-repo-list">
                  {githubRepos.filter((repo) => `${repo.name} ${repo.description || ''} ${repo.language || ''}`.toLowerCase().includes(githubSearch.toLowerCase())).map((repo) => {
                    const checked = selectedRepos.includes(repo.id)
                    const alreadyImported = projects.some((project) => project.githubUrl?.replace(/\/$/, '').toLowerCase() === repo.html_url.replace(/\/$/, '').toLowerCase())
                    return <label className={`github-repo-row ${checked ? 'selected' : ''}`} key={repo.id}>
                      <input type="checkbox" checked={checked} onChange={() => setSelectedRepos((current) => checked ? current.filter((id) => id !== repo.id) : [...current, repo.id])} />
                      <span className="github-repo-copy"><strong>{repo.name}</strong><span>{repo.description || 'No description provided.'}</span><small>{repo.language || 'Language not specified'}{repo.stargazers_count ? ` · ★ ${repo.stargazers_count}` : ''}{alreadyImported ? ' · Already imported' : ''}</small></span>
                      <a href={repo.html_url} target="_blank" rel="noreferrer" aria-label={`Open ${repo.name} on GitHub`} onClick={(event) => event.stopPropagation()}><ExternalLink size={15} /></a>
                    </label>
                  })}
                </div>
                <div className="github-import-footer"><span>{selectedRepos.length} selected</span><button type="button" className="button button-primary" onClick={importGithubRepos}><Download size={16} /> Import selected</button></div>
              </div>
            )}
          </section>
        </div>
      )}

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