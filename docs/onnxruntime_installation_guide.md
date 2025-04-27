# ONNX Runtime 安装问题解决方案

## 问题描述

在 macOS 系统上安装 `onnxruntime==1.21.1` 时遇到兼容性问题，主要涉及：
- Python 版本兼容性（Python 3.12）
- 系统架构兼容性（macosx_10_16_x86_64）
- 依赖包版本冲突

## 环境信息

- 操作系统：macOS 24.2.0
- Python 版本：3.12
- 包管理器：uv

## 解决方案

### 方案一：降级 onnxruntime 版本

```bash
pip install onnxruntime==1.15.1
```

### 方案二：使用兼容的 Python 版本

推荐使用 Python 3.10 或 3.11 版本，这些版本与 onnxruntime 1.21.1 有更好的兼容性：

```bash
# 使用 pyenv 安装并切换到 Python 3.11
pyenv install 3.11
pyenv global 3.11

# 重新安装依赖
pip install -r requirements.txt
```

### 方案三：升级 macOS 系统

如果系统版本过低，可以考虑升级 macOS 到更新的版本，以支持更新的 wheel 包。

### 方案四：使用 conda 环境

```bash
# 创建新的 conda 环境
conda create -n onnx_env python=3.11
conda activate onnx_env

# 安装 onnxruntime
conda install -c conda-forge onnxruntime
```

## 关键点总结

1. **版本兼容性**
   - onnxruntime 1.21.1 需要特定的 Python 版本支持
   - 建议使用 Python 3.10 或 3.11
   - 注意系统架构和 macOS 版本要求

2. **包管理器选择**
   - pip：最基础的包管理器，但可能遇到依赖解析问题
   - conda：提供更好的环境隔离和依赖管理
   - uv：新的包管理器，提供更快的安装速度

3. **环境隔离**
   - 建议使用虚拟环境（venv/conda）进行安装
   - 避免影响系统 Python 环境
   - 便于管理不同项目的依赖

4. **故障排除步骤**
   - 检查 Python 版本兼容性
   - 验证系统架构支持
   - 确认依赖包版本冲突
   - 尝试不同的包管理器

## 最佳实践建议

1. 在项目开始前，先确认所有依赖包的版本兼容性
2. 使用虚拟环境管理项目依赖
3. 记录完整的依赖版本信息
4. 定期更新依赖包以获取安全补丁和新特性
5. 保持开发环境和生产环境的一致性 