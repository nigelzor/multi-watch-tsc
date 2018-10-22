#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import createPkgsGraph from 'pkgs-graph';
import graphSequencer from 'graph-sequencer';
import Worker from 'jest-worker';

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
    return sequence.chunks.map((chunk) =>
        chunk.map((name) => {
            return decorated.find((d) => d.path === name)!.project;
        })
    );
}

interface Project {
    name: string;
    configFile: string;
}

async function runAllProjects(projects: Project[][]) {
    let pi = 0;
    const worker = new Worker(require.resolve('./worker'), {
        forkOptions: {
            stdio: [0, 1, 2, 'ipc'],
        },
    });

    for (const generation of projects) {
        await Promise.all(
            generation.map((p) => {
                const { name, configFile } = p;
                const heading = colors[pi++ % colors.length].bold(name);

                return (worker as any).compileAndWatch(configFile, heading);
            })
        );
    }
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
