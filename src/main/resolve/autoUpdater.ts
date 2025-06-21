import axios from 'axios'
import yaml from 'yaml'
import { app, shell } from 'electron'
import { getControledMihomoConfig } from '../config'
import { dataDir, exeDir, exePath, isPortable, resourcesFilesDir } from '../utils/dirs'
import { copyFile, rm, writeFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import os from 'os'
import { execSync, spawn } from 'child_process'

/**
 * 应用版本信息接口
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
interface IAppVersion {
  version: string
  releaseDate?: string
  changelog?: string
  platforms?: {
    windows?: {
      x64?: { setup?: string; portable?: string }
      ia32?: { setup?: string; portable?: string }
      arm64?: { setup?: string; portable?: string }
    }
    linux?: {
      x64?: { deb?: string; rpm?: string }
      arm64?: { deb?: string; rpm?: string }
    }
    mac?: {
      x64?: { dmg?: string }
      arm64?: { dmg?: string }
    }
  }
}

/**
 * 获取当前平台标识符
 * @returns 平台标识符
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
function getPlatformIdentifier(): string {
  switch (process.platform) {
    case 'win32':
      return 'win'
    case 'darwin':
      return 'mac'
    case 'linux':
      return 'linux'
    default:
      return 'win' // 默认为Windows
  }
}

/**
 * 检查更新
 * @returns 如果有更新，返回应用版本信息，否则返回undefined
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export async function checkUpdate(): Promise<IAppVersion | undefined> {
  try {
    const { 'mixed-port': mixedPort = 7890 } = await getControledMihomoConfig()
    const platform = getPlatformIdentifier()
    
    // 尝试获取平台特定的latest.yml
    const url = `https://github.com/Cail-Gainey/mihomo-party-checkin/releases/latest/download/latest-${platform}.yml`
    console.log(`正在检查更新: ${url}`)
    
    const res = await axios.get(url, {
      headers: { 'Content-Type': 'application/octet-stream' },
      proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: mixedPort
      },
      responseType: 'text',
      timeout: 10000 // 10秒超时
    })
    
    const latest = yaml.parse(res.data, { merge: true }) as IAppVersion
    const currentVersion = app.getVersion()
    
    console.log(`当前版本: ${currentVersion}, 最新版本: ${latest.version}`)
    
    if (latest.version !== currentVersion) {
      return latest
    } else {
      return undefined
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    
    // 如果平台特定的latest.yml获取失败，尝试获取通用的latest.yml
    try {
      const { 'mixed-port': mixedPort = 7890 } = await getControledMihomoConfig()
      const url = 'https://github.com/Cail-Gainey/mihomo-party-checkin/releases/latest/download/latest.yml'
      console.log(`尝试获取通用更新信息: ${url}`)
      
      const res = await axios.get(url, {
        headers: { 'Content-Type': 'application/octet-stream' },
        proxy: {
          protocol: 'http',
          host: '127.0.0.1',
          port: mixedPort
        },
        responseType: 'text',
        timeout: 10000 // 10秒超时
      })
      
      const latest = yaml.parse(res.data, { merge: true }) as IAppVersion
      const currentVersion = app.getVersion()
      
      console.log(`当前版本: ${currentVersion}, 最新版本: ${latest.version}`)
      
      if (latest.version !== currentVersion) {
        return latest
      }
    } catch (fallbackError) {
      console.error('获取通用更新信息失败:', fallbackError)
    }
    
    return undefined
  }
}

/**
 * 下载并安装更新
 * @param version 要更新的版本
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export async function downloadAndInstallUpdate(version: string): Promise<void> {
  const { 'mixed-port': mixedPort = 7890 } = await getControledMihomoConfig()
  const baseUrl = `https://github.com/Cail-Gainey/mihomo-party-checkin/releases/download/v${version}/`
  
  // 根据平台和架构确定下载文件
  let file: string
  
  if (process.platform === 'win32') {
    // Windows平台
    const arch = process.arch
    const isWin7 = parseInt(os.release()) < 10
    const prefix = isWin7 ? 'win7' : 'windows'
    
    if (isPortable()) {
      file = `mihomo-party-checkin-${prefix}-${version}-${arch}-portable.7z`
    } else {
      file = `mihomo-party-checkin-${prefix}-${version}-${arch}-setup.exe`
    }
  } else if (process.platform === 'darwin') {
    // macOS平台
    const arch = process.arch
    const productVersion = execSync('sw_vers -productVersion', { encoding: 'utf8' }).toString().trim()
    const isCatalina = parseInt(productVersion) < 11
    const prefix = isCatalina ? 'catalina' : 'macos'
    
    file = `mihomo-party-checkin-${prefix}-${version}-${arch}.dmg`
  } else if (process.platform === 'linux') {
    // Linux平台
    const arch = process.arch === 'x64' ? 'amd64' : process.arch
    const extension = os.platform() === 'darwin' ? 'deb' : 'rpm'
    
    file = `mihomo-party-checkin-linux-${version}-${arch}.${extension}`
  } else {
    throw new Error('不支持自动更新，请手动下载更新')
  }
  
  console.log(`准备下载更新文件: ${file}`)
  
  try {
    const downloadPath = path.join(dataDir(), file)
    
    // 如果文件已存在，先删除
    if (existsSync(downloadPath)) {
      await rm(downloadPath)
      console.log(`删除已存在的更新文件: ${downloadPath}`)
    }
    
    // 下载更新文件
    console.log(`开始下载: ${baseUrl}${file}`)
    const res = await axios.get(`${baseUrl}${file}`, {
      responseType: 'arraybuffer',
      proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: mixedPort
      },
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    })
    
    await writeFile(downloadPath, res.data)
    console.log(`更新文件已下载至: ${downloadPath}`)
    
    // 根据不同平台和文件类型执行安装
    if (file.endsWith('.exe')) {
      // Windows安装版
      console.log('启动Windows安装程序...')
      spawn(downloadPath, ['/S', '--force-run'], {
        detached: true,
        stdio: 'ignore'
      }).unref()
      app.quit()
    } else if (file.endsWith('.7z')) {
      // Windows便携版
      console.log('解压便携版更新...')
      await copyFile(path.join(resourcesFilesDir(), '7za.exe'), path.join(dataDir(), '7za.exe'))
      spawn(
        'cmd',
        [
          '/C',
          `"timeout /t 2 /nobreak >nul && "${path.join(dataDir(), '7za.exe')}" x -o"${exeDir()}" -y "${downloadPath}" & start "" "${exePath()}""`
        ],
        {
          shell: true,
          detached: true
        }
      ).unref()
      app.quit()
    } else if (file.endsWith('.dmg')) {
      // macOS
      console.log('打开macOS安装包...')
      shell.openPath(downloadPath)
    } else if (file.endsWith('.deb') || file.endsWith('.rpm')) {
      // Linux
      console.log('打开Linux安装包...')
      shell.openPath(downloadPath)
    }
  } catch (error) {
    console.error('下载或安装更新失败:', error)
    const downloadPath = path.join(dataDir(), file)
    if (existsSync(downloadPath)) {
      await rm(downloadPath)
    }
    throw error
  }
}
