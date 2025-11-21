# JAR功能测试指南

## 快速测试步骤

### 1. 准备测试文件

你已经有：
```
AraxersBestiary-1.20.1-forge-1.4.1.jar (607.2 KB)
└─ assets/araxers_bestiary/lang/en_us.json (282条记录)
```

### 2. 测试场景

#### 场景A：单个JAR上传
1. 打开语言文件翻译页面
2. 点击上传，选择 `AraxersBestiary-1.20.1-forge-1.4.1.jar`
3. 等待自动提取（应该看到多个文件出现）
4. 检查文件名格式：`[JAR名] 模组ID/文件名`

**预期结果**：
```
✅ [AraxersBestiary...jar] araxers_bestiary/en_us.json
✅ [AraxersBestiary...jar] araxers_bestiary/zh_cn.json (如果有)
✅ [AraxersBestiary...jar] araxers_bestiary/de_de.json (如果有)
```

#### 场景B：混合文件上传
1. 同时选择：
   - `AraxersBestiary-1.20.1-forge-1.4.1.jar`
   - 一个单独的 `test.json` 文件
2. 上传

**预期结果**：
```
✅ [AraxersBestiary...jar] araxers_bestiary/en_us.json
✅ test.json
```

#### 场景C：多个JAR
1. 上传 2-3 个不同的mod JAR文件
2. 观察提取过程

**预期结果**：
- 每个JAR的语言文件都被单独列出
- 文件名包含JAR来源标识

#### 场景D：完整翻译流程
1. 上传JAR
2. 填写API Key
3. 选择目标语言（例如：zh_cn）
4. 开始翻译
5. 观察进度（智能批次）
6. 下载单个文件
7. 测试"Download All"

**预期结果**：
```
✅ 提取成功
✅ 翻译完成（带进度显示）
✅ 文件名：en_us_zh_cn.json
✅ ZIP包含所有翻译文件
```

### 3. 错误测试

#### 测试1：空JAR
创建一个不包含语言文件的JAR
**预期**：显示错误 "No language files found..."

#### 测试2：损坏的JAR
上传一个重命名的非ZIP文件
**预期**：显示错误 "Failed to extract JAR..."

#### 测试3：大量文件
上传包含>20个语言文件的JAR
**预期**：所有文件都被正确提取和列出

---

## 功能验证清单

### 提取功能
- [ ] JAR文件被正确识别
- [ ] assets/*/lang/ 路径被扫描
- [ ] .json 文件被提取
- [ ] .lang 文件被提取
- [ ] 模组ID被正确识别
- [ ] 文件名显示清晰

### 翻译功能
- [ ] 提取的文件可以翻译
- [ ] 智能批次正常工作
- [ ] 进度显示包含token信息
- [ ] 大文件不会超token
- [ ] 错误能被捕获和显示

### 下载功能
- [ ] 单个文件下载正常
- [ ] 文件名格式正确
- [ ] 内容格式保持（.json或.lang）
- [ ] Download All打包正确
- [ ] ZIP包含所有完成的文件

### 用户体验
- [ ] 上传反馈及时
- [ ] 提取进度可见
- [ ] 错误消息清晰
- [ ] 可以删除提取的文件
- [ ] 可以重试失败的文件

---

## 性能测试

### 小型JAR (< 1MB)
- 提取时间：< 1秒
- 内存占用：可忽略

### 中型JAR (1-5MB)
- 提取时间：1-3秒
- 可同时处理：5-10个

### 大型JAR (> 10MB)
- 提取时间：3-5秒
- 建议：一次处理2-3个

---

## 调试信息

如果遇到问题，打开浏览器控制台查看：

### 正常日志
```javascript
// JAR解析成功
Extracting JAR: AraxersBestiary-1.20.1-forge-1.4.1.jar
Found 5 language files

// 翻译进度
Translating batch 3/12 (45 texts, ~3800 tokens)...
Translated 150/282 texts
```

### 错误日志
```javascript
// 提取失败
Failed to extract AraxersBestiary.jar: Error: Invalid zip format

// 路径不匹配
No files match pattern: ^assets/[^/]+/lang/[^/]+\.(json|lang)$
```

---

## 与旧系统对比

### 字节码翻译页面（保持不变）
- 用途：修改JAR内的Java字节码
- 输入：.jar文件
- 输出：新的.jar文件（修改后）
- 适用：需要修改硬编码字符串

### 语言文件翻译页面（新增JAR支持）
- 用途：翻译语言文件
- 输入：.json, .lang, .jar文件
- 输出：翻译后的语言文件
- 适用：制作资源包、本地化

---

## 推荐工作流

### 对于Mod作者：
1. 上传mod JAR到语言文件翻译页面
2. 翻译成多种语言
3. 将翻译文件放回mod源代码
4. 重新打包发布

### 对于玩家/汉化者：
1. 上传游戏mod JAR
2. 翻译成目标语言
3. 下载翻译文件
4. 制作成资源包
5. 分享给社区

### 资源包结构示例：
```
ChineseTranslation/
├── pack.mcmeta
└── assets/
    ├── araxers_bestiary/
    │   └── lang/
    │       └── zh_cn.json
    ├── another_mod/
    │   └── lang/
    │       └── zh_cn.json
    └── third_mod/
        └── lang/
            └── zh_cn.json
```

放入 `.minecraft/resourcepacks/` 即可使用！
