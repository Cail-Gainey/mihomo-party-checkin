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
| FlyingBird | [https://fbval2-vas08.cc](https://fbval2-vas08.cc/auth/register) |

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
   - 邮箱：您的账号邮箱
   - 密码：您的账号密码
   - 网站类型：选择 ikuuu 或 FlyingBird
   - 启用状态：是否启用该账号的自动签到

3. 点击"保存"按钮完成添加

### 自动签到设置

1. 在签到页面，找到"自动签到"开关
2. 打开开关以启用自动签到功能
3. 应用程序将在启动时和每天定时自动执行签到任务
4. 自动签到结果会通过系统通知显示

### 手动签到

1. 在签到页面，点击"全部签到"按钮可以立即执行所有账号的签到
2. 系统将显示签到结果，包括成功和失败的数量
3. 每个账号的签到状态会实时更新

### 查看签到历史

1. 在签到页面，每个账号下方会显示最近一次签到的时间和状态
2. 绿色状态表示签到成功，红色状态表示签到失败

### 账号管理

1. 编辑账号：点击账号右侧的编辑按钮，可以修改账号信息
2. 删除账号：点击账号右侧的删除按钮，可以移除不需要的账号
3. 启用/禁用：通过开关控制账号是否参与自动签到

### 注册新账号

如果您还没有相关网站的账号，可以：

1. 在添加账号页面点击"注册账号"按钮
2. 系统会打开相应网站的注册页面
3. 完成注册后返回应用程序添加账号

## 常见问题

### Q: 自动签到没有执行怎么办？
A: 请确保：
1. "自动签到"开关已打开
2. 账号信息正确且已启用
3. 应用程序已添加到系统自启动项
4. 检查账号是否已经在当天签到过

### Q: 签到失败的原因有哪些？
A: 可能的原因包括：
1. 账号密码错误
2. 网络连接问题
3. 目标网站服务器异常
4. 目标网站更改了签到机制

### Q: 如何更新到最新版本？
A: 应用程序会自动检查更新，也可以在"设置"页面手动检查更新

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

### 项目结构

```
mihomo-party-checkin/
├── src/                  # 源代码目录
│   ├── main/             # 主进程代码
│   ├── preload/          # 预加载脚本
│   ├── renderer/         # 渲染进程代码
│   │   ├── src/
│   │   │   ├── components/  # 组件
│   │   │   ├── pages/       # 页面
│   │   │   ├── services/    # 服务
│   │   │   └── utils/       # 工具函数
│   └── shared/           # 共享代码
├── resources/            # 资源文件
├── electron-builder.yml  # 构建配置
└── package.json         # 项目配置
```

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

© 2025 Cail Gainey <cailgainey@foxmail.com>
