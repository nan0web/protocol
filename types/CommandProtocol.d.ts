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
    constructor({ command, db, logger }: {
        command: ExecutableCommand | Function;
        db: DB;
        logger?: Logger | undefined;
    });
    command: Function | ExecutableCommand;
    db: DB;
    logger: Logger;
    history: any[];
    /**
     * Перевіряє чи приймає цей протокол ввід
     * @param {InputMessage} input
     * @returns {boolean}
     */
    accepts(input: InputMessage): boolean;
    /**
     * Перетворює InputMessage у CommandMessage, запускає команду, повертає відповідь
     * @param {InputMessage} input
     * @returns {Promise<OutputMessage>}
     */
    process(input: InputMessage): Promise<OutputMessage>;
}
import ExecutableCommand from './ExecutableCommand.js';
import DB from "@nan0web/db";
import Logger from "@nan0web/log";
