/** @typedef {import("@nan0web/log").Logger} Logger */
/** @typedef {import("@nan0web/interface").InputMessage} InputMessage */
/** @typedef {import("@nan0web/interface").OutputMessage} OutputMessage */
/**
 * Command protocol.
 *
 * Accepts an {@link InputMessage}, validates the command name,
 * runs the configured command (class or function) and returns
 * an {@link OutputMessage}.
 */
export default class CommandProtocol {
    /**
     * Create a new protocol instance.
     *
     * @param {object} params
     * @param {ExecutableCommand | Function} params.command   Command implementation (class instance or function).
     * @param {DB} params.db                             Database accessor.
     * @param {Logger} [params.logger]                  Logger (optional – defaults to a new {@link Logger} instance).
     *
     * @throws {Error} If any of the required parameters are missing.
     */
    constructor({ command, db, logger }: {
        command: ExecutableCommand | Function;
        db: DB;
        logger?: import("@nan0web/log").default | undefined;
    });
    /** @type {ExecutableCommand | Function} */
    command: ExecutableCommand | Function;
    /** @type {DB} */
    db: DB;
    /** @type {Logger} */
    logger: Logger;
    /** @type {Array<{ input: InputMessage, message: Message, time: number }>} */
    history: Array<{
        input: InputMessage;
        message: Message;
        time: number;
    }>;
    /**
     * Check whether the protocol can handle the supplied input.
     *
     * @param {InputMessage} input
     * @returns {boolean} `true` if the first token of `input.value` matches the command name.
     */
    accepts(input: InputMessage): boolean;
    /**
     * Process the incoming {@link InputMessage}.
     *
     * Steps:
     * 1. Parse the raw text into a {@link Message}.
     * 2. Record the operation in the history.
     * 3. Execute the command (class instance or plain function).
     * 4. Normalise the result into an {@link OutputMessage}.
     *
     * @param {InputMessage} input
     * @returns {Promise<OutputMessage>}
     */
    process(input: InputMessage): Promise<OutputMessage>;
}
export type Logger = import("@nan0web/log").Logger;
export type InputMessage = import("@nan0web/interface").InputMessage;
export type OutputMessage = import("@nan0web/interface").OutputMessage;
import ExecutableCommand from './ExecutableCommand.js';
import DB from "@nan0web/db";
import { Message } from "@nan0web/co";
