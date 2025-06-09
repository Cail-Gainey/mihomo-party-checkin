<h3 align="center">
  <img height='48px' src='./images/icon-white.png#gh-dark-mode-only'>
  <img height='48px' src='./images/icon-black.png#gh-light-mode-only'>
</h3>

<h3 align="center">Mihomo Party Checkin</h3>
<h4 align="center">基于 Mihomo Party 的自动签到程序</h4>

## 项目简介

这是一个基于 [Mihomo Party](https://github.com/mihomo-party-org/mihomo-party) 开发的自动签到工具，主要用于个人自动化管理各类网站的签到任务。该项目仅供个人学习和使用，不用于任何商业目的。

## 支持的网站

目前支持以下网站的自动签到功能：

| 网站名称 | 网站地址 |
|---------|---------|
| ikuuu | [https://ikuuu.one](https://ikuuu.one/auth/register) |

更多网站支持正在开发中...

## 特性

- [x] 支持多账号管理，批量自动签到
- [x] 自动执行签到任务
- [x] 多语言支持：中文、英文、俄文、波斯文
- [x] 美观的用户界面，操作简单
- [x] 签到状态和历史记录显示
- [x] 跨平台支持：Windows、macOS 和 Linux

## 安装指南

### 下载安装

1. 从 [Releases](https://github.com/Cail-Gainey/mihomo-party-checkin/releases) 页面下载适合您系统的安装包
   - Windows: 
     - 安装版: `mihomo-party-checkin-windows-[版本号]-[架构]-setup.exe`
     - 便携版: `mihomo-party-checkin-windows-[版本号]-[架构]-portable.7z`
   - macOS: 
     - DMG安装包: `mihomo-party-checkin-macos-[版本号]-[架构].dmg`
     - ZIP压缩包: `mihomo-party-checkin-macos-[版本号]-[架构].zip`
   - Linux: 
     - DEB包: `mihomo-party-checkin-linux-[版本号]-[架构].deb`
     - RPM包: `mihomo-party-checkin-linux-[版本号]-[架构].rpm`

2. 安装应用程序
   - Windows: 
     - 安装版: 双击安装文件，按照安装向导进行操作
     - 便携版: 解压7z文件后直接运行可执行文件
   - macOS: 打开 DMG 文件，将应用拖到应用程序文件夹
   - Linux: 
     - DEB包: `sudo dpkg -i mihomo-party-checkin-linux-[版本号]-[架构].deb`
     - RPM包: `sudo rpm -i mihomo-party-checkin-linux-[版本号]-[架构].rpm`

3. 首次启动应用程序，可能需要授予必要的系统权限

### 系统要求

- **Windows**: Windows 10 或更高版本
- **macOS**: macOS 10.15 (Catalina) 或更高版本
- **Linux**: 支持 AppImage、DEB 或 RPM 包管理的现代 Linux 发行版

## 使用指南

### 基本配置

1. 启动应用程序后，点击左侧菜单中的"签到"选项
2. 点击"添加账号"按钮，输入您的账号信息：
   - 邮箱：您的 ikuuu 账号邮箱
   - 密码：您的 ikuuu 账号密码
   - 启用状态：是否启用该账号的自动签到

3. 点击"保存"按钮完成添加

### 自动签到设置

1. 在签到页面，找到"自动签到"开关
2. 打开开关以启用自动签到功能
3. 应用程序将在启动时和每天定时自动执行签到任务

### 手动签到

1. 在签到页面，找到需要签到的账号
2. 点击"签到"按钮执行手动签到
3. 系统将显示签到结果，包括获得的流量和签到状态

### 查看签到历史

1. 在签到页面，每个账号下方会显示最近一次签到的时间和状态
2. 绿色状态表示签到成功，红色状态表示签到失败


## 开发指南

### 环境准备

1. 安装 Node.js (推荐 v22)
2. 安装 pnpm: `npm install -g pnpm`

### 克隆代码

```bash
git clone https://github.com/Cail-Gainey/mihomo-party-checkin.git
cd mihomo-party-checkin
```

### 安装依赖

```bash
pnpm install
```

### 开发模式运行

```bash
pnpm dev
```

### 构建应用

- Windows: `pnpm build:win`
- macOS: `pnpm build:mac`
- Linux: `pnpm build:linux`

## 免责声明

本项目仅供个人学习和研究使用，不得用于商业或其他非法用途。使用本软件产生的任何后果由用户自行承担。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 致谢

- [Mihomo Party](https://github.com/mihomo-party-org/mihomo-party) - 本项目的基础框架
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用开发框架
- [React](https://reactjs.org/) - 用户界面库
- [HeroUI](https://heroui.dev/) - UI 组件库

## 作者

© 2024 Cail Gainey <cailgainey@foxmail.com>
