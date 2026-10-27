import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Folder, FileText, Github, Link2, Layers, Image, Plus, Save } from 'lucide-react'
import { isValidHttpUrl } from '../utils/storage'
import { ProjectIcon } from './ProjectCard'

const iconOptions = [
  ['monitor', 'Monitor'], ['graduation', 'Study'], ['gamepad', 'Gaming'],
  ['film', 'Movies'], ['dumbbell', 'Fitness'], ['cart', 'Shopping'],
  ['shirt', 'Store'], ['user', 'Portfolio'], ['file', 'Document'], ['layers', 'Other'],
]

export default function ProjectForm({ initialValue, onSave, onToast }) {
  const navigate = useNavigate()
  const editing = Boolean(initialValue)
  const [form, setForm] = useState({
    name: '', description: '', githubUrl: '', liveUrl: '', icon: 'monitor', technologies: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name || '',
        description: initialValue.description || '',
        githubUrl: initialValue.githubUrl || '',
        liveUrl: initialValue.liveUrl || '',
        icon: initialValue.icon || 'monitor',
        technologies: (initialValue.technologies || []).join(', '),
      })
    }
  }, [initialValue])

  function change(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  async function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Project name is required.'
    if (!isValidHttpUrl(form.githubUrl)) nextErrors.githubUrl = 'Enter a valid URL starting with http:// or https://.'
    if (!isValidHttpUrl(form.liveUrl)) nextErrors.liveUrl = 'Enter a valid URL starting with http:// or https://.'
    if (!form.githubUrl.trim() && !form.liveUrl.trim()) nextErrors.links = 'Add at least a GitHub or live website URL.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const project = {
      ...(initialValue || {}),
      id: initialValue?.id || crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description.trim(),
      githubUrl: form.githubUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      icon: form.icon,
      technologies: [...new Set(form.technologies.split(',').map((item) => item.trim()).filter(Boolean))],
    }
    try {
      await onSave(project)
      onToast({ type: 'success', message: editing ? 'Project updated and synced to the cloud.' : 'Project added and synced to the cloud.' })
      navigate('/')
    } catch {
      setErrors((current) => ({ ...current, submit: 'Could not save to the cloud. Please check your connection and try again.' }))
    }
  }

  return (
    <main className="form-page">
      <div className="form-topbar">
        <button type="button" className="back-link" onClick={() => navigate('/')}>
          <ArrowLeft size={17} /> Back to Projects
        </button>
        <span className="form-step">{editing ? 'EDIT PROJECT' : 'NEW PROJECT'}</span>
      </div>
      <section className="form-intro">
        <div className="eyebrow"><span className="eyebrow-line" /> PROJECT WORKSPACE</div>
        <h1>{editing ? <>Edit <span>Project</span></> : <>Add New <span>Project</span></>}</h1>
        <p>{editing ? 'Update the details and links for your project.' : 'Add your project details to your personal project hub.'}</p>
      </section>

      <form className="project-form" onSubmit={submit} noValidate>
        {errors.submit && <div className="auth-error" role="alert">{errors.submit}</div>}
        <div className="form-field">
          <label htmlFor="project-name">Project name <span className="required">*</span></label>
          <div className={`input-shell ${errors.name ? 'has-error' : ''}`}>
            <Folder size={18} />
            <input id="project-name" name="name" value={form.name} onChange={change} placeholder="e.g. StudyFlow" maxLength={60} autoFocus />
          </div>
          {errors.name && <small className="field-error">{errors.name}</small>}
        </div>

        <div className="form-field">
          <div className="label-row"><label htmlFor="project-description">Description</label><span>{form.description.length}/200</span></div>
          <div className="input-shell textarea-shell">
            <FileText size={18} />
            <textarea id="project-description" name="description" value={form.description} onChange={change} placeholder="A short description of what your project does..." maxLength={200} rows={3} />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="github-url">GitHub repository URL</label>
          <div className={`input-shell ${errors.githubUrl ? 'has-error' : ''}`}>
            <Github size={18} />
            <input id="github-url" name="githubUrl" value={form.githubUrl} onChange={change} placeholder="https://github.com/username/repository" inputMode="url" />
          </div>
          {errors.githubUrl && <small className="field-error">{errors.githubUrl}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="live-url">Live website URL</label>
          <div className={`input-shell ${errors.liveUrl ? 'has-error' : ''}`}>
            <Link2 size={18} />
            <input id="live-url" name="liveUrl" value={form.liveUrl} onChange={change} placeholder="https://your-project.example.com" inputMode="url" />
          </div>
          {errors.liveUrl && <small className="field-error">{errors.liveUrl}</small>}
          {errors.links && <small className="field-error">{errors.links}</small>}
        </div>

        <div className="form-field">
          <label>Project icon</label>
          <div className="icon-picker" role="group" aria-label="Choose a project icon">
            {iconOptions.map(([value, label]) => (
              <button key={value} type="button" title={label} aria-label={label} aria-pressed={form.icon === value}
                className={`icon-choice ${form.icon === value ? 'selected' : ''}`} onClick={() => setForm((current) => ({ ...current, icon: value }))}>
                <ProjectIcon name={value} size={19} />
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="technologies">Tech stack <span className="optional">(optional)</span></label>
          <div className="input-shell">
            <Layers size={18} />
            <input id="technologies" name="technologies" value={form.technologies} onChange={change} placeholder="React, JavaScript, Node.js (comma separated)" />
          </div>
          <small className="field-hint">Separate each technology with a comma.</small>
        </div>

        <div className="form-footer">
          <button type="button" className="button button-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="button button-primary">{editing ? <Save size={17} /> : <Plus size={18} />}{editing ? 'Save Changes' : 'Add Project'}</button>
        </div>
      </form>
    </main>
  )
}