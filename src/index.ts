import * as ts from 'typescript'
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const colors = ["cyan", "magenta", "blue", "yellow", "green", "red"];

function resolveConfigFile(configFile: string) {
    const stat = fs.statSync(configFile);
    if (stat.isDirectory()) {
        configFile = path.join(configFile, 'tsconfig.json');
    }
    const name = path.dirname(configFile);
    return { name, configFile };
}

interface Project {
    name: string;
    configFile: string;
}

function runAllProjects(projects: Project[]) {
    projects.forEach((p, i) => {
        const { name, configFile } = p;
        const root = path.dirname(configFile);
        const heading = chalk.bold.keyword(colors[i % colors.length])(name);

        const reporter = (diagnostic: ts.Diagnostic) => {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            const level = [`warning TS${diagnostic.code}: `, `error TS${diagnostic.code}: `, ''][diagnostic.category];
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
    });
}


export function runAll(paths: string[]) {
    const projects = paths.map(resolveConfigFile);
    runAllProjects(projects);
}

if (require.main === module) {
    const files = process.argv.slice(2);
    runAll(files)
}
