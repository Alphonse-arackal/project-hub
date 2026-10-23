import { initialProjects } from '../data/initialProjects'

const STORAGE_KEY = 'alphonse-project-hub-v1'

export function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProjects))
      return initialProjects
    }
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : initialProjects
  } catch {
    return initialProjects
  }
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    return true
  } catch {
    return false
  }
}

export function isValidHttpUrl(value) {
  if (!value?.trim()) return true
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}