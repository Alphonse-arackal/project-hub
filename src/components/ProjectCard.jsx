import {
  GraduationCap, Gamepad2, Clapperboard, Dumbbell, Shirt, ShoppingCart,
  UserRound, FileText, Monitor, Layers, CircleHelp, Pencil, Trash2,
} from 'lucide-react'
import ProjectActions from './ProjectActions'

const iconMap = {
  graduation: GraduationCap,
  gamepad: Gamepad2,
  film: Clapperboard,
  dumbbell: Dumbbell,
  shirt: Shirt,
  cart: ShoppingCart,
  user: UserRound,
  file: FileText,
  monitor: Monitor,
  layers: Layers,
}

export function ProjectIcon({ name, size = 25 }) {
  const Icon = iconMap[name] || CircleHelp
  return <Icon size={size} strokeWidth={1.8} />
}

export default function ProjectCard({ project, onToast, onEdit, onDelete }) {
  return (
    <article className="project-card">
      <div className={`project-icon icon-${project.icon || 'default'}`}>
        <ProjectIcon name={project.icon} />
      </div>
      <div className="project-info">
        <div className="project-title-line">
          <h3 title={project.name}>{project.name}</h3>
          <span className="project-status-dot" title={project.liveUrl ? 'Live link added' : 'Live link not added'} />
        </div>
        <p>{project.description || 'No description added yet.'}</p>
        {!!project.technologies?.length && (
          <div className="technology-list">
            {project.technologies.slice(0, 3).map((tech) => <span className="technology-tag" key={tech}>{tech}</span>)}
            {project.technologies.length > 3 && <span className="technology-tag more-tag">+{project.technologies.length - 3}</span>}
          </div>
        )}
      </div>
      <ProjectActions project={project} onToast={onToast} />
      <div className="project-management">
        <button type="button" aria-label={`Edit ${project.name}`} onClick={() => onEdit(project)} title="Edit project"><Pencil size={14} /></button>
        <button type="button" aria-label={`Delete ${project.name}`} onClick={() => onDelete(project)} title="Delete project"><Trash2 size={14} /></button>
      </div>
    </article>
  )
}