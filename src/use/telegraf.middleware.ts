import { Injectable, NestMiddleware } from '@nestjs/common';
import { isNumber } from '@nestjs/common/utils/shared.utils';
import { Context, Session, UpdateContext } from 'telegraf';
import { NextFunction } from 'express';

@Injectable()
export class TelegrafMiddleware implements NestMiddleware {
    use(ctx: Context<UpdateContext, Session>, next: NextFunction) {
        if (ctx.session && isNumber(ctx.session.ctx_action)) {
            ctx.session.ctx_action++;
        }
        next();
    }
}
