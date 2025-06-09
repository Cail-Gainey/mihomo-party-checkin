/**
 * 预构建脚本
 * 在打包前重置应用数据，避免开发环境数据被打包
 * @author Cail Gainey <cailgainey@foxmail.com>
 */

import path from 'path';
import fs from 'fs';
import os from 'os';

// 获取应用数据目录函数
function getAppDataPath() {
  const appName = 'mihomo-party-checkin';
  
  // 根据不同操作系统获取应用数据目录
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.APPDATA || '', appName);
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', appName);
    case 'linux':
      return path.join(os.homedir(), '.config', appName);
    default:
      throw new Error('不支持的操作系统');
  }
}

// 清理指定目录
function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`目录不存在: ${dirPath}`);
    return;
  }
  
  try {
    // 递归删除目录
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`已清理目录: ${dirPath}`);
    
    // 重新创建空目录
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`已重新创建目录: ${dirPath}`);
  } catch (error) {
    console.error(`清理目录失败: ${dirPath}`, error);
  }
}

// 清理应用数据目录函数
function cleanAppData() {
  console.log('正在清理应用数据...');
  
  try {
    const appDataPath = getAppDataPath();
    console.log(`应用数据目录: ${appDataPath}`);
    cleanDirectory(appDataPath);
    
    // 清理可能的便携版数据目录
    const portablePath = path.join(process.cwd(), 'data');
    console.log(`检查便携版数据目录: ${portablePath}`);
    if (fs.existsSync(portablePath)) {
      cleanDirectory(portablePath);
    }
    
    console.log('应用数据清理完成');
  } catch (error) {
    console.error(`清理应用数据失败: ${error.message}`);
  }
}

// 执行清理
cleanAppData();

console.log('预构建清理完成，可以开始打包了'); 