import { Command, CommandMessage } from "@nan0web/co"

export default class ExecutableCommand extends Command {
	/**
	 * @param {CommandMessage} msg
	 * @param {any} context
	 * @return {Promise<any>}
	 */
	async run(msg, context = {}) {
		throw new Error("Method .run() must be overwritten")
	}
}
