export default class ExecutableCommand extends Command {
    /**
     * @param {CommandMessage} msg
     * @param {any} context
     * @return {Promise<any>}
     */
    run(msg: CommandMessage, context?: any): Promise<any>;
}
import { Command } from "@nan0web/co";
import { CommandMessage } from "@nan0web/co";
