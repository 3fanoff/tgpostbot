import { Injectable, NestMiddleware } from '@nestjs/common';
import { isNumber } from '@nestjs/common/utils/shared.utils';
import { NextFunction } from 'express';
import { BotContext } from '@interface/bot';

@Injectable()
export class TelegrafMiddleware implements NestMiddleware {
    use(ctx: BotContext, next: NextFunction) {
        if (ctx.session && isNumber(ctx.session.ctx_action)) {
            ctx.session.ctx_action++;
        }
        next();
    }
}
