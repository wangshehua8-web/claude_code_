import { useState, useEffect, useCallback } from 'react'
import { checkAllEnabledAccounts, getEmailMonitorStatus } from '@/services/email-monitor'
import { emailConfigStorage } from '@/lib/storage'
import type { EmailCheckResult } from '@/types'

interface MonitorStatus {
  isRunning: boolean
  lastRun: Date | null
  nextRun: Date | null
  error: string | null
  results: Map<string, EmailCheckResult[]>
}

interface UseEmailMonitorReturn {
  // 状态
  status: MonitorStatus
  accountsStatus: ReturnType<typeof getEmailMonitorStatus>

  // 控制函数
  startMonitoring: (intervalMinutes?: number) => void
  stopMonitoring: () => void
  runOnce: () => Promise<void>

  // 工具函数
  refreshStatus: () => void
  clearError: () => void
}

/**
 * 邮箱监控 React Hook
 * 提供邮箱监控的状态管理、控制函数和工具函数
 */
export function useEmailMonitor(): UseEmailMonitorReturn {
  const [status, setStatus] = useState<MonitorStatus>({
    isRunning: false,
    lastRun: null,
    nextRun: null,
    error: null,
    results: new Map()
  })

  const [accountsStatus, setAccountsStatus] = useState(getEmailMonitorStatus())
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  // 刷新账户状态
  const refreshAccountsStatus = useCallback(() => {
    setAccountsStatus(getEmailMonitorStatus())
  }, [])

  // 运行一次邮件检查
  const runCheck = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, error: null }))

      const results = await checkAllEnabledAccounts()
      const now = new Date()

      setStatus(prev => ({
        ...prev,
        lastRun: now,
        results
      }))

      refreshAccountsStatus()
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        error: error.message || '邮件检查失败'
      }))
    }
  }, [refreshAccountsStatus])

  // 开始定期监控
  const startMonitoring = useCallback((intervalMinutes: number = 15) => {
    // 停止现有的监控
    if (intervalId) {
      clearInterval(intervalId)
    }

    // 立即运行一次
    runCheck()

    // 设置定期检查
    const intervalMs = intervalMinutes * 60 * 1000
    const id = setInterval(runCheck, intervalMs)

    setIntervalId(id)
    setStatus(prev => ({
      ...prev,
      isRunning: true,
      nextRun: new Date(Date.now() + intervalMs)
    }))
  }, [intervalId, runCheck])

  // 停止监控
  const stopMonitoring = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setStatus(prev => ({
      ...prev,
      isRunning: false,
      nextRun: null
    }))
  }, [intervalId])

  // 手动运行一次检查
  const runOnce = useCallback(async () => {
    await runCheck()
  }, [runCheck])

  // 刷新状态
  const refreshStatus = useCallback(() => {
    refreshAccountsStatus()
  }, [refreshAccountsStatus])

  // 清除错误
  const clearError = useCallback(() => {
    setStatus(prev => ({ ...prev, error: null }))
  }, [])

  // 初始化：检查是否有启用的账户，如果有，自动开始监控？
  useEffect(() => {
    // 监听邮箱配置变化
    const handleStorageChange = () => {
      refreshAccountsStatus()
    }

    // 监听 storage 事件
    window.addEventListener('storage', handleStorageChange)

    // 初始刷新
    refreshAccountsStatus()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId, refreshAccountsStatus])

  // 自动开始监控（如果启用了邮箱账户）
  useEffect(() => {
    const enabledAccounts = emailConfigStorage.getEnabledAccounts()
    if (enabledAccounts.length > 0 && !status.isRunning) {
      // 使用最小的轮询间隔
      const minInterval = Math.min(...enabledAccounts.map(acc => acc.config.pollingInterval))
      startMonitoring(minInterval)
    }
  }, [accountsStatus.enabledAccounts, startMonitoring, status.isRunning])

  return {
    status,
    accountsStatus,
    startMonitoring,
    stopMonitoring,
    runOnce,
    refreshStatus,
    clearError
  }
}

/**
 * 简化版的邮箱监控 Hook，仅用于获取状态
 */
export function useEmailMonitorStatus() {
  const [status, setStatus] = useState(getEmailMonitorStatus())

  useEffect(() => {
    const handleStorageChange = () => {
      setStatus(getEmailMonitorStatus())
    }

    window.addEventListener('storage', handleStorageChange)

    // 初始刷新
    setStatus(getEmailMonitorStatus())

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return status
}