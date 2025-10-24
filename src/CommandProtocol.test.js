import { describe, it } from "node:test"
import assert from "node:assert"
import CommandProtocol from "./CommandProtocol.js"
import ExecutableCommand from "./ExecutableCommand.js"

/**
 * Dummy logger – only required to satisfy constructor.
 */
const dummyLogger = { info() { } }

describe("CommandProtocol – constructor validation", () => {
	it("throws when missing command", () => {
		assert.throws(
			() => new CommandProtocol({ db: {}, logger: dummyLogger }),
			/Error: CommandProtocol: missing command or db/
		)
	})

	it("throws when missing db", () => {
		assert.throws(
			() => new CommandProtocol({ command: () => { }, logger: dummyLogger }),
			/Error: CommandProtocol: missing command or db/
		)
	})

	it("throws when missing logger", () => {
		assert.throws(
			() => new CommandProtocol({ command: () => { }, db: {} }),
			/Error: CommandProtocol: missing command or db/
		)
	})
})

describe("CommandProtocol – accepts()", () => {
	it("rejects input without value", () => {
		const proto = new CommandProtocol({
			command: { name: "test", run: async () => { } },
			db: {},
			logger: dummyLogger,
		})
		assert.ok(!proto.accepts({}))
	})

	it("rejects when first token does not match command name", () => {
		const proto = new CommandProtocol({
			command: { name: "hello", run: async () => { } },
			db: {},
			logger: dummyLogger,
		})
		const input = { value: "bye world" }
		assert.ok(!proto.accepts(input))
	})

	it("accepts when first token equals command name", () => {
		const proto = new CommandProtocol({
			command: { name: "ping", run: async () => { } },
			db: {},
			logger: dummyLogger,
		})
		const input = { value: "ping arg1 arg2" }
		assert.ok(proto.accepts(input))
	})
})

describe("CommandProtocol – process()", () => {
	it("processes a subclass of ExecutableCommand returning a string", async () => {
		class Ping extends ExecutableCommand {
			async run(msg) {
				// msg.args already without the command name
				return `PONG ${msg.argv.join("-")}`
			}
		}
		const proto = new CommandProtocol({
			command: new Ping(),
			db: {},
			logger: dummyLogger,
		})
		const input = { value: "Ping hello world", time: Date.now() }
		const out = await proto.process(input)

		assert.deepStrictEqual(out.content, ["PONG hello-world"])
		assert.strictEqual(out.meta.source, "Ping")
		assert.strictEqual(out.priority, 0)
		assert.strictEqual(proto.history.length, 1)
		assert.strictEqual(proto.history[0].input, input)
	})

	it("processes a plain function returning an array", async () => {
		function Upper(msg) {
			return msg.argv.map(v => v.toUpperCase())
		}
		const proto = new CommandProtocol({
			command: Upper,
			db: {},
			logger: dummyLogger,
		})
		const input = { value: "Upper one two", time: Date.now() }
		const out = await proto.process(input)

		assert.deepStrictEqual(out.content, ["ONE", "TWO"])
		assert.strictEqual(out.meta.source, "Upper")
	})

	it("processes a command returning an object with content/meta/priority", async () => {
		function ObjectCmd(msg) {
			return {
				content: ["custom", ...msg.argv],
				priority: 7,
				meta: { extra: true },
			}
		}
		const proto = new CommandProtocol({
			command: ObjectCmd,
			db: {},
			logger: dummyLogger,
		})
		const input = { value: "ObjectCmd a b", time: Date.now() }
		const out = await proto.process(input)

		assert.deepStrictEqual(out.content, ["custom", "a", "b"])
		assert.strictEqual(out.priority, 7)
		assert.deepStrictEqual(out.meta, { extra: true, source: "ObjectCmd" })
	})

	it("returns fallback when result lacks content", async () => {
		function NumberCmd() {
			return 12345
		}
		const proto = new CommandProtocol({
			command: NumberCmd,
			db: {},
			logger: dummyLogger,
		})
		const input = { value: "NumberCmd foo", time: Date.now() }
		const out = await proto.process(input)

		assert.deepStrictEqual(out.content, ["Command executed.", "(no output data)"])
		assert.strictEqual(out.meta.source, "NumberCmd")
	})

	it("catches thrown errors and marks as critical", async () => {
		function BoomCmd() {
			throw new Error("boom")
		}
		const proto = new CommandProtocol({
			command: BoomCmd,
			db: {},
			logger: dummyLogger,
		})
		const input = { value: "BoomCmd anything", time: Date.now() }
		const out = await proto.process(input)

		assert.deepStrictEqual(out.content, ["boom"])
		assert.strictEqual(out.priority, 100)
		assert.ok(out.error instanceof Error)
		assert.strictEqual(out.meta.source, "BoomCmd")
	})
})
