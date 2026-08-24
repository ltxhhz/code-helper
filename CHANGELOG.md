# Change Log

## v1.0.1 - 2026/8/24

- 将 .eslintrc.json 迁移为新的 eslint.config.js 配置文件
- 更新 .gitignore 和 .vscodeignore 添加 note.md 和相关忽略规则
- 修复 replaceBackslash 函数中行尾反斜杠的检测逻辑
- 优化 replaceQuotationMarks 函数，添加对 VSCode 自动包裹行为的判断
- 移除调试用的 console.log 语句

## v1.0.0 - 2026/3/13

- 修复粘贴时覆盖后续引号的问题（优化 Range 计算逻辑，支持选中文本和多行粘贴场景）

## v0.0.4 - 2025/8/14

- 修复新版本光标跳到第一行的问题

## v0.0.3 - 2025/3/6

- 修复多个问题
- 添加转义行数配置项
- 添加国际化

## v0.0.2 - 2024/4/8

- 粘贴内容中存在连续两个反斜杠才会触发

## v0.0.1 - 2024/4/8

- Initial release
