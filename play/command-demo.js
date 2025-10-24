#!/usr/bin/env node

import Logger from "@nan0web/log"
import { CommandProtocol, ExecutableCommand } from "../src/index.js"
import { CommandMessage } from "@nan0web/co"

/**
 * Simple echo command implemented as an ExecutableCommand.
 */
class EchoCommand extends ExecutableCommand {
	/** Name used by the protocol to match input. */
	name = "echo"

	/** @param {CommandMessage} msg */
	async run(msg) {
		// msg.argv already excludes the command name
		return `ECHO: ${msg.argv.join(" ")}`
	}
}

/**
 * Demonstrates the CommandProtocol with a class‑based command.
 *
 * @param {Logger} console
 */
export async function runCommandDemo(console) {
	console.clear()
	console.success("CommandProtocol Demo")

	const protocol = new CommandProtocol({
		command: new EchoCommand(),
		db: {}, // dummy DB, not used in this demo
		logger: console,
	})

	// Sample input that matches the command name
	const input = { value: "echo hello universe", time: Date.now() }

	console.info("Input:", input.value)
	console.info("Protocol accepts:", protocol.accepts(input))

	const out = await protocol.process(input)

	console.info("Result:\n", JSON.stringify(out, null, 2))
	console.info("History length:", protocol.history.length)

	console.success("\nDemo complete! 🚀")
}
