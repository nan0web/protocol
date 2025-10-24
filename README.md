# @nan0web/protocol

|[Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Documentation|Test coverage|Features|Npm version|
|---|---|---|---|---|
 |🟢 `99.7%` |🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/protocol/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/protocol/blob/main/docs/uk/README.md) |🟢 `100.0%` |✅ d.ts 📜 system.md 🕹️ playground |— |

Minimalistic protocol for executing commands in a message‑driven
environment. It validates input, runs a command (class or function)
and returns a structured output.

## Installation

How to install with npm?
```bash
npm install @nan0web/protocol
```

How to install with pnpm?
```bash
pnpm add @nan0web/protocol
```

How to install with yarn?
```bash
yarn add @nan0web/protocol
```

## Basic usage – CommandProtocol

The protocol accepts an `ExecutableCommand` subclass or a plain
function. It records a history of processed messages.

How to create a CommandProtocol with a class command?
```js
class EchoCommand extends ExecutableCommand {
	name = "Echo"
	async run(msg) {
		return msg.argv.join(" ")
	}
}

const protocol = new CommandProtocol({
	command: new EchoCommand(),
	db: fs,
	logger: new NoConsole(),
})

const input = { value: "Echo hello world", time: Date.now() }
console.info(protocol.accepts(input)) // ← true

const out = await protocol.process(input)
console.info(out)
// { content: ["hello world"], error: null, meta: { source: "Echo" }, priority: 0 }
console.info(protocol.history[0].message)
// CommandMessage { body: "Echo hello world", head: {} }

```

How to use a plain function as command?
```js
const fn = (msg) => msg.argv.map(v => v.toUpperCase())

const protocol = new CommandProtocol({
	command: fn,
	db: fs,
	logger: new NoConsole(),
})

const input = { value: "fn hello planet", time: Date.now() }
const out = await protocol.process(input)

console.info(protocol.accepts(input)) // ← true
console.info(out.content) // ← ["HELLO", "PLANET"]
console.info(out.meta.source) // ← "fn"

```
## Object‑style command

Returning an object allows custom `content`, `priority` and `meta`.

How to return an object from a command?
```js
function ObjCmd(msg) {
	return {
		content: ["custom", ...msg.argv],
		priority: 7,
		meta: { extra: true },
	}
}

const protocol = new CommandProtocol({
	command: ObjCmd,
	db: fs,
	logger: new NoConsole(),
})

const input = { value: "ObjCmd a b", time: Date.now() }
const out = await protocol.process(input)

console.info(out.content) // ← ["custom", "a", "b"]
console.info(out.priority) // ← 7
console.info(out.meta) // ← { extra: true, source: "ObjCmd" }

```
## Fallback response

When the command does not return a recognised shape.

How does fallback look like?
```js
const fn = () => 12345

const protocol = new CommandProtocol({
	command: fn,
	db: fs,
	logger: new NoConsole(),
})

const input = { value: "fn any", time: Date.now() }
const out = await protocol.process(input)

console.info(out.content)
// [ "Command executed.", "(no output data)" ]
console.info(out.meta.source) // ← fn
```
## Error handling

Thrown errors are caught and marked as critical (`priority: 100`).

How are errors reported?
```js
const boom = () => {
	throw new Error("boom")
}

const protocol = new CommandProtocol({
	command: boom,
	db: fs,
	logger: new NoConsole(),
})

const input = { value: "boom test", time: Date.now() }
const out = await protocol.process(input)
console.info(out.content) // ← ["boom"]
console.info(out.priority) // ← 100
console.info(out.error instanceof Error) // ← true
console.info(out.meta.source) // ← boom

```
## API surface

Exported symbols must be present.

All exported classes should be available

## TypeScript declarations

Package provides .d.ts files

## CLI Playground

Example command to run the playground script.

How to run playground script?
```bash
npm run play
```

## Contributing

How to contribute? - [check here](./CONTRIBUTING.md)

## License

How to license ISC? - [check here](./LICENSE)
