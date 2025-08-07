import { Injectable, Scope } from '@nestjs/common';
import { NextFunction } from 'express';
import { BotCallbackContext, BotSession } from '@interface/bot';
import { CallbackQuery } from 'telegraf/src/core/types/typegram';

type BotActionManagerUsersHandlers = Map<string, (...args: any) => any>;
type BotActionManagerUsers = Map<number, BotActionManagerUsersHandlers>;

@Injectable({ scope: Scope.TRANSIENT })
export class BotActionManager {
    private handlers: BotActionManagerUsers;

    constructor() {
        this.handlers = new Map();
    }

    bindHandler(userId: number, actionName: string, fn: (...args: any) => any) {
        if (!this.handlers.has(userId)) {
            this.handlers.set(userId, new Map());
        }
        this.handlers.get(userId)?.set(actionName, fn);
    }

    unbindHandler(userId: number, actionName: string): boolean {
        if (this.handlers.has(userId)) {
            return this.handlers.get(userId)?.delete(actionName) || false;
        }
        return false;
    }

    unbindHandlers(userId: number): boolean {
        if (this.handlers.has(userId)) {
            return this.handlers.delete(userId);
        }
        return false;
    }

    middleware() {
        return (ctx: BotCallbackContext<BotSession, CallbackQuery.DataQuery>, next: NextFunction) => {
            if (ctx.callbackQuery?.data && ctx.from.id) {
                const actionName: string = ctx.callbackQuery.data;
                const handler = this.handlers.get(ctx.from.id)?.get(actionName);

                if (handler) {
                    handler(ctx);
                }
            }
            return next();
        };
    }
}
