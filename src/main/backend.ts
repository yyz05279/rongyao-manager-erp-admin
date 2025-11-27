import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import { isDev } from './utils'

/**
 * 后台服务管理器
 */
export class BackendService {
  private process: ChildProcess | null = null
  private port: number = 8080
  private maxRetries: number = 3
  private retryCount: number = 0

  /**
   * 启动后台服务
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const executablePath = this.getExecutablePath()
        
        console.log(`[Backend] Starting service from: ${executablePath}`)
        
        this.process = spawn(executablePath, [
          `--server.port=${this.port}`,
          '--spring.profiles.active=prod'
        ], {
          stdio: 'pipe',
          detached: false,
          shell: process.platform === 'win32'
        })

        // 监听标准输出
        this.process.stdout?.on('data', (data) => {
          console.log(`[Backend] ${data.toString().trim()}`)
        })

        // 监听标准错误
        this.process.stderr?.on('data', (data) => {
          console.error(`[Backend Error] ${data.toString().trim()}`)
        })

        // 监听进程退出
        this.process.on('exit', (code) => {
          console.log(`[Backend] Process exited with code ${code}`)
          this.process = null
        })

        // 监听错误
        this.process.on('error', (error) => {
          console.error(`[Backend] Process error:`, error)
          reject(error)
        })

        // 等待服务启动
        this.waitForHealthCheck(10000)
          .then(() => {
            console.log('[Backend] Service started successfully')
            resolve()
          })
          .catch(reject)
      } catch (error) {
        console.error('[Backend] Failed to start:', error)
        reject(error)
      }
    })
  }

  /**
   * 停止后台服务
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.process && !this.process.killed) {
        console.log('[Backend] Stopping service...')
        
        this.process.on('exit', () => {
          console.log('[Backend] Service stopped')
          resolve()
        })

        // 发送 SIGTERM 信号
        this.process.kill('SIGTERM')
        
        // 5 秒后强制杀死
        const killTimeout = setTimeout(() => {
          if (this.process && !this.process.killed) {
            console.log('[Backend] Force killing service')
            this.process.kill('SIGKILL')
          }
          resolve()
        }, 5000)

        // 如果进程正常退出，清除超时
        this.process.on('exit', () => {
          clearTimeout(killTimeout)
        })
      } else {
        resolve()
      }
    })
  }

  /**
   * 获取可执行文件路径
   */
  private getExecutablePath(): string {
    const platform = process.platform
    
    let executableName = 'backend'
    if (platform === 'win32') {
      executableName = 'backend.exe'
    }

    if (isDev) {
      // 开发环境：从项目根目录的 backend 文件夹
      return path.join(__dirname, '../../backend', executableName)
    } else {
      // 生产环境：从应用资源目录
      return path.join(process.resourcesPath, 'backend', executableName)
    }
  }

  /**
   * 健康检查
   */
  private async waitForHealthCheck(timeout: number): Promise<void> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`http://localhost:${this.port}/health`)
        if (response.ok) {
          return
        }
      } catch (error) {
        // 继续重试
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    throw new Error('Backend service health check timeout')
  }

  /**
   * 获取服务 URL
   */
  getServiceUrl(): string {
    return `http://localhost:${this.port}`
  }

  /**
   * 检查服务是否运行
   */
  isRunning(): boolean {
    return this.process !== null && !this.process.killed
  }

  /**
   * 获取服务端口
   */
  getPort(): number {
    return this.port
  }

  /**
   * 设置服务端口
   */
  setPort(port: number): void {
    this.port = port
  }
}

