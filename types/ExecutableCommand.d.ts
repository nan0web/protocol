/**
 * Base class for executable commands.
 *
 * Sub‑classes must implement {@link ExecutableCommand.run}.
 *
 * @extends Command
 */
export default class ExecutableCommand extends Command {
    /**
     * Execute the command.
     *
     * @param {CommandMessage} msg   Parsed command message; `msg.args` contains the arguments.
     * @param {object} [context={}]  Optional execution context (e.g., `{ db }`).
     *
     * @returns {Promise<any>} The command result.
     *
     * @throws {Error} Always throws – subclasses must override this method.
     */
    run(msg: CommandMessage, context?: object): Promise<any>;
}
import { Command } from "@nan0web/co";
import { CommandMessage } from "@nan0web/co";
