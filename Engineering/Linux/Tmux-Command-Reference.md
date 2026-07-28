# tmux 常用命令与快捷键

## 所属领域

```text
Engineering
└─ Linux
   └─ Terminal Tools
      └─ tmux
```

## What is tmux

`tmux`（terminal multiplexer，终端复用器）可以在一个终端中创建多个窗口和面板，并在断开 SSH 或关闭终端后保持会话继续运行。重新连接后可以再次进入原来的会话。

tmux 的操作有两种形式：

- 直接在 Shell 中执行的 `tmux` 命令。
- 进入 tmux 后使用前缀键触发的快捷键。默认前缀是 `Ctrl-b`，下文记作 `Prefix`。

## Session Commands

### 创建、查看和恢复会话

```bash
tmux new -s work

tmux ls

tmux attach -t work

tmux attach
```

### 结束会话

```bash
tmux kill-session -t work

tmux kill-server
```

## Detach and Reattach

在 tmux 会话中按：

```text
Prefix d
```

即可退出当前终端，但会话和其中运行的程序仍然保持运行。之后执行：

```bash
tmux attach -t work
```

即可恢复。

这在 SSH 连接不稳定、需要长时间运行构建或部署脚本时很有用。程序是否继续运行取决于它是否仍在 tmux 会话中，以及是否有自己的后台运行机制。

## Window Shortcuts

窗口类似于一个独立的终端标签页。

| 快捷键 | 作用 |
| --- | --- |
| `Prefix c` | 创建新窗口 |
| `Prefix n` | 切换到下一个窗口 |
| `Prefix p` | 切换到上一个窗口 |
| `Prefix 0` 到 `Prefix 9` | 按编号切换窗口 |
| `Prefix ,` | 重命名当前窗口 |
| `Prefix w` | 列出并选择窗口 |
| `Prefix &` | 关闭当前窗口 |
| `Prefix l` | 在当前窗口和上一个窗口之间切换 |

也可以在 Shell 中操作窗口：

```bash
tmux new-window -t work

tmux rename-window -t work:0 editor
```

## Pane Shortcuts

面板是同一个窗口中的分屏终端。

| 快捷键 | 作用 |
| --- | --- |
| `Prefix %` | 左右分屏 |
| `Prefix "` | 上下分屏 |
| `Prefix` 加方向键 | 在面板之间移动 |
| `Prefix o` | 切换到下一个面板 |
| `Prefix z` | 当前面板最大化/恢复 |
| `Prefix x` | 关闭当前面板 |
| `Prefix q` | 显示面板编号 |
| `Prefix !` | 将当前面板拆成独立窗口 |
| `Prefix [` | 进入滚动和复制模式 |

在复制模式中，使用方向键或 PageUp/PageDown 滚动；按 `q` 退出复制模式。

也可以在 Shell 中分屏：

```bash
tmux split-window -h

tmux split-window -v
```

## Command Mode

按 `Prefix :` 进入 tmux 命令模式，可以执行：

```text
new-window -n logs
split-window -h
select-pane -L
rename-session work
```

命令模式适合执行参数较多、用快捷键不方便完成的操作。

## Typical Workflow

```bash
tmux new -s project

dotnet run

tail -f app.log

tmux attach -t project
```

第一次进入会话后，在第一个面板运行 `dotnet run`，使用 `Prefix %` 创建第二个面板并运行 `tail -f app.log`；需要临时离开时按 `Prefix d`，之后再执行 `tmux attach -t project` 恢复。

## Notes

- 默认前缀是 `Ctrl-b`，所以 `Prefix c` 实际上是先按 `Ctrl-b`，松开后再按 `c`，不是同时按三个键。
- SSH 断开后，tmux 会话通常仍然存在；但服务器重启会结束内存中的会话。
- `tmux ls` 在没有会话时会返回非零退出码，这是正常现象。
- 可以使用 `tmux -V` 查看 tmux 版本。
- 不同 Linux 发行版的安装命令不同，例如 Debian/Ubuntu 通常使用 `sudo apt install tmux`，不应把安装命令和通用 tmux 操作混为一个知识主题。

## 相关知识

- Linux Shell
- SSH 远程连接
- 终端、TTY 与伪终端
- 进程生命周期
- Linux 后台任务与日志查看
