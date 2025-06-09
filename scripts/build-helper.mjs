/**
 * 构建辅助脚本
 * 用于在构建前清理和设置正确的权限
 * @author Cail Gainey <cailgainey@foxmail.com>
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(process.cwd());
const outDir = path.join(rootDir, 'out');
const distDir = path.join(rootDir, 'dist');

/**
 * 确保目录存在，如果不存在则创建
 * @param {string} dir 目录路径
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`创建目录: ${dir}`);
  }
}

/**
 * 清理目录
 * @param {string} dir 目录路径
 */
function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    console.log(`清理目录: ${dir}`);
    try {
      // 在 macOS 和 Linux 上使用 rm -rf
      if (process.platform !== 'win32') {
        execSync(`rm -rf "${dir}"`);
      } else {
        // 在 Windows 上使用 rimraf
        execSync(`rimraf "${dir}"`);
      }
    } catch (error) {
      console.error(`清理目录失败: ${dir}`, error);
    }
  }
  ensureDir(dir);
}

/**
 * 设置目录权限
 * @param {string} dir 目录路径
 */
function setPermissions(dir) {
  if (process.platform !== 'win32') {
    try {
      console.log(`设置目录权限: ${dir}`);
      execSync(`chmod -R 777 "${dir}"`);
    } catch (error) {
      console.error(`设置目录权限失败: ${dir}`, error);
    }
  }
}

// 主函数
function main() {
  console.log('开始构建准备...');
  
  // 清理输出目录
  cleanDir(outDir);
  cleanDir(distDir);
  
  // 设置权限
  setPermissions(outDir);
  setPermissions(distDir);
  
  console.log('构建准备完成!');
}

main(); 