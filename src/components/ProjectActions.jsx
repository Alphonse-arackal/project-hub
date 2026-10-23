import { useEffect, useRef, useState } from 'react'
import { Github, ExternalLink, MoreHorizontal, Copy, Link2, Check } from 'lucide-react'

async function copyText(text) {
  if (!text) throw new Error('No URL provided')
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  // Fallback for localhost / browsers without Clipboard API access.
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  area.remove()
  if (!ok) throw new Error('Clipboard access is unavailable')
}

export default function ProjectActions({ project, onToast }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  async function copy(kind) {
    setOpen(false)
    const github = project.githubUrl?.trim()
    const live = project.liveUrl?.trim()
    let value = ''
    if (kind === 'github') value = github
    if (kind === 'live') value = live
    if (kind === 'both') {
      value = [
        project.name,
        github ? `GitHub: ${github}` : '',
        live ? `Live: ${live}` : '',
      ].filter(Boolean).join('\n')
    }
    if (!value) {
      onToast({ type: 'error', message: 'This project does not have that URL yet.' })
      return
    }
    try {
      await copyText(value)
      const message = kind === 'both'
        ? 'Project links copied!'
        : kind === 'github' ? 'GitHub URL copied!' : 'Live URL copied!'
      onToast({ type: 'success', message })
    } catch {
      onToast({ type: 'error', message: 'Could not copy. Check your browser permissions.' })
    }
  }

  const bothAvailable = Boolean(project.githubUrl?.trim() || project.liveUrl?.trim())

  return (
    <div className="project-actions">
      <a
        className={`action-button github-button ${!project.githubUrl ? 'action-disabled' : ''}`}
        href={project.githubUrl || undefined}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Open ${project.name} GitHub repository`}
        onClick={(event) => { if (!project.githubUrl) { event.preventDefault(); onToast({ type: 'info', message: 'Add a GitHub URL to this project first.' }) } }}
      >
        <Github size={16} />
        <span>GitHub</span>
      </a>
      <a
        className={`action-button live-button ${!project.liveUrl ? 'action-disabled' : ''}`}
        href={project.liveUrl || undefined}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Open ${project.name} live website`}
        onClick={(event) => { if (!project.liveUrl) { event.preventDefault(); onToast({ type: 'info', message: 'Add a live website URL to this project first.' }) } }}
      >
        <span>Live</span><ExternalLink size={14} />
      </a>
      <div className="action-menu-wrap">
        <button
          ref={buttonRef}
          type="button"
          className={`action-menu-trigger ${open ? 'is-open' : ''}`}
          aria-label={`More link actions for ${project.name}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <MoreHorizontal size={19} />
        </button>
        {open && (
          <div ref={menuRef} className="action-dropdown" role="menu">
            <div className="dropdown-heading">Copy links</div>
            <button type="button" role="menuitem" onClick={() => copy('github')} disabled={!project.githubUrl?.trim()}>
              <Github size={15} /><span>Copy GitHub URL</span><Copy size={13} className="dropdown-trailing" />
            </button>
            <button type="button" role="menuitem" onClick={() => copy('live')} disabled={!project.liveUrl?.trim()}>
              <ExternalLink size={15} /><span>Copy Live URL</span><Copy size={13} className="dropdown-trailing" />
            </button>
            <div className="dropdown-divider" />
            <button type="button" role="menuitem" onClick={() => copy('both')} disabled={!bothAvailable}>
              <Link2 size={15} /><span>Copy both links</span><Check size={14} className="dropdown-trailing" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}