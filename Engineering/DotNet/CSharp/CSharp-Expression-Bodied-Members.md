# C# Expression-Bodied Members

## 所属领域

```text
Computer Science
└── Programming Languages
    └── C#
        └── Type Members
            └── Expression-Bodied Members
```

## What Is an Expression-Bodied Member

表达式体成员（Expression-Bodied Member）使用 `=>` 将成员实现写成一个表达式。它适合只有一个返回表达式或一条语句的成员。

例如：

```csharp
public static string LogPath =>
    PathProvider.CheckDirectory(
        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs"));
```

这是一项静态只读属性，不是 Lambda 表达式。

## Equivalent Property Syntax

上面的属性等价于传统的 `get` 访问器写法：

```csharp
public static string LogPath
{
    get
    {
        return PathProvider.CheckDirectory(
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs"));
    }
}
```

`static` 表示属性属于类型本身，不需要创建对象即可访问；没有 `set` 访问器表示它是只读属性。

## Properties and Methods

表达式体语法既可以用于属性，也可以用于方法：

```csharp
public int Count => _items.Count;

public string FormatName(string name) => $"User: {name}";

public void Clear() => _items.Clear();
```

区分属性和方法时，关键看成员声明：

| 声明 | 成员类型 | 调用方式 |
| --- | --- | --- |
| `public int Count => _items.Count;` | 属性 | `service.Count` |
| `public string FormatName(string name) => ...;` | 方法 | `service.FormatName("Alice")` |

属性声明没有参数列表，方法声明有参数列表。两者都可以使用 `=>`，但含义都是“该成员的实现由右侧表达式给出”。

## Difference from Lambda Expressions

Lambda 表达式表示一个可传递的匿名函数：

```csharp
var activeUsers = users.Where(user => user.IsActive);
```

其中 `user => user.IsActive` 的左侧是参数，右侧是函数体。

表达式体成员则是在声明类型成员：

```csharp
public bool HasActiveUsers => users.Any(user => user.IsActive);
```

外层 `=>` 是属性的表达式体语法；内层 `user => user.IsActive` 才是 Lambda 表达式。相同符号出现在不同语法位置，含义不同。

## Evaluation and Caching

表达式体属性不会自动缓存结果。每次读取属性都会执行右侧表达式：

```csharp
public static string LogPath =>
    PathProvider.CheckDirectory(
        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs"));
```

因此每次访问 `LogPath` 都会调用 `Path.Combine` 和 `PathProvider.CheckDirectory`。如果右侧包含创建目录、读取文件或计算量较大的操作，应确认反复执行是否符合预期；需要缓存时应使用字段或显式初始化逻辑。

## When to Use

- 成员实现很短，且右侧表达式比完整的 `get` 或方法体更清晰。
- 只读计算属性，例如 `Count`、`IsEmpty` 或格式化结果。
- 只有一条操作的方法，例如转发调用或简单状态变更。

当实现包含多步逻辑、分支、异常处理或需要解释的副作用时，普通代码块通常更容易阅读和调试。

## 相关知识

- [C# Fields and Properties](CSharp-Fields-and-Properties.md)
- [C# Lambda Expressions with LINQ](CSharp-Lambda-and-LINQ.md)
- C# Static Members
- C# Methods
- C# Caching and Lazy Initialization
