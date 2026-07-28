# Windows 系统架构识别：x86、x64 与 ARM64

## 所属领域

```text
Computer Science
└─ Operating Systems
   └─ Windows
      └─ System Architecture Detection
```

## Problem

在 Windows 电脑上安装程序、选择运行时或排查兼容性问题时，需要先判断系统使用的是 32 位 x86、x86-64 还是 ARM64 架构。

这里的 `x86` 容易产生歧义：严格来说它通常表示 32 位架构；日常口语中也有人用它泛指 Intel/AMD 这一整套指令集家族。`x64`、`x86-64` 和 `AMD64` 通常表示同一种 64 位架构，`AMD64` 并不表示处理器必须由 AMD 制造。

## Quick Check

最直观的方法是打开：

```text
设置 → 系统 → 关于 → 设备规格 → 系统类型
```

常见结果：

| 系统类型 | 含义 |
| --- | --- |
| 基于 x64 的处理器 | Intel/AMD 的 x86-64 架构 |
| 基于 ARM64 的处理器 | ARM64 架构 |
| 基于 x86 的处理器 | 32 位 x86 架构 |

## PowerShell

### 快速查看环境变量

```powershell
echo $env:PROCESSOR_ARCHITECTURE
```

典型值：

| 输出 | 含义 |
| --- | --- |
| `AMD64` | x86-64/x64 |
| `ARM64` | ARM64 |
| `x86` | 32 位 x86 |

环境变量语法属于 Shell 自己的语法，因此 `$env:PROCESSOR_ARCHITECTURE` 是 PowerShell 写法；在命令提示符中应使用 `echo %PROCESSOR_ARCHITECTURE%`。

### 处理 32 位进程视角

如果 PowerShell 是 32 位进程，并且 Windows 本身是 64 位，`PROCESSOR_ARCHITECTURE` 可能显示为 `x86`。此时优先检查 `PROCESSOR_ARCHITEW6432`：

```powershell
$architecture = if ($env:PROCESSOR_ARCHITEW6432) {
    $env:PROCESSOR_ARCHITEW6432
} else {
    $env:PROCESSOR_ARCHITECTURE
}

$architecture
```

### 从 WMI/CIM 查询处理器架构

需要更稳定、可用于脚本判断时，可以查询 `Win32_Processor`：

```powershell
Get-CimInstance Win32_Processor |
    Select-Object Name, Architecture
```

`Architecture` 常见数值：

| 数值 | 含义 |
| --- | --- |
| `0` | x86 |
| `9` | x64/x86-64 |
| `12` | ARM64 |

如果只关心 Windows 操作系统是否为 64 位，也可以使用：

```powershell
[Environment]::Is64BitOperatingSystem
```

但这个属性只能区分 32 位和 64 位，不能区分 x64 与 ARM64。

## Command Prompt

在 Windows 命令提示符（`cmd.exe`）中使用：

```cmd
echo %PROCESSOR_ARCHITECTURE%
echo %PROCESSOR_ARCHITEW6432%
```

同样，在 32 位进程运行于 64 位 Windows 时，应优先参考 `PROCESSOR_ARCHITEW6432`。变量不存在时通常会原样输出变量名或显示为空，具体表现取决于命令环境。

## Notes

- `AMD64` 代表 x86-64 指令集，不代表只能运行在 AMD 处理器上；大多数 Intel 64 位处理器也会显示 `AMD64`。
- “CPU 是 x86 还是 ARM64”和“当前进程是 32 位还是 64 位”是两个相关但不同的问题。安装程序或排查兼容性时，要确认对方需要的是处理器架构、操作系统架构，还是进程架构。
- 在 ARM64 Windows 上可能存在 x86/x64 模拟运行场景，因此某个进程的架构不一定等于底层 CPU 架构。

## 相关知识

- Windows 环境变量
- PowerShell 与命令提示符语法
- 32 位进程、64 位进程与 WOW64
- 程序运行时和安装包架构兼容性
