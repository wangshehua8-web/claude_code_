import { STORAGE_KEYS } from '@/types'
import type {
  Resume,
  Application,
  InterviewExperience,
  MockAnswer,
  SelfIntro
} from '@/types'

// 通用存储函数
export class LocalStorageManager {
  // 获取数据
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  // 保存数据
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  }

  // 删除数据
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error)
    }
  }

  // 清空所有应用数据
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key)
    })
  }
}

// 简历相关操作
export const resumeStorage = {
  getAll(): Resume[] {
    return LocalStorageManager.getItem(STORAGE_KEYS.RESUMES, [])
  },

  getById(id: string): Resume | undefined {
    const resumes = this.getAll()
    return resumes.find(r => r.id === id)
  },

  save(resume: Resume): void {
    const resumes = this.getAll()
    const index = resumes.findIndex(r => r.id === resume.id)

    if (index >= 0) {
      resumes[index] = resume
    } else {
      resumes.push(resume)
    }

    LocalStorageManager.setItem(STORAGE_KEYS.RESUMES, resumes)
  },

  delete(id: string): void {
    const resumes = this.getAll()
    const filtered = resumes.filter(r => r.id !== id)
    LocalStorageManager.setItem(STORAGE_KEYS.RESUMES, filtered)
  },

  update(id: string, updates: Partial<Resume>): void {
    const resumes = this.getAll()
    const index = resumes.findIndex(r => r.id === id)

    if (index >= 0) {
      resumes[index] = { ...resumes[index], ...updates }
      LocalStorageManager.setItem(STORAGE_KEYS.RESUMES, resumes)
    }
  }
}

// 投递记录相关操作
export const applicationStorage = {
  getAll(): Application[] {
    return LocalStorageManager.getItem(STORAGE_KEYS.APPLICATIONS, [])
  },

  getById(id: string): Application | undefined {
    const applications = this.getAll()
    return applications.find(a => a.id === id)
  },

  save(application: Application): void {
    const applications = this.getAll()
    const index = applications.findIndex(a => a.id === application.id)

    if (index >= 0) {
      applications[index] = application
    } else {
      applications.push(application)
    }

    LocalStorageManager.setItem(STORAGE_KEYS.APPLICATIONS, applications)
  },

  delete(id: string): void {
    const applications = this.getAll()
    const filtered = applications.filter(a => a.id !== id)
    LocalStorageManager.setItem(STORAGE_KEYS.APPLICATIONS, filtered)
  },

  update(id: string, updates: Partial<Application>): void {
    const applications = this.getAll()
    const index = applications.findIndex(a => a.id === id)

    if (index >= 0) {
      const now = new Date().toISOString()
      applications[index] = {
        ...applications[index],
        ...updates,
        updatedAt: now
      }
      LocalStorageManager.setItem(STORAGE_KEYS.APPLICATIONS, applications)
    }
  },

  // 根据状态筛选
  getByStatus(status: Application['status']): Application[] {
    const applications = this.getAll()
    return applications.filter(a => a.status === status)
  },

  // 获取近期面试
  getUpcomingInterviews(limit = 5): Application[] {
    const applications = this.getAll()
    const now = new Date()

    return applications
      .filter(a => a.interviewAt && new Date(a.interviewAt) > now)
      .sort((a, b) => new Date(a.interviewAt!).getTime() - new Date(b.interviewAt!).getTime())
      .slice(0, limit)
  }
}

// 面经相关操作
export const experienceStorage = {
  getAll(): InterviewExperience[] {
    return LocalStorageManager.getItem(STORAGE_KEYS.EXPERIENCES, [])
  },

  getByApplicationId(applicationId: string): InterviewExperience[] {
    const experiences = this.getAll()
    return experiences.filter(e => e.applicationId === applicationId)
  },

  save(experience: InterviewExperience): void {
    const experiences = this.getAll()
    const index = experiences.findIndex(e => e.id === experience.id)

    if (index >= 0) {
      experiences[index] = experience
    } else {
      experiences.push(experience)
    }

    LocalStorageManager.setItem(STORAGE_KEYS.EXPERIENCES, experiences)
  },

  delete(id: string): void {
    const experiences = this.getAll()
    const filtered = experiences.filter(e => e.id !== id)
    LocalStorageManager.setItem(STORAGE_KEYS.EXPERIENCES, filtered)
  }
}

// 模拟面试记录相关操作
export const mockAnswerStorage = {
  getAll(): MockAnswer[] {
    return LocalStorageManager.getItem(STORAGE_KEYS.MOCK_ANSWERS, [])
  },

  getByApplicationId(applicationId: string): MockAnswer[] {
    const answers = this.getAll()
    return answers.filter(a => a.applicationId === applicationId)
  },

  getByQuestionId(questionId: string): MockAnswer[] {
    const answers = this.getAll()
    return answers.filter(a => a.questionId === questionId)
  },

  save(answer: MockAnswer): void {
    const answers = this.getAll()
    const index = answers.findIndex(a => a.id === answer.id)

    if (index >= 0) {
      answers[index] = answer
    } else {
      answers.push(answer)
    }

    LocalStorageManager.setItem(STORAGE_KEYS.MOCK_ANSWERS, answers)
  },

  delete(id: string): void {
    const answers = this.getAll()
    const filtered = answers.filter(a => a.id !== id)
    LocalStorageManager.setItem(STORAGE_KEYS.MOCK_ANSWERS, filtered)
  }
}

// 自我介绍相关操作
export const selfIntroStorage = {
  getAll(): SelfIntro[] {
    return LocalStorageManager.getItem(STORAGE_KEYS.SELF_INTROS, [])
  },

  getByApplicationId(applicationId: string): SelfIntro | undefined {
    const intros = this.getAll()
    return intros.find(i => i.applicationId === applicationId)
  },

  save(intro: SelfIntro): void {
    const intros = this.getAll()
    const index = intros.findIndex(i => i.id === intro.id)

    if (index >= 0) {
      intros[index] = intro
    } else {
      intros.push(intro)
    }

    LocalStorageManager.setItem(STORAGE_KEYS.SELF_INTROS, intros)
  },

  delete(id: string): void {
    const intros = this.getAll()
    const filtered = intros.filter(i => i.id !== id)
    LocalStorageManager.setItem(STORAGE_KEYS.SELF_INTROS, filtered)
  },

  update(id: string, updates: Partial<SelfIntro>): void {
    const intros = this.getAll()
    const index = intros.findIndex(i => i.id === id)

    if (index >= 0) {
      const now = new Date().toISOString()
      intros[index] = {
        ...intros[index],
        ...updates,
        updatedAt: now
      }
      LocalStorageManager.setItem(STORAGE_KEYS.SELF_INTROS, intros)
    }
  }
}

// DeepSeek API Key 管理
export const apiKeyStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.DEEPSEEK_API_KEY)
    } catch {
      return null
    }
  },

  set(apiKey: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEEPSEEK_API_KEY, apiKey)
    } catch (error) {
      console.error('Error saving API key:', error)
    }
  },

  remove(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DEEPSEEK_API_KEY)
    } catch (error) {
      console.error('Error removing API key:', error)
    }
  },

  has(): boolean {
    return !!this.get()
  }
}