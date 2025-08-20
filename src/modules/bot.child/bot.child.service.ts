import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotEntity } from '@model/bot.entity';
import { BotManager } from './bot.manager';
import { BotBaseSession, BotContext } from '@interface/bot';

@Injectable()
export class BotChildService {
    private logger: Logger = new Logger(BotChildService.name);

    constructor(
        @InjectRepository(BotEntity)
        private botRepository: Repository<BotEntity>,
        private botManager: BotManager,
    ) {}

    public createBot(token: string, id: number, options?: Telegraf.Options<BotContext<BotBaseSession>>) {
        const botInstance = new Telegraf<BotContext<BotBaseSession>>(token, options);
        this.botManager.setBot(id, botInstance);
    }

    public async launchBot(id: number) {
        /*if (!this.bots.has(id)) {
            throw new Error(`bot with id=${id} wasn't pre-created`);
        }*/
        const bot = await this.botManager.launch(id);
        this.botManager.doLaunchStatus(id);
        return bot;
    }

    public stopBot(id: number) {
        try {
            this.botManager.stop(id);
            this.botManager.doLaunchStatus(id, false);
        } catch (e) {
            this.logger.error(e);
        }
    }

    public async deactivateBot(id: number) {
        this.stopBot(id);
        this.botManager.remove(id);
        const botEntity = await this.findBotEntityById(id);
        if (botEntity) {
            botEntity.isActive = false;
            await this.botRepository.save(botEntity);
        }
    }

    public async removeBot(id: number) {
        this.stopBot(id);
        this.botManager.remove(id);
        const botEntity = await this.findBotEntityById(id);
        if (botEntity) {
            await this.botRepository.remove(botEntity);
        }
    }

    public async findBotEntityById(id: number) {
        return await this.botRepository.findOneBy({ id });
    }

    public async findChannelsByBotId(id: number) {
        const botEntity = await this.botRepository.findOne({ where: { id }, relations: { channels: true } });
        if (!botEntity) {
            throw new NotFoundException(`bot with id=${id} not found`);
        }
        return botEntity.channels;
    }

    public async createBotById(id: number) {
        const botEntity = await this.findBotEntityById(id);
        if (!botEntity) {
            throw new NotFoundException(`bot with id=${id} not found`);
        }

        this.createBot(botEntity.token, Number(botEntity.id));
    }

    public reLaunchBots(options: Telegraf.LaunchOptions = {}) {
        for (const container of this.botManager.getContainers()) {
            if (container.isLaunched) {
                container.instance.launch(options).catch((e) => this.logger.error(e));
            }
        }
    }

    public async launchActiveBotsFromDB() {
        const activeBots = await this.botRepository.find({ where: { isActive: true } });
        return Promise.allSettled(
            activeBots.map((bot) => {
                this.createBot(bot.token, bot.id);
                return this.launchBot(bot.id);
            }),
        );
    }

    public getBot(id: number) {
        return this.botManager.getBotInstance(id);
    }
}
