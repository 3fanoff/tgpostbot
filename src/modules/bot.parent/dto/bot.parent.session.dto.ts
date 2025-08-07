import { BotParent } from '@interface/bot';

export class BotParentSessionDTO implements BotParent.BotData {
    isNewUser: boolean;
    userHasBot: boolean;
    allowAction: Set<number> = new Set<number>();
    messages: Array<{
        id: number;
        type: BotParent.MessageType;
        bot: boolean;
    }>;
}
