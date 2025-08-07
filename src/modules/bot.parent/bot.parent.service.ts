import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InvalidArgumentException, ValidateBotToken } from '@decorator/bot.decorator';
import { I18nService } from 'nestjs-i18n';
import { BotUserEntity } from '@model/bot.user.entity';
import { BotEntity } from '@model/bot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { BotDto } from '@dto/bot.dto';
import { DriverError, TelegramGetMe } from '@interface/bot';
import { BotGetMeConverter } from '@converter/bot.get.me.converter';
import { I18nPath } from '@/gensrc/i18n.types';

@Injectable()
export class BotParentService {
    private logger: Logger = new Logger(BotParentService.name);

    constructor(
        private httpService: HttpService,

        private i18n: I18nService,

        @InjectRepository(BotUserEntity)
        private userRepository: Repository<BotUserEntity>,

        @InjectRepository(BotEntity)
        private botRepository: Repository<BotEntity>,

        private botGetMeConverter: BotGetMeConverter,
    ) {}

    @ValidateBotToken(0)
    async getDataForBot(token: string): Promise<BotDto> {
        const response = await this.httpService.axiosRef.get<TelegramGetMe>(`https://api.telegram.org/bot${token}/getMe`);
        const substrToken = token.substring(0, 25);
        this.logger.verbose(`info for bot ${substrToken}... from api.telegram:`, [response.status, response.data]);

        if (!response.data.ok) {
            throw new UnauthorizedException(`invalid token ${substrToken}`);
        }

        const botDTO: BotDto = this.botGetMeConverter.convert(response.data);
        if (botDTO.isBot) {
            botDTO.token = token;
        }
        return botDTO;
    }

    public getLanguages() {
        return this.i18n.getSupportedLanguages();
    }

    async hasUser(userId: number) {
        return await this.userRepository.exists({ where: { id: userId } });
    }

    async createUser(id: number, name?: string): Promise<BotUserEntity> {
        const findUserById = await this.userRepository.findOneBy({ id });
        if (!findUserById) {
            const newUserEntity = this.userRepository.create({ id, name });
            return await this.userRepository.save(newUserEntity);
        }
        return findUserById;
    }

    async createBot(botDTO: BotDto): Promise<BotEntity> {
        const newBotEntity = this.botRepository.create(botDTO);
        return await this.botRepository.save(newBotEntity);
    }

    async addNewBotToUser(bot: BotEntity, user: BotUserEntity) {
        bot.user = user;
        await this.botRepository.save(bot);
    }

    async addNewBotToUserByUserId(bot: BotEntity, userId: number) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (user) {
            return this.addNewBotToUser(bot, user);
        } else {
            throw new NotFoundException(`user with id ${userId} not found`);
        }
    }

    async getListOfBotsByUserId(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: { bots: true } });
        if (user && user.bots.length) {
            return user.bots;
        }
        return [];
    }

    catchAddNewBotReply(e: QueryFailedError<DriverError> | InvalidArgumentException | UnauthorizedException) {
        let messageKey: I18nPath;
        if (e instanceof InvalidArgumentException) {
            this.logger.error(e.what());
            messageKey = 'bot.parent.add.is_not_token';
        } else if (e instanceof UnauthorizedException) {
            messageKey = 'bot.parent.add.exception';
        } else {
            if (e instanceof QueryFailedError) {
                switch (parseInt(e.driverError.code)) {
                    case 23505:
                        messageKey = `bot.parent.add.error.orm.${e.driverError.table}` as I18nPath;
                        break;
                    default:
                        messageKey = 'bot.parent.add.error.orm.default';
                        break;
                }
            } else {
                messageKey = 'bot.parent.add.error.orm.default';
            }
            this.logger.error(e.name, e.message);
        }
        return messageKey;
    }
}
