import vscode from 'vscode'
export function getEnvironment(context: vscode.ExtensionContext) {
  return {
    isDev: context.extensionMode === vscode.ExtensionMode.Development,
    isProd: context.extensionMode === vscode.ExtensionMode.Production,
    isTest: context.extensionMode === vscode.ExtensionMode.Test
  }
}
