import { describe, it, before, beforeEach } from "node:test"
import assert from "node:assert/strict"
import FS from "@nan0web/db-fs"
import { NoConsole } from "@nan0web/log"
import {
	DatasetParser,
	DocsParser,
} from "@nan0web/test"
import {
	CommandProtocol,
	ExecutableCommand,
} from "./index.js"

let pkg
const fs = new FS()
let console = new NoConsole()

before(async () => {
	const doc = await fs.loadDocument("package.json", {})
	pkg = doc || {}
})

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite which also serves as the source for README generation.
 *
 * Each `it` block contains a JSDoc `@docs` comment that is extracted
 * to build the final `README.md`. Keeping the documentation
 * close to the code guarantees consistency.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/protocol
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * Minimalistic protocol for executing commands in a message‑driven
	 * environment. It validates input, runs a command (class or function)
	 * and returns a structured output.
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/protocol
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/protocol")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/protocol
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/protocol")
	})
	/**
	 * @docs
	 * ## Basic usage – CommandProtocol
	 *
	 * The protocol accepts an `ExecutableCommand` subclass or a plain
	 * function. It records history of processed messages.
	 */
	it("How to create a CommandProtocol with a class command?", async () => {
		//import { CommandProtocol, ExecutableCommand } from "@nan0web/protocol"

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
		assert.ok(protocol.accepts(input))

		const output = await protocol.process(input)

		assert.deepStrictEqual(output.content, ["hello", "world"])
		assert.equal(output.meta.source, "EchoCommand")
		assert.equal(protocol.history.length, 1)
	})
	/**
	 * @docs
	 * ## Function command
	 *
	 * A plain function can also be used as a command.
	 */
	it("How to use a function as command?", async () => {
		//import { CommandProtocol } from "@nan0web/protocol"

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

		assert.ok(protocol.accepts(input))

		const out = await protocol.process(input)

		assert.deepStrictEqual(out.content, ["Received 2 args"])
		assert.equal(out.meta.source, "FnEcho")
	})
	/**
	 * @docs
	 * ## Error handling
	 *
	 * The protocol catches thrown errors and marks them as critical.
	 */
	it("How does CommandProtocol handle errors?", async () => {
		//import { CommandProtocol } from "@nan0web/protocol"

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

		assert.ok(protocol.accepts(input))

		const res = await protocol.process(input)

		assert.deepStrictEqual(res.content, ["boom"])
		assert.equal(res.priority, 100) // critical
		assert.ok(res.error instanceof Error)
	})
	/**
	 * @docs
	 * ## API surface
	 *
	 * Exported symbols from the package.
	 */
	it("All exported symbols should be present", () => {
		assert.ok(CommandProtocol)
		assert.ok(ExecutableCommand)
	})
	/**
	 * @docs
	 * ## Typescript declaration
	 */
	it("Package should expose .d.ts files", () => {
		assert.equal(pkg.types, "types/index.d.ts")
	})
	/**
	 * @docs
	 * ## CLI Playground
	 *
	 * Example command to run the playground script.
	 */
	it("How to run playground script?", async () => {
		/**
		 * ```bash
		 * npm run playground
		 * ```
		 */
		assert.ok(typeof pkg.scripts?.playground === "string")
	})
	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute?", async () => {
		const txt = await fs.loadDocument("CONTRIBUTING.md")
		assert.ok(String(txt).includes("# Contributing"))
	})
	/**
	 * @docs
	 * ## License
	 */
	it("License is ISC", async () => {
		const txt = await fs.loadDocument("LICENSE")
		assert.ok(String(txt).includes("ISC"))
	})
}

/* -------------------------------------------------------------------------- */

describe("README.md testing", testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const parser = new DocsParser()
	const format = new Intl.NumberFormat("en-US").format

	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const readme = await fs.loadDocument("README.md")
		assert.ok(readme.includes("## License"))
	})
})
