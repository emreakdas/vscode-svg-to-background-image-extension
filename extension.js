
const vscode = require('vscode');

const symbols = /[\r\n%#()<>?[\\\]^`{|}]/g;
let externalQuotesValue = "double";
let quotes = getQuotes();

function getResults(value){
  const namespaced = addNameSpace(value);
  const escaped = encodeSVG(namespaced);
  const resultCss = `background-image: url(${quotes.level1}data:image/svg+xml,${escaped}${quotes.level1});`; 
  return resultCss;
}

function addNameSpace (data) {
  if (data.indexOf(`http://www.w3.org/2000/svg`) < 0) {
    data = data.replace(/<svg/g, `<svg xmlns=${quotes.level2}http://www.w3.org/2000/svg${quotes.level2}`);
  }

  return data;
}

function encodeSVG (data) {
  if (externalQuotesValue === `double`) {
    data = data.replace(/"/g, `'`);
  } else {
    data = data.replace(/'/g, `"`);
  }

  data = data.replace(/>\s{1,}</g, `><`);
  data = data.replace(/\s{2,}/g, ` `);

  return data.replace(symbols, encodeURIComponent);
}

function getQuotes () {
  const double = `"`;
  const single = `'`;

  return {
    level1: externalQuotesValue === `double` ? double : single,
    level2: externalQuotesValue === `double` ? single : double
  };
}

function activate(context) {
	let disposable = vscode.commands.registerCommand('svg-to-background-image.plugins', function () {
		const editor = vscode.window.activeTextEditor;
		if(!editor){
			return;
		}
		
		const text = editor.document.getText(editor.selection);
		if(!text){
			vscode.window.showInformationMessage("pls. select svg!");
			return;
		}
		
		editor.edit((editBuilder) => {
			editBuilder.replace(editor.selection, getResults(text));
		}).then(success => {
			vscode.window.showInformationMessage("Converted!");
		})
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
