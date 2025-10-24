import { describe, it } from "node:test"
import assert from "node:assert"
import ExecutableCommand from "./ExecutableCommand.js"

describe("ExecutableCommand – base class", () => {
	it("must be subclassed – default run throws", async () => {
		const base = new ExecutableCommand()
		await assert.rejects(
			() => base.run(),
			/Error: Method .run\(\) must be overwritten/
		)
	})

	it("allows subclass to override run", async () => {
		class Echo extends ExecutableCommand {
			async run (msg) {
				return msg.args.join("|")
			}
		}
		const cmd = new Echo()
		const mockMsg = { args: ["one", "two"] }
		const res = await cmd.run(mockMsg, {})
		assert.strictEqual(res, "one|two")
	})
})
