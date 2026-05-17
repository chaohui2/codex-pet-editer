# Pet 数据格式规范文档

## 概述
本文档定义了桌面宠物（Desktop Pet）的数据格式，用于宠物编辑器和运行时系统。

## 目录结构
```
pets/
└── {pet-id}/
    ├── pet.json          # 宠物元数据和配置
    └── spritesheet.webp  # 精灵图集（所有动画帧）
```

## 1. pet.json 元数据格式

### 基础结构
```json
{
    "id": "juzi",
    "displayName": "juzi",
    "description": "宠物描述",
    "spritesheetPath": "spritesheet.webp"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 宠物唯一标识符，小写字母和连字符 |
| `displayName` | string | ✅ | 宠物显示名称 |
| `description` | string | ✅ | 宠物描述文本 |
| `spritesheetPath` | string | ✅ | 精灵图文件路径 |

## 2. 精灵图（Spritesheet）规格

### 当前示例数据
- **文件**: `spritesheet.webp`
- **尺寸**: 1536px × 1872px
- **格式**: WebP（推荐使用，支持透明和高压缩比）

### 帧尺寸（正确规格）
- **单帧尺寸**: 192px × 208px
- **排列**: 8 列 × 9 行
- **总帧数**: 8 × 9 = **72 帧**

| 验证 | 计算 | 结果 |
|------|------|------|
| 总宽度 | 8 × 192 | 1536px ✅ |
| 总高度 | 9 × 208 | 1872px ✅ |

## 3. 动画状态定义（9行）

每行对应一个动画状态，每行动画有 8 帧：

| 行号 | 状态名称 | 帧数 | 说明 |
|------|----------|------|------|
| 0 | `idle` | 6 帧 | 待机 |
| 1 | `running-right` | 8 帧 | 向右跑 |
| 2 | `running-left` | 8 帧 | 向左跑 |
| 3 | `waving` | 4 帧 | 挥手 |
| 4 | `jumping` | 5 帧 | 跳跃 |
| 5 | `failed` | 8 帧 | 失败/失落 |
| 6 | `waiting` | 6 帧 | 等待 |
| 7 | `running` | 6 帧 | 奔跑（向前） |
| 8 | `review` | 6 帧 | 审视/观察 |

### 状态帧数统计
```
行0 (idle): 6帧
行1 (running-right): 8帧
行2 (running-left): 8帧
行3 (waving): 4帧
行4 (jumping): 5帧
行5 (failed): 8帧
行6 (waiting): 6帧
行7 (running): 6帧
行8 (review): 6帧
------------------
总计: 57 帧（实际使用）
     15 帧（预留空白）
```

## 4. 完整数据格式建议（扩展）

```json
{
    "id": "juzi",
    "displayName": "juzi",
    "description": "A tiny cream-and-ginger tabby kitten",
    "spritesheetPath": "spritesheet.webp",
    "frameWidth": 192,
    "frameHeight": 208,
    "columns": 8,
    "rows": 9,
    "fps": 8,
    "animations": [
        {
            "name": "idle",
            "row": 0,
            "frames": 6,
            "loop": true,
            "description": "待机"
        },
        {
            "name": "running-right",
            "row": 1,
            "frames": 8,
            "loop": true,
            "description": "向右跑"
        },
        {
            "name": "running-left",
            "row": 2,
            "frames": 8,
            "loop": true,
            "description": "向左跑"
        },
        {
            "name": "waving",
            "row": 3,
            "frames": 4,
            "loop": false,
            "description": "挥手"
        },
        {
            "name": "jumping",
            "row": 4,
            "frames": 5,
            "loop": false,
            "description": "跳跃"
        },
        {
            "name": "failed",
            "row": 5,
            "frames": 8,
            "loop": true,
            "description": "失败/失落"
        },
        {
            "name": "waiting",
            "row": 6,
            "frames": 6,
            "loop": true,
            "description": "等待"
        },
        {
            "name": "running",
            "row": 7,
            "frames": 6,
            "loop": true,
            "description": "奔跑（向前）"
        },
        {
            "name": "review",
            "row": 8,
            "frames": 6,
            "loop": true,
            "description": "审视/观察"
        }
    ],
    "tags": ["cat", "kitten", "cute", "orange"],
    "author": "artist-name",
    "version": "1.0.0"
}
```

### 扩展字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `frameWidth` | number | 单帧宽度 = 192 |
| `frameHeight` | number | 单帧高度 = 208 |
| `columns` | number | 列数 = 8 |
| `rows` | number | 行数 = 9 |
| `fps` | number | 动画播放帧率（默认 8 FPS） |
| `animations` | array | 动画序列定义 |
| `animations[].name` | string | 动画状态名称 |
| `animations[].row` | number | 所在行号（0-8） |
| `animations[].frames` | number | 该动画的帧数 |
| `animations[].loop` | boolean | 是否循环播放 |
| `animations[].description` | string | 状态描述 |
| `tags` | string[] | 标签分类 |
| `author` | string | 作者信息 |
| `version` | string | 版本号 |

## 5. 帧索引计算

给定动画的行号和帧编号，计算在精灵图中的位置：

```javascript
// 给定行号 row (0-8) 和该行内的帧号 frame (0-7)
const row = 0;      // 动画所在行
const frame = 0;    // 该行内的帧索引

const frameWidth = 192;
const frameHeight = 208;
const columns = 8;

const x = frame * frameWidth;
const y = row * frameHeight;

// 全局帧索引（从0开始）
const globalFrameIndex = row * columns + frame;
```

## 6. 编辑器数据结构

### 宠物编辑器状态结构
```typescript
interface PetEditorState {
    currentPet: PetData;
    selectedAnimation: string | null;
    previewFrame: number;
    isPlaying: boolean;
    zoom: number;
    showGrid: boolean;
}

interface PetData {
    id: string;
    displayName: string;
    description: string;
    spritesheetPath: string;
    frameWidth: number;
    frameHeight: number;
    animations: Animation[];
}

interface Animation {
    name: string;
    row: number;
    frames: number;
    loop: boolean;
    description: string;
}
```

## 7. juzi 宠物数据总结

- **ID**: `juzi`
- **精灵图尺寸**: 1536 × 1872 px
- **单帧尺寸**: 192 × 208 px
- **排列**: 8 列 × 9 行
- **总帧数**: 72 帧（57 帧已使用，15 帧预留）
- **动画状态数**: 9 个
- **推荐 FPS**: 8 FPS

---
*最后更新: 2026-05-17*
