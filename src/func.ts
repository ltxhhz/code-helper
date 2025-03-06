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
    event.reason || //undo & redo
    !event.contentChanges.length ||
    event.contentChanges.some(e => e.text !== clipboardText) ||
    (maxLines && clipboardText.split('\n').length > maxLines)
  )
    return true
  console.log(event.contentChanges)

  for (const change of event.contentChanges) {
    const pasteContent = change.text
    const processedContent = pasteContent.replaceAll('\\', '\\\\')
    const lineCount = (pasteContent.match(/\n/g) || []).length
    const lastLineChars = pasteContent.split('\n').pop()?.length || 0
    const range = new vscode.Range(change.range.start, change.range.end.translate(lineCount, lastLineChars))
    if (processedContent !== pasteContent) {
      await activeEditor.edit(editBuilder => {
        editBuilder.replace(range, processedContent)
      })
    }
  }
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
  const proc = async (index: number) => {
    const selection = activeEditor.selections[index]
    if (selection.isEmpty) return

    const document = activeEditor.document
    const selectedRange = new vscode.Range(selection.start.translate(0, -1), selection.end.translate(0, 1))
    const textWithBoundary = document.getText(selectedRange)

    const [leftChar, rightChar] = [textWithBoundary[1], textWithBoundary.slice(-2, -1)]
    if (!validQuotes.includes(leftChar) || leftChar !== rightChar) return
    await activeEditor.edit(editBuilder => {
      editBuilder.replace(new vscode.Range(selection.start, selection.start.translate(0, 1)), '')
      editBuilder.replace(new vscode.Range(selection.end.translate(0, -1), selection.end), '')
      // 调整选区保持选中状态
      const newSelection = new vscode.Selection(selection.start.translate(0, -1), selection.end.translate(0, -1))
      newSelections.push(newSelection)
    })
  }
  for (let i = 0; i < activeEditor.selections.length; i++) {
    await proc(i)
  }
  activeEditor.selections = newSelections
}
