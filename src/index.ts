#!/usr/bin/env node --max_old_space_size=4096
import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import createPkgsGraph from 'pkgs-graph';
import graphSequencer from 'graph-sequencer';

const colors = [chalk.cyan, chalk.magenta, chalk.blue, chalk.yellow, chalk.green, chalk.red];

function resolveConfigFile(configFile: string) {
    const stat = fs.statSync(configFile);
    if (stat.isDirectory()) {
        configFile = path.join(configFile, 'tsconfig.json');
    }
    const name = path.dirname(configFile);
    return { name, configFile };
}

function sortProjects(projects: Project[]) {
    const decorated = projects.map((project) => {
        const root = path.dirname(project.configFile);
        const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
        return {
            project: project,
            path: root,
            manifest,
        };
    });
    const { graph: pgraph } = createPkgsGraph(decorated);
    const dgraph = new Map(Object.keys(pgraph).map((p) => [p, pgraph[p].dependencies]) as [string, string[]][]);
    const sequence = graphSequencer({
        graph: dgraph,
        groups: [Object.keys(pgraph)],
    });
    const groups: Project[][] = sequence.chunks.map((chunk) => chunk.map((name) => {
        return decorated.find((d) => d.path === name)!.project;
    }));
    return groups.reduce((m, g) => m.concat(g), []);
}

interface Project {
    name: string;
    configFile: string;
}

function runAllProjects(projects: Project[]) {
    projects.forEach((p, i) => {
        const { name, configFile } = p;
        const root = path.dirname(configFile);
        const heading = colors[i % colors.length].bold(name);

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
    });
}

export function runAll(paths: string[]) {
    const projects = paths.map(resolveConfigFile);
    const sorted = sortProjects(projects);
    runAllProjects(sorted);
}

if (require.main === module) {
    const files = process.argv.slice(2);
    runAll(files);
}
