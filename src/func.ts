import vscode from 'vscode'

/**
 * 替换反斜杠(\)为双反斜杠(\\)
 */
export async function replaceBackslash(event: vscode.TextDocumentChangeEvent) {
  const activeEditor = vscode.window.activeTextEditor
  const maxLines = vscode.workspace.getConfiguration().get<number>('code-helper.replaceBackslashMaxLines', 10)
  const clipboardText = await vscode.env.clipboard.readText()
  const excluded = /(\\[0abtnvfr\]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\[0-7]{3})/
  const windowsPath = /^.?\w:.+$/
  if (
    !activeEditor ||
    event.document !== activeEditor.document ||
    !clipboardText.includes('\\') ||
    (excluded.test(clipboardText) && !windowsPath.test(clipboardText)) || //转义字符除了windows路径
    /([^\\]|^)\\{2}(?!\\)/.test(clipboardText) || //连续两个反斜杠
    /\\$/m.test(clipboardText) || //在行尾
    event.reason || //undo & redo
    !event.contentChanges.length ||
    event.contentChanges.some(e => e.text !== clipboardText) ||
    (maxLines && clipboardText.split('\n').length > maxLines)
  )
    return true
  // console.log(event.contentChanges)

  await activeEditor.edit(editBuilder => {
    for (const change of event.contentChanges) {
      const pasteContent = change.text
      const processedContent = pasteContent.replaceAll('\\', '\\\\')

      // 💡 修复：精确计算粘贴内容结束的 Position
      const lines = pasteContent.split('\n')
      const lineCount = lines.length - 1
      const lastLineLength = lines[lines.length - 1].length

      const startPos = change.range.start
      let endPos: vscode.Position

      if (lineCount === 0) {
        // 单行情况：在原有的 character 位置上往后平移
        endPos = startPos.translate(0, lastLineLength)
      } else {
        // 多行情况：跨行后，最后一行的 character 绝对位置就是 lastLineLength
        endPos = new vscode.Position(startPos.line + lineCount, lastLineLength)
      }

      const range = new vscode.Range(startPos, endPos)

      if (processedContent !== pasteContent) {
        editBuilder.replace(range, processedContent)
      }
    }
  })
}

/**
 * 替换掉引号中间的引号
 */
export async function replaceQuotationMarks(event: vscode.TextDocumentChangeEvent) {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor || event.contentChanges.length === 0) return
  if (event.reason || event.document !== activeEditor.document) return

  const change = event.contentChanges[0]
  const newChar = change.text
  const validQuotes = ['"', "'", '`']

  if (!validQuotes.includes(newChar)) return

  const newSelections: vscode.Selection[] = []
  const document = activeEditor.document

  // 将所有修改合并到一次 edit 事务中
  await activeEditor.edit(editBuilder => {
    for (const selection of activeEditor.selections) {
      if (selection.isEmpty) continue

      const selectedRange = new vscode.Range(selection.start.translate(0, -1), selection.end.translate(0, 1))
      const textWithBoundary = document.getText(selectedRange)

      // 防止获取范围越界导致报错
      if (textWithBoundary.length < 2) continue

      const leftChar = textWithBoundary[0] // translate(-1) 后的第一个字符
      const rightChar = textWithBoundary.slice(-1) // 最后一个字符

      if (!validQuotes.includes(leftChar) || leftChar !== rightChar) continue
      // 输入的引号与选中文本两侧引号相同时，判断是否为 VSCode 自动包裹行为
      const secondChar = textWithBoundary[1]
      const secondLastChar = textWithBoundary[textWithBoundary.length - 2]
      // 第2和倒数第2个字符一样且是引号，说明选中文本本身含引号，继续处理；否则跳过
      if (newChar === leftChar && !(validQuotes.includes(secondChar) && secondChar === secondLastChar && newChar !== secondChar)) continue

      editBuilder.replace(new vscode.Range(selection.start, selection.start.translate(0, 1)), '')
      editBuilder.replace(new vscode.Range(selection.end.translate(0, -1), selection.end), '')

      // 调整选区保持选中状态
      newSelections.push(new vscode.Selection(selection.start.translate(0, -1), selection.end.translate(0, -1)))
    }
  })

  if (newSelections.length) {
    activeEditor.selections = newSelections
  }
}
