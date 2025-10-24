import { CommandMessage } from '@nan0web/co'
import DB from "@nan0web/db"
import Logger from "@nan0web/log"
import ExecutableCommand from './ExecutableCommand.js'

/**
 * Протокол команди: приймає InputMessage → виконує команду → повертає OutputMessage
 */
export default class CommandProtocol {
	/**
	 * @param {object} input
	 * @param {ExecutableCommand | Function} input.command - Команда для виконання або функція
	 * @param {DB} input.db - Доступ до бази
	 * @param {Logger} [input.logger] - Логування
	 */
	constructor({ command, db, logger }) {
		if (!command || !db || !logger) {
			throw new Error('CommandProtocol: missing command, db, or logger')
		}
		this.command = command
		this.db = db
		this.logger = logger || new Logger()
		this.history = []
	}

	/**
	 * Перевіряє чи приймає цей протокол ввід
	 * @param {InputMessage} input
	 * @returns {boolean}
	 */
	accepts(input) {
		if (!input.value) return false
		const parts = input.value.trim().split(/\s+/)
		return parts[0] === this.command.name
	}

	/**
	 * Перетворює InputMessage у CommandMessage, запускає команду, повертає відповідь
	 * @param {InputMessage} input
	 * @returns {Promise<OutputMessage>}
	 */
	async process(input) {
		try {
			const argv = input.value.trim().split(/\s+/)
			const message = CommandMessage.parse(argv)

			// Додаємо в історію
			this.history.push({
				input,
				message,
				time: Date.now()
			})

			// Виконуємо
			let result
			if (this.command instanceof ExecutableCommand) {
				result = await this.command.run(message, { db: this.db })
			}
			else {
				result = await this.command(message, { db: this.db })
			}

			// Інспектуємо як результат
			if (typeof result === 'string') {
				return {
					content: [result],
					priority: 0,
					meta: { source: this.command.name },
					error: null
				}
			}

			if (Array.isArray(result)) {
				return {
					content: result,
					priority: 0,
					meta: { source: this.command.name },
					error: null
				}
			}

			// Якщо result має content
			if (result && result.content) {
				return {
					content: result.content,
					priority: result.priority || 0,
					meta: result.meta || {},
					error: result.error || null
				}
			}

			// fallback
			return {
				content: ['Команда виконана.', '(немає даних для виводу)'],
				priority: 0,
				meta: { source: this.command.name },
				error: null
			}
		} catch (/** @type {any} */ error) {
			return {
				content: [error.message],
				priority: 100, // CRITICAL
				meta: { source: this.command.name },
				error
			}
		}
	}
}
