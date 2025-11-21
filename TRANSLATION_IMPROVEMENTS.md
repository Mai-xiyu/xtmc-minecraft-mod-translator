# 翻译系统改进说明

## 问题1：JAR文件上传错误

### 症状
```
AraxersBestiary-1.20.1-forge-1.4.1.jar(607.2 KB)→ .json
失败: Invalid file format. Only .json and .lang files are supported.
```

### 原因
JAR文件上传到了错误的页面！

### 解决方法
- **.jar 文件** → **"Bytecode Translation"（字节码翻译）** 页面
- **.json/.lang 文件** → **"Language File Translation"（语言文件翻译）** 页面

### 新增错误提示
现在如果上传JAR到语言文件页面，会显示：
```
JAR files must be uploaded to the "Bytecode Translation" page, not here. 
This page only accepts .json and .lang files.
```

---

## 问题2：Token超限处理

### 问题背景
固定批次大小（50条）可能导致token超限：
- 某些文本很长（如 en_us.json 中的描述）
- 50条 × 300字符 = 15,000字符 ≈ 4,000 tokens
- 加上输出可能达到 8,000+ tokens
- 超过某些AI模型的限制

### 解决方案：智能动态批次

#### 1. Token估算
```javascript
estimateTokens(text) {
    return Math.ceil(text.length / 4);  // 1 token ≈ 4 characters
}
```

#### 2. 模型限制配置
```javascript
getMaxTokensPerBatch() {
    const limits = {
        'Deepseek': 4000,   // 保守估计
        'OpenAI': 3000,     // GPT-4o-mini (留出输出空间)
        'Claude': 4000,     // Haiku
        'Gemini': 6000      // Gemini Pro
    };
    return limits[this.selectedAI] || 3000;
}
```

#### 3. 动态批次构建
```javascript
while (i < entries.length) {
    const batch = [];
    let currentTokens = 100; // 基础提示tokens
    
    while (i < entries.length && batch.length < 100) {
        const textTokens = this.estimateTokens(text);
        
        // 检查是否会超限
        if (currentTokens + textTokens > maxTokensPerBatch && batch.length > 0) {
            break; // 开始新批次
        }
        
        batch.push(text);
        currentTokens += textTokens;
        i++;
    }
    
    // 翻译当前批次...
}
```

#### 4. 自动重试机制
如果遇到token错误：
1. 捕获错误（检查关键词："token"、"length"）
2. 将批次减半重试
3. 如果仍失败，抛出错误

```javascript
try {
    const translated = await this.translateBatch(textsToTranslate);
} catch (apiError) {
    if (apiError.message.includes('token') || apiError.message.includes('length')) {
        // 重试，批次减半
        const halfBatch = batch.slice(0, Math.ceil(batch.length / 2));
        const translatedHalf = await this.translateBatch(halfBatch);
        // 将剩余部分加回队列...
    }
}
```

### 优势
1. ✅ **自适应**：根据文本长度自动调整批次大小
2. ✅ **模型感知**：不同AI使用不同的token限制
3. ✅ **实时反馈**：显示每批次的token数量
4. ✅ **容错性**：遇到错误自动重试
5. ✅ **效率优化**：短文本批次更大，长文本批次更小

### 用户可见的改进
进度显示现在包含：
```
Translating batch 3/12 (45 texts, ~3800 tokens)...
```

### 处理极端情况
- **超长单文本**：如果单条文本超过限制，会单独处理并记录警告
- **token超限**：自动减半批次重试
- **网络错误**：保留原有的重试机制

---

## 测试建议

### 测试用例1：正常文件
- 文件：en_us.json (282条记录)
- 预期：自动分成 8-15 个批次
- 每批次：20-50 条文本，取决于长度

### 测试用例2：超长文本
- 包含大段描述的JSON
- 预期：批次大小自动减少到 5-10 条

### 测试用例3：JAR错误上传
- 上传 .jar 到语言文件页面
- 预期：明确提示去字节码页面

---

## 技术细节

### Token估算精度
- 英文：~4 characters = 1 token
- 中文：~1.5 characters = 1 token
- 使用保守估计避免超限

### 批次限制
- **最大批次大小**：100条文本（防止过大）
- **最小批次大小**：1条（处理超长文本）
- **Token上限**：根据AI模型动态调整

### 性能影响
- 批次数量可能增加 → 但避免了失败
- 每批次间延迟 500ms（防止限流）
- 总时间略有增加，但成功率大幅提升

