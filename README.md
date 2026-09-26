# EngineeringKnowledgeBase

## Overview

EngineeringKnowledgeBase is a long-term personal engineering knowledge system.

本仓库用于沉淀软件开发、工程实践以及计算机科学相关知识。

它不仅是一个笔记仓库（Notes Repository），更是一个持续演化的知识体系（Knowledge System）。

本仓库同时服务于：

* Human Readers（开发人员）
* AI Assistants（AI助手）
* RAG Systems（知识库检索系统）
* Agent Memory（Agent长期记忆）
* Future Projects（未来项目）

目标是让知识能够被持续积累、组织、检索、复用和演化。

近期变化请参阅 [更新说明](CHANGELOG.md)。

跨电脑使用 Codex 插件请参阅 [插件安装指南](PLUGIN-INSTALL.md)。

---

# Core Philosophy

## Knowledge > Notes

本仓库的目标不是记录笔记。

而是构建知识体系。

普通笔记：

```text
JIT是什么
AOT是什么
CLR是什么
```

知识体系：

```text
Programming Languages
└── Runtime
    ├── CLR
    ├── JVM
    ├── GC
    ├── JIT
    └── AOT
```

本仓库更关注：

```text
知识属于哪里
知识之间如何关联
知识在整个计算机科学体系中的位置
```

而不仅仅是：

```text
知识本身是什么
```

---

## Record First

先记录，再整理。

知识的保存优先于知识的组织。

不要因为结构不完美而放弃记录。

---

## Reusable Knowledge

优先记录未来可能再次使用的知识。

例如：

* 问题排查
* 调试经验
* 开发技巧
* 架构理解
* 环境配置
* 最佳实践
* 工具使用经验

而不是项目中的一次性信息。

---

## Continuous Evolution

允许仓库结构持续演化。

初期可能只有：

```text
README.md
```

未来可能发展为：

```text
ComputerScience/
Engineering/
Projects/
Tools/
AI/
```

结构可以变化。

知识应当长期保留。

---

# Knowledge System

## Knowledge Hierarchy First

知识体系优先于知识碎片。

记录知识时，尽量回答以下问题：

### What is it?

它是什么？

---

### Why does it exist?

它为什么存在？

---

### Where does it belong?

它属于哪个领域？

---

### What does it depend on?

它依赖什么知识？

---

### What concepts are related?

它与哪些知识相关？

---

例如：

```text
JIT
```

不仅记录：

```text
JIT是什么
```

还应记录：

```text
Programming Languages
└── Runtime
    └── JIT
```

---

例如：

```text
Virtual Memory
```

应记录：

```text
Operating Systems
└── Memory Management
    └── Virtual Memory
```

---

例如：

```text
Cache
```

应记录：

```text
Computer Architecture
└── Memory Hierarchy
    └── Cache
```

---

目标是逐步建立完整的知识地图（Knowledge Map）。

---

# Knowledge Domains

当前关注的主要领域包括：

```text
Computer Science
├── Programming Languages
├── Operating Systems
├── Computer Architecture
├── Networking
├── Database
├── Algorithms
├── Software Engineering
└── AI
```

以及：

```text
Engineering
├── DotNet
│   ├── CSharp
│   └── ASPNETCore
├── Robotics
│   └── Force-Control-and-Compliant-Assembly (力控与柔顺装配；其余机器人学内容见独立项目)
├── Python
├── Android
├── Linux
├── Git
├── Docker
├── Cloud
├── DevOps
├── Testing
└── Tools
```

未来可持续扩展。

---

# Knowledge Recording Rules

## One Topic One Subject & Separation of Concerns

一个主题对应一个独立的知识点（或文件）。

**核心原则：按知识图谱记录，坚决避免按时间线或对话记录。**
* 即使在同一次对话中探讨了多个不同领域的问题（例如同时讨论了 OOP 接口和 HTTP 协议），在记录到知识库时也**必须严格拆分**到各自对应的领域和文件中。
* 绝不能出现“某年某月某日问题汇总”或“某个需求涉及到的各种零散知识”这样的大杂烩文件。
* 知识的归属应该由它的**概念属性**决定，而不是由**被提问的时间点**决定。

避免多个无关内容混杂，确保每个 Markdown 文件职责单一、脉络清晰。

---

## Use Searchable Titles

标题必须包含关键词。

不推荐：

```markdown
# 一个奇怪的问题
```

推荐：

```markdown
# Python.Runtime cannot import tornado.gen
```

或者：

```markdown
# ASP.NET Core Windows Service Deployment
```

---

## Record Facts

优先记录：

* 现象
* 原因
* 解决方案
* 结论

尽量避免：

```text
感觉
猜测
大概
可能
```

除非明确标注。

---

## Preserve Examples

代码、日志、报错信息尽量保留原文。

方便未来：

* 搜索
* 向量检索
* RAG
* Agent引用

---

## Recommended Structure

推荐使用：

```markdown
# Title

## Problem

## Root Cause

## Solution

## Example

## Related Knowledge

## Notes
```

但不是强制要求。

---

# AI Maintenance Rules

本章节用于指导 AI 如何维护本仓库。

---

## Rule 1

当用户提出问题时：

如果答案具有长期复用价值，应考虑加入知识库。

---

## Rule 2

新增知识前：

优先检查是否已经存在相关主题。

如果存在：

更新已有内容。

如果不存在：

创建新主题。

---

## Rule 3

避免重复知识。

优先扩展已有知识。

---

## Rule 4

如果用户出现以下表达：

```text
记录下来
加入知识库
写到仓库
后面可能会用
记住这个
整理一下
形成文档
```

则认为该内容具有长期价值。

---

## Rule 5

新增知识时：

除了记录知识本身，

还应记录：

```text
所属领域
相关知识
上下游知识
```

帮助构建知识体系。

---

例如：

```text
Delegate
```

应关联：

```text
C#
Runtime
Event
Callback
Reflection
```

---

## Rule 6

AI应优先维护知识结构。

不要仅记录答案。

应尽量建立知识关联。

---

## Change Tracking

根目录的 [CHANGELOG.md](CHANGELOG.md) 用于记录读者关心的知识新增、明确更新和结构调整。

* 新增知识或用户明确要求更新现有知识时，应在同一次提交中补充简短更新说明。
* 更新说明按 `YYYY-MM-DD` 分组，区分“新增”“更新”“维护”，并链接到对应知识条目。
* 仅发现重复内容、未修改知识时，不新增更新说明。
* CHANGELOG 不是完整 Git 日志；条目应说明变化内容和价值，保持简洁。

---

## Robotics

知识库原有的[机器人力控制与柔顺装配](Engineering/Robotics/Force-Control-and-Compliant-Assembly/index.md)专题继续保留。其余机器人学课程、交互演示和 ROS 2 学习内容由[独立机器人学项目](https://github.com/547540605/robotics-notes)维护；知识库不再复制。该仓库链接不是在线交互阅读器地址，待原项目实际发布地址确认后再更新入口。

---

# Future RAG Compatibility

本仓库未来可能作为：

* RAG Knowledge Base
* Vector Database Source
* Agent Memory
* AI Search Index
* Coding Agent Context

的数据来源。

因此所有知识应尽量满足：

```text
Human Readable
AI Readable
Search Friendly
Embedding Friendly
Reusable
Linked
```

---

# Current Structure

当前知识按计算机科学基础与工程实践拆分，目录会随知识体系演化：

```text
EngineeringKnowledgeBase
├── ComputerScience/
│   └── 跨语言、跨技术栈的基础知识
└── Engineering/
    ├── DotNet/
    │   ├── CSharp/
    │   └── ASPNETCore/
    └── Robotics/
        ├── index.md (独立机器人学项目入口)
        └── Force-Control-and-Compliant-Assembly/ (原有力控专题)
```

具体目录以仓库现状为准；新增知识优先归入已有领域，避免按项目或时间线堆放。

---

# Long-Term Vision

Build a continuously evolving Engineering Knowledge System.

目标不是积累笔记。

目标不是收集技巧。

目标是建立属于自己的：

```text
Engineering Knowledge System
+
Computer Science Knowledge Map
+
AI Maintainable Memory
```

让过去解决的问题持续产生价值。

让未来项目能够复用过去的经验。

让知识随着开发工作不断增长和演化。
