# @nan0web/protocol

<!-- %PACKAGE_STATUS% -->

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

## Basic usage – CommandProtocol

The protocol accepts an `ExecutableCommand` subclass or a plain
function. It records history of processed messages.

How to create a CommandProtocol with a class command?
```js
import { CommandProtocol, ExecutableCommand } from "@nan0web/protocol"

class EchoCommand extends ExecutableCommand {
/**
	 * @param {import("@nan0web/co").CommandMessage} msg
	 * @param {{db: DB}} _ctx
	 * @returns {Promise<string>}
 */
	async run(msg, _ctx) {
		return msg.args.join(" ")
	}
}

const logger = { info: () => {} } // dummy logger
const protocol = new CommandProtocol({
	command: new EchoCommand(),
	db: fs,
	logger,
})

// Simulate an InputMessage
const input = {
	value: "echo hello world",
	time: new Date(),
}

// Accepts should be true for matching command name
```
## Function command

A plain function can also be used as a command.

How to use a function as command?
```js
import { CommandProtocol } from "@nan0web/protocol"

const fn = (msg, { db }) => {
	db.save = () => {} // dummy to silence type check
	return `Received ${msg.args.length} args`
}
fn.name = "FnEcho"

const protocol = new CommandProtocol({
	command: fn,
	db: fs,
	logger: new NoConsole(),
})

const input = { value: "FnEcho one two", time: new Date() }

```
## Error handling

The protocol catches thrown errors and marks them as critical.

How does CommandProtocol handle errors?
```js
import { CommandProtocol } from "@nan0web/protocol"

const errorCmd = async () => {
	throw new Error("boom")
}
errorCmd.name = "BoomCmd"

const protocol = new CommandProtocol({
	command: errorCmd,
	db: fs,
	logger: new NoConsole(),
})

const input = { value: "BoomCmd test", time: new Date() }

```
## API surface

Exported symbols from the package.

All exported symbols should be present

## Typescript declaration

Package should expose .d.ts files

## CLI Playground

Example command to run the playground script.

How to run playground script?
```bash
npm run playground
```

## Contributing

How to contribute?
```js
const txt = await fs.loadDocument("CONTRIBUTING.md")
```
## License

License is ISC
```js
const txt = await fs.loadDocument("LICENSE")
```