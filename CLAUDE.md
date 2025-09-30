# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

lit-async is a library of lit-html directives for handling async operations. It provides the `track` directive for rendering promises and async generators, and the `loading` helper for showing loading states.

## Development Commands

### Build
```bash
npm run build
```
Compiles TypeScript source files in `src/` to JavaScript using `tsc`.

### Development Server
```bash
npm run dev
```
Starts the Web Dev Server on port 3000 (configurable via `PORT` environment variable) with:
- Hot module reloading
- TypeScript compilation via esbuild
- Serves `index.html` which loads the examples component

Access the examples at `http://localhost:3000` to see live demos of the directives.

## Architecture

### Core Modules

**src/track.ts** - The main `track` directive (via `TrackDirective` class)
- Extends Lit's `AsyncDirective` for efficient async rendering
- Handles three input types: Promise, AsyncIterable, or synchronous values
- Accepts optional transform function to process values before rendering
- Can be used as child content, property directive, or attribute directive
- Manages state comparison to avoid redundant processing

**src/loading.ts** - The `loading` helper function
- An async generator that yields loading state first, then the actual result
- Works with promises, async iterables, or sync values
- Accepts custom loading template (defaults to "Loading...")

**src/types.ts** - Type definitions and type guards
- `AsyncState<T>` type: union of `Promise<T>`, `AsyncIterable<T>`, or `T`
- `isPromise()`: type guard for promises
- `isAsyncIterable()`: type guard for async iterables/generators

**src/index.ts** - Public API exports

### Examples Structure

**examples/lit-async-examples.ts** - Interactive demo component
- LitElement component showcasing all directive features
- Demonstrates: basic promises, async generators, transform functions, attribute binding, property binding, loading states
- Auto-refreshes to show real-time async updates
- Each example includes both working demo and code snippet for documentation

**index.html** - Entry point that loads the examples component

### TypeScript Configuration

- Target: ES2021
- Module: ESNext with node resolution
- Experimental decorators enabled
- `useDefineForClassFields: false` for proper Lit decorator behavior

## Key Patterns

### Async State Management
The library uses a unified `AsyncState<T>` type that can be a Promise, AsyncIterable, or direct value. The `track` directive intelligently handles all three cases.

### State Comparison
`TrackDirective` compares the incoming state reference (`this.state !== state`) to determine if it needs to process a new async operation. This prevents duplicate subscriptions to the same promise/generator.

### Transform Pipeline
Both `track` and `loading` support value transformation, allowing composed behaviors without nested directives.

### Error Handling
Promises and async iterables log errors to console and render `undefined` on error, preventing UI crashes.