multi-watch-tsc
===============

a replacement for `lerna run --stream --parallel`

motivation:
 - runs the first compile synchronously, then watches in parallel
   - when projects have inter-dependencies, ordering is important
   - spawning dozens of `tsc` instances simultaneously slows things to a crawl
 - avoids vm overhead of running tsc per-project

usage:
 - clone this repository
 - `npm install` / `yarn install`
 - in your workspace, run `TSC_NONPOLLING_WATCHER=1 node --max_old_space_size=4096 ../multi-watch-tsc/dist/index.js packages/*/tsconfig.json`
