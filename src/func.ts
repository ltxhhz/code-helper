import * as vscode from 'vscode'

/**
 * 替换反斜杠(\)为双反斜杠(\\)
 */
export async function replaceBackslash(event: vscode.TextDocumentChangeEvent) {
  let activeEditor = vscode.window.activeTextEditor
  const clipboardText = await vscode.env.clipboard.readText()
  if (
    !activeEditor ||
    event.document !== activeEditor.document ||
    !clipboardText.includes('\\') ||
    /^(\\\w)+$/.test(clipboardText) || //转义字符
    /([^\\]|^)\\{2}(?!\\)/.test(clipboardText) || //连续两个反斜杠
    event.reason || //undo & redo
    !event.contentChanges.length ||
    event.contentChanges.some(e => e.text !== clipboardText)
  )
    return true
  for (const change of event.contentChanges) {
    const pasteContent = change.text
    const processedContent = pasteContent.replaceAll('\\', '\\\\')
    const range = new vscode.Range(change.range.start, change.range.end.translate(undefined, +pasteContent.length))
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
  if (
    (event.contentChanges.length >> 1) << 1 !== event.contentChanges.length ||
    event.contentChanges.some(e => !/^['"`]$/.test(e.text)) ||
    !activeEditor ||
    event.document !== activeEditor.document ||
    event.reason
  )
    return true
  const posArr = event.contentChanges.map(e => e.range.start)
  const sign = event.contentChanges[0].text
  for (let i = 0; i < posArr.length; i += 2) {
    const startPos = posArr[i],
      endPos = posArr[i + 1]
    const range = new vscode.Range(startPos.translate(0, 1), endPos.translate(0, 1))
    const inside = event.document.getText(range)
    const reg = /^['"`]([\s\S]+)['"`]$/
    if (reg.test(inside) && !inside.startsWith(sign) && !inside.endsWith(sign)) {
      await activeEditor.edit(editBuilder => {
        editBuilder.replace(range, inside.replace(reg, '$1'))
      })
    }
  }
}
