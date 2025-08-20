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
import { CredentialEntity } from '@model/credential.entity';
import { UpdateCredentialDto } from '@dto/credential.dto';
import { USER_ROLE } from '@lib/bot.const';

enum DataFillingCode {
    OWNER_OVERRIDE,
    USER_ALREADY_EXISTS,
}
export class DataFillingException extends Error {
    code: DataFillingCode;

    constructor(code: DataFillingCode, message?: string) {
        super(message);
        this.code = code;
    }
}

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
        const newUserEntity = this.userRepository.create({ id, name });
        return await this.userRepository.save(newUserEntity);
    }

    async createBot(botDTO: BotDto): Promise<BotEntity> {
        const newBotEntity = this.botRepository.create(botDTO);
        return await this.botRepository.save(newBotEntity);
    }

    async addBotOwner(bot: BotEntity, owner: BotUserEntity) {
        console.log('before add bot owner');
        bot.owner = owner;
        await this.botRepository.save(bot);
        console.log('after add bot owner');
    }

    async addBotUser(bot: BotEntity, user: BotUserEntity, role: USER_ROLE) {
        if (bot.users.some((cred) => cred.user.pk === user.pk)) {
            throw new DataFillingException(DataFillingCode.USER_ALREADY_EXISTS, `user with id ${user.id} already added to this bot`);
        }
        const credential = new CredentialEntity();
        credential.role = role;
        credential.user = user;
        //await credential.save();
        bot.users.push(credential);
        await this.botRepository.save(bot);
    }

    async changeBotUserCredentials(bot: BotEntity, user: BotUserEntity, credentialsDTO: UpdateCredentialDto) {
        const credential = bot.users.find((cred) => cred.user.pk === user.pk);
        if (credential) {
            Object.assign(credential, credentialsDTO);
            await credential.save();
        } else {
            throw new NotFoundException(`user with id ${user.id} not found in this bot`);
        }
    }

    async removeUserFromBot(bot: BotEntity, user: BotUserEntity) {
        bot.users = bot.users.filter((cred) => cred.user.pk !== user.pk);
        await this.botRepository.save(bot);
    }

    async addBotOwnerByUserId(bot: BotEntity, userId: number) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (user) {
            return this.addBotOwner(bot, user);
        } else {
            throw new NotFoundException(`user with id ${userId} not found`);
        }
    }

    async getListOfOwnBotsByUserId(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: { own: true } });
        if (user && user.own.length) {
            return user.own;
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
