# 机器视觉：ROI 裁剪与模板匹配检测模式

## 所属领域

```text
Engineering
└── Hardware Integration
    └── Machine Vision
        ├── Region of Interest (ROI)
        └── Template Matching
```

## 相关知识

- [C# 资源释放与对象所有权](../../DotNet/CSharp/CSharp-Resource-Disposal-and-Ownership.md)
- [C# 字符串拆分与 Flags 位标志选项](../../DotNet/CSharp/CSharp-String-Split-and-Flags-Enum-Options.md)
- SkiaSharp 图像处理（`SKBitmap` / `SKRectI`）
- 工业相机取图与图像坐标系

---

## 核心概念

在自动化检测、工控视觉与投屏监控等工业视觉场景中，核心算法流程通常分为三步：

```text
[工业相机 / 屏幕取图] ──> [ROI 感兴趣区域校验与裁剪] ──> [模板匹配与相似度评分]
```

---

## 1. ROI 区域解析与坐标系越界防御

### 什么是 ROI？
**ROI（Region of Interest，感兴趣区域）** 是指在整幅图像中需要重点分析的目标矩形子区域（通常表示为 `x, y, width, height`）。

### 为什么必须做 `ValidateRoi` 坐标越界校验？
底层的图像处理库（如 SkiaSharp、OpenCV）多数基于 C/C++ 原生指针与非托管内存进行像素访问。**如果传入的 ROI 超出了当前画面的物理像素范围（如 `Right > Width` 或 `Top < 0`），可能导致底层内存越界访问（Access Violation），直接导致整个宿主进程闪退崩溃**。

```csharp
private static void ValidateRoi(SKRectI roi, SKBitmap image)
{
    if (roi.Left < 0 ||
        roi.Top < 0 ||
        roi.Right > image.Width ||
        roi.Bottom > image.Height)
    {
        throw new FailException(
            $"检测区域超出相机图像范围：区域={roi.Left},{roi.Top},{roi.Width},{roi.Height}，" +
            $"图像={image.Width},{image.Height}");
    }
}
```

---

## 2. 图像子区域裁剪（`ExtractSubset`）

在 SkiaSharp 中，裁剪指定子区域的规范写法：

```csharp
using var image = VisionController.GrabOne(camera);
ValidateRoi(roi, image);

// 分配裁剪后的子图内存
using var currentRoi = new SKBitmap(roi.Width, roi.Height);

if (!image.ExtractSubset(currentRoi, roi))
{
    throw new FailException("投屏检测区域裁剪失败");
}
```

* `currentRoi` 占用了原生位图内存，必须使用 `using` 限定生命周期，确保每次循环比对结束后及时归还内存。

---

## 3. 模板匹配算法与相似度阈值判定

模板匹配（Template Matching）通过在待测图像上滑动基准模板（Template Image），计算各像素区域的相关性分值：

```csharp
using var matchResult = VisionUtil.Vision.MatchTemplate(
    currentRoi,
    template.Bmp,
    VisionMatchType.MATCH_WITH_NO_CHECK);

var similarity = matchResult.BestValue; // 归一化相似度分值 [0.0 ~ 1.0]

// 严格按配置阈值判定异常
if (similarity < similarityThreshold)
{
    // 触发断连或异常处理
}
```

* **`similarityThreshold`（相似度阈值）**：浮点数区间 `(0, 1]`。通常设定在 `0.85 ~ 0.95` 之间。
* **分值判定**：当画面断连、黑屏或发生严重遮挡时，匹配分值会显著骤降，系统据此判定状态异常并中断当前流程。
