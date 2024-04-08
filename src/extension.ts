// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { replaceBackslash, replaceQuotationMarks } from './func'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor
  // 注册文本改变监听器
  const textChangeListener = vscode.workspace.onDidChangeTextDocument(async event => {
    ;(await replaceBackslash(event)) && (await replaceQuotationMarks(event))
  })
  context.subscriptions.push(textChangeListener)
}

// This method is called when your extension is deactivated
export function deactivate() {}

