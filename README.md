multi-watch-tsc [![Build Status](https://travis-ci.org/nigelzor/multi-watch-tsc.svg?branch=master)](https://travis-ci.org/nigelzor/multi-watch-tsc)
===============

a replacement for `lerna run --stream --parallel`

in typescript 3.3 and above, just use `tsc --build --watch` instead

motivation:
 - runs the first compile in order, spawning additional workers when appropriate
   - when projects have inter-dependencies, ordering is important
   - spawning dozens of `tsc` instances simultaneously slows things to a crawl
 - avoids vm overhead of running tsc per-project

of course, the tradeoff is that it loses any speedup from parallel compilation

usage:
 - `npm i -g multi-watch-tsc` / `yarn global add multi-watch-tsc`
 - in your workspace, run `TSC_NONPOLLING_WATCHER=1 multi-watch-tsc packages/*/tsconfig.json`
 - you may also want to set `NODE_OPTIONS=--max_old_space_size=4096` if you're compiling a large project
