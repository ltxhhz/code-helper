// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode from 'vscode'
import { replaceBackslash, replaceQuotationMarks } from './func'
import { getEnvironment } from './utils'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const env = getEnvironment(context)
  const textChangeListener = vscode.workspace.onDidChangeTextDocument(async event => {
    ;(await replaceBackslash(event)) && (await replaceQuotationMarks(event))
  })
  context.subscriptions.push(textChangeListener)

  if (env.isDev) {
    vscode.window.showInformationMessage('Code Helper is now active!')
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
