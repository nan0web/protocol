/**
 * Base class for executable commands.
 *
 * Sub‑classes must implement {@link ExecutableCommand.run}.
 */
export default class ExecutableCommand {
    constructor(input?: {});
    /** @type {string} */
    name: string;
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
    run(msg: Message, context?: object): Promise<any>;
}
import { Message } from "@nan0web/co";
