import { describe, it, before, beforeEach } from "node:test"
import assert from "node:assert/strict"
import FS from "@nan0web/db-fs"
import { NoConsole } from "@nan0web/log"
import { DocsParser, DatasetParser, runSpawn } from "@nan0web/test"
import { CommandProtocol, ExecutableCommand } from "./index.js"
import { CommandMessage } from "@nan0web/co"

const fs = new FS()
let pkg

before(async () => {
	const doc = await fs.loadDocument("package.json", {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also drives README generation.
 *
 * Block comments (`@docs`) inside each `it` become part of the final
 * markdown. Keeping examples close to the code guarantees they stay
 * up‑to‑date and executable.
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
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/protocol
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/protocol")
	})

	/**
	 * @docs
	 * ## Basic usage – CommandProtocol
	 *
	 * The protocol accepts an `ExecutableCommand` subclass or a plain
	 * function. It records a history of processed messages.
	 */
	it("How to create a CommandProtocol with a class command?", async () => {
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

		assert.equal(console.output()[0][1], true)
		assert.deepStrictEqual(console.output()[1][1], {
			content: ["hello world"],
			error: null,
			meta: { source: "Echo" },
			priority: 0
		})
		assert.deepStrictEqual(console.output()[2][1], CommandMessage.from({
			body: "Echo hello world",
		}))
	})

	/**
	 * @docs
	 */
	it("How to use a plain function as command?", async () => {
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

		assert.equal(console.output()[0][1], true)
		assert.deepStrictEqual(console.output()[1][1], ["HELLO", "PLANET"])
		assert.strictEqual(console.output()[2][1], "fn")
	})

	/**
	 * @docs
	 * ## Object‑style command
	 *
	 * Returning an object allows custom `content`, `priority` and `meta`.
	 */
	it("How to return an object from a command?", async () => {
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

		assert.deepStrictEqual(console.output()[0][1], ["custom", "a", "b"])
		assert.strictEqual(console.output()[1][1], 7)
		assert.deepStrictEqual(console.output()[2][1], { extra: true, source: "ObjCmd" })
	})

	/**
	 * @docs
	 * ## Fallback response
	 *
	 * When the command does not return a recognised shape.
	 */
	it("How does fallback look like?", async () => {
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
		assert.deepStrictEqual(console.output()[0][1], [
			"Command executed.",
			"(no output data)",
		])
		assert.strictEqual(console.output()[1][1], "fn")
	})

	/**
	 * @docs
	 * ## Error handling
	 *
	 * Thrown errors are caught and marked as critical (`priority: 100`).
	 */
	it("How are errors reported?", async () => {
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

		assert.deepStrictEqual(console.output()[0][1], ["boom"])
		assert.strictEqual(console.output()[1][1], 100)
		assert.ok(console.output()[2][1])
		assert.strictEqual(console.output()[3][1], "boom")
	})

	/**
	 * @docs
	 * ## API surface
	 *
	 * Exported symbols must be present.
	 */
	it("All exported classes should be available", () => {
		assert.ok(CommandProtocol)
		assert.ok(ExecutableCommand)
	})

	/**
	 * @docs
	 * ## TypeScript declarations
	 */
	it("Package provides .d.ts files", () => {
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
		 * npm run play
		 * ```
		 */
		assert.ok(typeof pkg.scripts?.play === "string")
		const response = await runSpawn("node", ["-e", "console.log('ok')"])
		assert.strictEqual(response.code, 0)
		assert.ok(response.text.includes("ok"))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check here](./CONTRIBUTING.md)", async () => {
		assert.equal(pkg.scripts?.precommit, "npm test")
		assert.equal(pkg.scripts?.prepush, "npm test")
		assert.equal(pkg.scripts?.prepare, "husky")
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes("# Contributing"))
	})

	/**
	 * @docs
	 * ## License
	 */
	it("How to license ISC? - [check here](./LICENSE)", async () => {
		/** @docs */
		const text = await fs.loadDocument("LICENSE")
		assert.ok(String(text).includes("ISC"))
	})
}

/* -------------------------------------------------------------------------- */

describe("README.md testing", testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const readme = await fs.loadDocument("README.md")
		assert.ok(readme.includes("## License"))
	})
})
