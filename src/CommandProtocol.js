import { CommandMessage } from '@nan0web/co'
import DB from "@nan0web/db"
import ExecutableCommand from './ExecutableCommand.js'

/** @typedef {import("@nan0web/log").Logger} Logger */
/** @typedef {import("@nan0web/interface").InputMessage} InputMessage */
/** @typedef {import("@nan0web/interface").OutputMessage} OutputMessage */

/**
 * Command protocol.
 *
 * Accepts an {@link InputMessage}, validates the command name,
 * runs the configured command (class or plain function) and returns
 * an {@link OutputMessage}.
 */
export default class CommandProtocol {
	/**
	 * Create a new protocol instance.
	 *
	 * @param {object} params
	 * @param {ExecutableCommand|Function} params.command   Command implementation (class instance or function).
	 * @param {DB} params.db                             Database accessor.
	 * @param {Logger} [params.logger]                   Logger (optional – defaults to a new {@link Logger} instance).
	 *
	 * @throws {Error} If any of the required parameters are missing.
	 */
	constructor({ command, db, logger }) {
		if (!command || !db || !logger) {
			throw new Error('CommandProtocol: missing command or db')
		}
		this.command = command
		this.db = db
		this.logger = logger
		this.history = []
	}

	/**
	 * Check whether the protocol can handle the supplied input.
	 *
	 * @param {InputMessage} input
	 * @returns {boolean} `true` if the first token of `input.value` matches the command name.
	 */
	accepts(input) {
		if (!input.value) return false
		const parts = input.value.trim().split(/\s+/)
		return parts[0] === (this.command.name || this.command.constructor.name)
	}

	/**
	 * Process the incoming {@link InputMessage}.
	 *
	 * Steps:
	 * 1. Parse the raw text into a {@link CommandMessage}.
	 * 2. Record the operation in the history.
	 * 3. Execute the command (class instance or plain function).
	 * 4. Normalise the result into an {@link OutputMessage}.
	 *
	 * @param {InputMessage} input
	 * @returns {Promise<OutputMessage>}
	 */
	async process(input) {
		try {
			// 1. Tokenise the raw input.
			const argv = String(input.value || '').trim().split(/\s+/)

			/** @type {CommandMessage} */
			const rawMessage = CommandMessage.parse(argv)

			// Build a lightweight message where `args` are the arguments **without** the command name.
			const cmdMessage = CommandMessage.from({
				...rawMessage,
				args: rawMessage.argv // rawMessage.argv already excludes the command name
			})

			// 2. Store the operation in the history.
			this.history.push({
				input,
				message: cmdMessage,
				time: Date.now()
			})

			// 3. Run the command.
			let result
			if (this.command instanceof ExecutableCommand) {
				result = await this.command.run(cmdMessage, { db: this.db })
			} else {
				/** @type {Function} */
				const fn = this.command
				result = await fn(cmdMessage, { db: this.db })
			}

			const sourceName =
				this.command.name ||
				this.command.constructor.name ||
				(typeof this.command === 'function' && this.command.name) ||
				'unknown'

			// 4. Normalise the result.
			if (typeof result === 'string') {
				return {
					content: [result.trim()],
					priority: 0,
					meta: { source: sourceName },
					error: null
				}
			}

			if (Array.isArray(result)) {
				return {
					content: result,
					priority: 0,
					meta: { source: sourceName },
					error: null
				}
			}

			if (result && result.content) {
				return {
					content: result.content,
					priority: result.priority || 0,
					meta: { ...(result.meta || {}), source: sourceName },
					error: result.error || null
				}
			}

			// Fallback when the command does not return a recognised shape.
			return {
				content: ['Command executed.', '(no output data)'],
				priority: 0,
				meta: { source: sourceName },
				error: null
			}
		} catch (/** @type {any} */ error) {
			const sourceName =
				this.command.name ||
				this.command.constructor.name ||
				(typeof this.command === 'function' && this.command.name) ||
				'unknown'
			return {
				content: [error.message],
				priority: 100, // critical
				meta: { source: sourceName },
				error
			}
		}
	}
}
