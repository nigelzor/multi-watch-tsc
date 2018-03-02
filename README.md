multi-watch-tsc
===============

a replacement for `lerna run --stream --parallel`

motivation:
 - runs the first compile synchronously, then watches in parallel
   - when projects have inter-dependencies, ordering is important
   - spawning dozens of `tsc` instances simultaneously slows things to a crawl
 - avoids vm overhead of running tsc per-project

of course, the tradeoff is that it loses any speedup from parallel compilation

usage:
 - `npm i -g multi-watch-tsc` / `yarn global add multi-watch-tsc`
 - in your workspace, run `TSC_NONPOLLING_WATCHER=1 multi-watch-tsc packages/*/tsconfig.json`
