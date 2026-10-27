import { supabase } from './supabase'

function toDatabase(project, userId) {
  return {
    id: String(project.id),
    user_id: userId,
    name: project.name || '',
    description: project.description || '',
    github_url: project.githubUrl || '',
    live_url: project.liveUrl || '',
    icon: project.icon || 'monitor',
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    updated_at: new Date().toISOString(),
  }
}

function fromDatabase(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    githubUrl: row.github_url || '',
    liveUrl: row.live_url || '',
    icon: row.icon || 'monitor',
    technologies: row.technologies || [],
  }
}

export async function fetchProjects(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(fromDatabase)
}

export async function saveProjectsToCloud(projects, userId) {
  if (!projects.length) return []
  const rows = projects.map((project) => toDatabase(project, userId))
  const { data, error } = await supabase
    .from('projects')
    .upsert(rows, { onConflict: 'user_id,id' })
    .select('*')
  if (error) throw error
  return (data || []).map(fromDatabase)
}

export async function deleteProjectFromCloud(projectId, userId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', String(projectId))
    .eq('user_id', userId)
  if (error) throw error
}
