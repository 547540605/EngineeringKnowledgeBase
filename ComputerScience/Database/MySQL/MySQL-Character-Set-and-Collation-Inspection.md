# MySQL 字符集与排序规则：数据库、表和字段级检查

## 所属领域

```text
Computer Science
└─ Database
   └─ MySQL
      └─ Character Set and Collation
```

## Problem

在 MySQL 中查看数据库的“编码格式”时，通常需要同时看两个概念：字符集（Character Set）和排序规则（Collation）。数据库、表和字段都可能有自己的默认值，因此数据库默认值与表实际使用的值不一定相同。

## Character Set 与 Collation

| 概念 | 作用 | 示例 |
| --- | --- | --- |
| Character Set（字符集） | 定义字符如何编码和存储 | `latin1`、`utf8mb4` |
| Collation（排序规则） | 定义字符串如何比较和排序 | `utf8mb4_general_ci` |

排序规则属于某个字符集。同一个字符集可以有多种排序规则，例如 `utf8mb4_general_ci` 和 `utf8mb4_bin` 都属于 `utf8mb4`。

常见后缀含义：

- `ci`：case-insensitive，通常不区分大小写。
- `cs`：case-sensitive，区分大小写。
- `bin`：按二进制值比较，区分大小写。

因此，`utf8mb4_general_ci` 不是另一种字符集，而是 `utf8mb4` 字符集上的一种排序规则。

## Database Default

查看指定数据库的默认字符集和排序规则，最直接的方法是：

```sql
SHOW CREATE DATABASE `cloud_v4_edit_dev`;
```

典型结果：

```sql
CREATE DATABASE `cloud_v4_edit_dev`
/*!40100 DEFAULT CHARACTER SET latin1 */
```

这表示该数据库的默认字符集是 `latin1`。如果输出中没有明确显示 `COLLATE`，则排序规则可能使用该字符集的默认排序规则。

也可以通过 `information_schema` 查询：

```sql
SELECT
    SCHEMA_NAME,
    DEFAULT_CHARACTER_SET_NAME,
    DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'cloud_v4_edit_dev';
```

如果当前连接已经进入目标数据库，也可以执行：

```sql
SELECT
    @@character_set_database,
    @@collation_database;
```

## Table Default

查看每张表的默认排序规则：

```sql
SELECT
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'cloud_v4_edit_dev';
```

`TABLE_COLLATION` 表示表级默认排序规则。根据排序规则可以进一步查询它对应的字符集：

```sql
SELECT
    t.TABLE_NAME,
    c.CHARACTER_SET_NAME AS TABLE_CHARACTER_SET,
    t.TABLE_COLLATION
FROM information_schema.TABLES AS t
JOIN information_schema.COLLATIONS AS c
    ON c.COLLATION_NAME = t.TABLE_COLLATION
WHERE t.TABLE_SCHEMA = 'cloud_v4_edit_dev';
```

也可以查看单张表的完整定义：

```sql
SHOW CREATE TABLE `cloud_v4_edit_dev`.`表名`;
```

重点查看结果末尾的内容，例如：

```sql
DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
```

这表示该表的默认字符集是 `utf8mb4`，默认排序规则是 `utf8mb4_general_ci`。

## Column Level

表级默认值不一定适用于每个字段。字段可以单独指定字符集和排序规则，因此需要精确排查时继续查看字段级设置：

```sql
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'cloud_v4_edit_dev'
  AND CHARACTER_SET_NAME IS NOT NULL;
```

`CHARACTER_SET_NAME` 和 `COLLATION_NAME` 主要对字符类型字段有意义，例如 `CHAR`、`VARCHAR` 和 `TEXT`；数值、日期等字段通常为空。

## Default Value Relationship

MySQL 中可以按照以下层级理解默认值：

```text
数据库默认字符集/排序规则
        ↓ 创建表时的默认值
表默认字符集/排序规则
        ↓ 创建字段时的默认值
字段字符集/排序规则
```

上层默认值不会强制覆盖下层已经明确指定的值。数据库默认值主要用于创建新表时提供默认配置，不能代表所有已有表的实际配置。

例如：

```text
数据库默认字符集：latin1
已有表默认字符集：utf8mb4
已有表默认排序规则：utf8mb4_general_ci
```

这种情况完全可能，通常说明建表语句、导入脚本或迁移工具在创建表时明确指定了 `utf8mb4`。修改数据库默认值也不会自动修改已有表。

## Notes

- “数据库的编码格式”在 MySQL 中通常应同时记录字符集和排序规则，而不是只记录一个值。
- `information_schema.SCHEMATA` 是标准 MySQL 查询入口；如果当前环境对此处报错，优先使用 `SHOW CREATE DATABASE`。
- 查看数据库默认值、表默认值和字段实际值是三个不同层次的检查，排查乱码或字符串比较问题时不能只看数据库级配置。
- 表级排序规则能够推导出表级字符集，但字段级设置可能覆盖表级默认值。

## 相关知识

- MySQL 数据库和表定义
- UTF-8、UTF-8MB4 与字符编码
- 字符串比较、排序和大小写敏感性
- 数据库迁移与导入脚本
- SQL 字符串字段类型
