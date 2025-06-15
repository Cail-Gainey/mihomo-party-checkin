import yaml from 'yaml'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

console.log('开始生成更新信息文件...')

// 读取package.json获取版本号
const pkg = readFileSync('package.json', 'utf-8')
const originalChangelog = readFileSync('changelog.md', 'utf-8')
const { version } = JSON.parse(pkg)

console.log(`当前版本: ${version}`)
console.log('读取changelog.md成功')

// 检查changelog是否已包含下载链接
const hasDownloadLinks = originalChangelog.includes('### 下载地址：')
let changelog = originalChangelog

// 只有在没有下载链接时才添加
if (!hasDownloadLinks) {
  console.log('添加下载链接到changelog...')
  
  // 构建下载URL前缀
  const downloadUrl = `https://github.com/Cail-Gainey/mihomo-party-checkin/releases/download/v${version}`

  // 添加下载链接到changelog
  changelog += '\n### 下载地址：\n\n#### Windows10/11：\n\n'
  changelog += `- 安装版：[64位](${downloadUrl}/mihomo-party-checkin-windows-${version}-x64-setup.exe) | [32位](${downloadUrl}/mihomo-party-checkin-windows-${version}-ia32-setup.exe) | [ARM64](${downloadUrl}/mihomo-party-checkin-windows-${version}-arm64-setup.exe)\n\n`
  changelog += `- 便携版：[64位](${downloadUrl}/mihomo-party-checkin-windows-${version}-x64-portable.7z) | [32位](${downloadUrl}/mihomo-party-checkin-windows-${version}-ia32-portable.7z) | [ARM64](${downloadUrl}/mihomo-party-checkin-windows-${version}-arm64-portable.7z)\n\n`
  changelog += '\n#### Windows7/8：\n\n'
  changelog += `- 安装版：[64位](${downloadUrl}/mihomo-party-checkin-win7-${version}-x64-setup.exe) | [32位](${downloadUrl}/mihomo-party-checkin-win7-${version}-ia32-setup.exe)\n\n`
  changelog += `- 便携版：[64位](${downloadUrl}/mihomo-party-checkin-win7-${version}-x64-portable.7z) | [32位](${downloadUrl}/mihomo-party-checkin-win7-${version}-ia32-portable.7z)\n\n`
  changelog += '\n#### macOS 11+：\n\n'
  changelog += `- DMG：[Intel](${downloadUrl}/mihomo-party-checkin-macos-${version}-x64.dmg) | [Apple Silicon](${downloadUrl}/mihomo-party-checkin-macos-${version}-arm64.dmg)\n\n`
  changelog += '\n#### Linux：\n\n'
  changelog += `- DEB：[64位](${downloadUrl}/mihomo-party-checkin-linux-${version}-amd64.deb) | [ARM64](${downloadUrl}/mihomo-party-checkin-linux-${version}-arm64.deb)\n\n`
  changelog += `- RPM：[64位](${downloadUrl}/mihomo-party-checkin-linux-${version}-x86_64.rpm) | [ARM64](${downloadUrl}/mihomo-party-checkin-linux-${version}-aarch64.rpm)`
} else {
  console.log('changelog已包含下载链接，跳过添加')
}

// 提取当前版本的更新日志部分
function extractCurrentVersionChangelog(changelog, version) {
  const versionHeader = `## [${version}]`;
  const lines = changelog.split('\n');
  let inCurrentVersion = false;
  let currentVersionContent = [];
  
  for (const line of lines) {
    if (line.startsWith('## [')) {
      if (line.startsWith(versionHeader)) {
        inCurrentVersion = true;
        currentVersionContent.push(line);
      } else if (inCurrentVersion) {
        break;
      }
    } else if (inCurrentVersion) {
      currentVersionContent.push(line);
    }
  }
  
  return currentVersionContent.join('\n');
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`创建目录: ${dirPath}`);
  }
}

// 创建平台特定的目录
const platforms = ['win', 'linux', 'mac'];
platforms.forEach(platform => {
  ensureDirectoryExists(`dist/${platform}`);
});

// 提取当前版本的更新日志
const currentVersionChangelog = extractCurrentVersionChangelog(changelog, version) || changelog;

// 为每个平台创建latest.yml文件
platforms.forEach(platform => {
  // 构建下载URL前缀
  const downloadUrl = `https://github.com/Cail-Gainey/mihomo-party-checkin/releases/download/v${version}`;
  
  // 为不同平台创建不同的latest.yml内容
  const latest = {
    version,
    releaseDate: new Date().toISOString(),
    changelog: currentVersionChangelog,
    platforms: {}
  };
  
  // 添加平台特定的下载链接
  if (platform === 'win') {
    latest.platforms.windows = {
      x64: {
        setup: `${downloadUrl}/mihomo-party-checkin-windows-${version}-x64-setup.exe`,
        portable: `${downloadUrl}/mihomo-party-checkin-windows-${version}-x64-portable.7z`
      },
      ia32: {
        setup: `${downloadUrl}/mihomo-party-checkin-windows-${version}-ia32-setup.exe`,
        portable: `${downloadUrl}/mihomo-party-checkin-windows-${version}-ia32-portable.7z`
      },
      arm64: {
        setup: `${downloadUrl}/mihomo-party-checkin-windows-${version}-arm64-setup.exe`,
        portable: `${downloadUrl}/mihomo-party-checkin-windows-${version}-arm64-portable.7z`
      }
    };
  } else if (platform === 'linux') {
    latest.platforms.linux = {
      x64: {
        deb: `${downloadUrl}/mihomo-party-checkin-linux-${version}-amd64.deb`,
        rpm: `${downloadUrl}/mihomo-party-checkin-linux-${version}-x86_64.rpm`
      },
      arm64: {
        deb: `${downloadUrl}/mihomo-party-checkin-linux-${version}-arm64.deb`,
        rpm: `${downloadUrl}/mihomo-party-checkin-linux-${version}-aarch64.rpm`
      }
    };
  } else if (platform === 'mac') {
    latest.platforms.mac = {
      x64: {
        dmg: `${downloadUrl}/mihomo-party-checkin-macos-${version}-x64.dmg`
      },
      arm64: {
        dmg: `${downloadUrl}/mihomo-party-checkin-macos-${version}-arm64.dmg`
      }
    };
  }
  
  // 写入平台特定的latest.yml文件
  const platformYmlPath = `dist/${platform}/latest.yml`;
  const yamlContent = yaml.stringify(latest);
  writeFileSync(platformYmlPath, yamlContent);
  console.log(`已生成 ${platform} 平台的 latest.yml: ${platformYmlPath}`);
});

// 创建根目录的latest.yml（通用版本）
const latest = {
  version,
  releaseDate: new Date().toISOString(),
  changelog: currentVersionChangelog
};

// 写入通用latest.yml文件
console.log('生成通用 latest.yml 文件...');
const yamlContent = yaml.stringify(latest);
writeFileSync('latest.yml', yamlContent);

// 更新changelog.md文件
console.log('更新changelog.md文件...');
writeFileSync('changelog.md', changelog);

// 输出文件路径
const latestYmlPath = path.resolve('latest.yml');
const changelogPath = path.resolve('changelog.md');
console.log(`通用 latest.yml 已保存至: ${latestYmlPath}`);
console.log(`changelog.md 已更新至: ${changelogPath}`);

// 显示生成的latest.yml内容
console.log('\nlatest.yml内容预览:');
console.log('-------------------');
console.log(yamlContent);
console.log('-------------------');
console.log('更新信息文件生成完成!');
