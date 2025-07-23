import { Injectable, Logger } from '@nestjs/common';
import { AxiosService } from 'nestjs-axios-promise';
import { ValidateBotToken } from '@decorator/bot.decorator';

export interface TelegramGetMeResponse {
    ok: boolean;
    result: {
        is_bot: boolean;
        username: string;
    };
}

@Injectable()
export class BotParentService {
    private logger: Logger = new Logger(BotParentService.name);

    constructor(private httpService: AxiosService) {}

    @ValidateBotToken(0)
    async getDataForBot(token: string): Promise<TelegramGetMeResponse> {
        const result = await this.httpService.get<TelegramGetMeResponse>(`https://api.telegram.org/bot${token}/getMe`);
        this.logger.debug(`info for bot ${token} from api.telegram:`, [result.status, result.data]);

        switch (result.status) {
            case 200:
                return result.data;
            default:
                return {} as TelegramGetMeResponse;
        }
    }

    async isUserHasABot() {
        return Promise.resolve(false);
    }

    async addBotToUser(token: string, username: string) {
        return Promise.resolve({ name: 'some_bot_name', username, token });
    }
}
