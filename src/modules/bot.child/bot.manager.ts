import { Telegraf } from 'telegraf';
import { Injectable, Logger } from '@nestjs/common';
import { BotBaseSession, BotContext } from '@interface/bot';

interface IBotContainer {
    instance: Telegraf<BotContext<BotBaseSession>>;
    isLaunched: boolean;
}

@Injectable()
export class BotManager {
    private logger: Logger = new Logger(BotManager.name);
    private bots = new Map<number, IBotContainer>();

    public getBot(id: number) {
        if (!this.bots.has(id)) return null;
        return this.bots.get(id);
    }

    public getBotInstance(id: number) {
        const bot = this.getBot(id);
        if (bot) {
            return bot.instance;
        }
        return null;
    }

    public setBot(id: number, instance: Telegraf<BotContext<BotBaseSession>>) {
        this.bots.set(id, { instance, isLaunched: false });
    }

    public launch(id: number, options: Telegraf.LaunchOptions = {}) {
        const bot = this.getBotInstance(id);
        return new Promise((resolve: (bot: Telegraf<BotContext<BotBaseSession>> | null) => void, reject) => {
            if (bot) {
                bot.launch(options, () => resolve(bot)).catch((e) => {
                    this.logger.error(`error on launch bot with id=${id}`, JSON.stringify(e));
                    reject(e as Error);
                });
                return;
            }
            resolve(null);
        });
    }

    public stop(id: number) {
        const bot = this.getBotInstance(id);
        if (bot) {
            bot.stop();
        }
    }

    public remove(id: number) {
        return this.bots.delete(id);
    }

    public doLaunchStatus(id: number, status: boolean = true) {
        const bot = this.getBot(id);
        if (bot) bot.isLaunched = status;
    }

    public getContainers() {
        return this.bots.values();
    }
}
