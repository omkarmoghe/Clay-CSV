// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TableViewEditorProvider } from './editors/tableViewEditorProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.debug("clay-csv.active");

	const tableViewEditorProvider = new TableViewEditorProvider(context);
	const tableViewEditorDisposable = vscode.window.registerCustomEditorProvider(
		TableViewEditorProvider.VIEW_TYPE,
		tableViewEditorProvider
	);

	context.subscriptions.push(tableViewEditorDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
