export enum availableActions {
    HELP,
    ADD_TOKEN,
    ALLOW_TOKEN,
    ALL,
    NONE,
    UNDO,
}

export enum actionTypes {
    HEARS_ADDING_BOT,
    ADDING_BOT,
    ALLOW_ACCEPT_TOKEN,
    SHOW_HELP,
    UNDO_ADDING_BOT,
}

export enum availableCommands {
    START = 'start',
    NEWBOT = 'newbot',
    HELP = 'help',
    LANG = 'lang',
    LIST = 'list',
}

export const defaultMenuCommands = [availableCommands.NEWBOT, availableCommands.LANG, availableCommands.HELP];

export const SYMBOLS_FOR_ESCAPE = new RegExp('([_\\[\\]\\(\\)~`>#\\+-=\\|\\{\\}\\.])', 'g');
