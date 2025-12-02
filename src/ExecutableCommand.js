import { Message } from "@nan0web/co"

/**
 * Base class for executable commands.
 *
 * Sub‑classes must implement {@link ExecutableCommand.run}.
 */
export default class ExecutableCommand {
	/** @type {string} */
	name = ""
	constructor(input = {}) {
		const {
			name = this.name
		} = input
		this.name = String(name)
	}
	/**
	 * Execute the command.
	 *
	 * @param {Message} msg   Parsed command message; `msg.args` contains the arguments.
	 * @param {object} [context={}]  Optional execution context (e.g., `{ db }`).
	 *
	 * @returns {Promise<any>} The command result.
	 *
	 * @throws {Error} Always throws – subclasses must override this method.
	 */
	async run(msg, context = {}) {
		throw new Error("Method .run() must be overwritten")
	}
}
