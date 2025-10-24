#!/usr/bin/env node

import process from "node:process"

import Logger from "@nan0web/log"
import { select } from "@nan0web/ui-cli"

import { runCommandDemo } from "./command-demo.js"

const console = new Logger({ level: "info" })

console.clear()
console.info(Logger.style(Logger.LOGO, { color: "magenta" }))

async function chooseDemo() {
	const demos = [
		{ name: "Command Protocol Demo", value: "command" },
		{ name: "← Exit", value: "exit" }
	]

	const choice = await select({
		title: "Select demo to run:",
		prompt: "[me]: ",
		invalidPrompt: Logger.style("[me invalid]", { color: "red" }) + ": ",
		options: demos.map(d => d.name),
		console
	})

	return demos[choice.index].value
}

async function main() {
	while (true) {
		const demo = await chooseDemo()
		if (demo === "exit") process.exit(0)

		if (demo === "command") {
			await runCommandDemo(console)
		}
	}
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})