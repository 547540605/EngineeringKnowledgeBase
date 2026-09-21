# 在另一台电脑安装工程知识库插件

本指南面向 Windows 上的 Codex 桌面版。完成一次安装后，知识内容和插件更新都从 GitHub 获取；不需要复制本机的 `.codex`、`.agents` 或插件缓存目录。

## 前置条件

- 已安装 Git 与 Codex 桌面版，并已登录能够访问 GitHub 的账号。
- 在 PowerShell 中可以运行 `codex`。若命令不可用，请重启 Codex 后重新打开 PowerShell。

## 首次安装

以下命令将知识库放到 `D:\EngineeringKnowledgeBase`；可改为任意不含敏感资料的本地目录。

```powershell
$kbRoot = 'D:\EngineeringKnowledgeBase'
git clone https://github.com/547540605/EngineeringKnowledgeBase.git $kbRoot
setx ENGINEERING_KB_ROOT $kbRoot

codex plugin marketplace add 547540605/EngineeringKnowledgeBase --ref main
codex plugin add engineering-knowledge-base@engineering-kb
```

执行完 `setx` 后，完全退出并重新打开 Codex，再新建一个任务。插件会优先从 `ENGINEERING_KB_ROOT` 读取本机克隆的知识库。

## 验证

```powershell
codex plugin list --marketplace engineering-kb --available
```

在新任务中询问“检查工程知识库是否已有 C# 数值字面量后缀”，即可验证插件是否可用。

## 更新插件

知识库 Markdown 内容会随 Git 推送同步；当插件自身有新版本时，在任意电脑运行：

```powershell
codex plugin marketplace upgrade engineering-kb
codex plugin add engineering-knowledge-base@engineering-kb
```

随后新建任务，以加载新版本的技能说明。

## Workspace 图形界面入口（可选）

若你的 ChatGPT Workspace 提供管理员插件管理，也可在 `Admin → Plugins → Add → Import marketplace` 中导入：

```text
Source: https://github.com/547540605/EngineeringKnowledgeBase
Path: 留空
Branch: main
```

导入后安装“工程知识库”。无论采用图形界面还是命令行，都仍需先在本机克隆知识库并设置 `ENGINEERING_KB_ROOT`，因为知识的检索与写入发生在本机 Git 工作树。
