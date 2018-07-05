import ts from 'typescript';
import path from 'path';
import chalk from 'chalk';

export function compileAndWatch(configFile: string, heading: string) {
    const root = path.dirname(configFile);
    const reporter = (diagnostic: ts.Diagnostic) => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        const level = [`warning TS${diagnostic.code}: `, `error TS${diagnostic.code}: `, '', ''][diagnostic.category];
        let location = '';
        if (diagnostic.file) {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
            location = `${path.relative(root, diagnostic.file.fileName)}(${line + 1},${character + 1}): `;
        }
        const style = level ? (a: string) => a : chalk.gray;
        const time = style(new Date().toLocaleTimeString());
        console.log(time, heading, style(`${location}${level}${message}`));
    };
    const host = ts.createWatchCompilerHost(configFile, undefined, ts.sys, undefined, reporter, reporter);
    ts.createWatchProgram(host);
}
