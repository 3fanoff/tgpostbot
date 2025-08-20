export class InvalidArgumentException extends Error {
    private readonly msg: string;
    constructor(method: string, argument: number, value: any) {
        const message = `Invalid value ${value} of argument #${argument} in method ${method}`;
        super(message);
        this.msg = message;
    }
    what() {
        return this.msg;
    }
}

type VoidFunction = () => void;

function voidToNull(obj: object) {
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) break;
        if (obj[key] === undefined) {
            obj[key] = null;
        }
    }
    return obj;
}

export function ValidateBotToken(parameterIndex: number) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const method: VoidFunction = descriptor.value as VoidFunction;
        const BOT_REG_EXP = new RegExp('^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$');

        descriptor.value = function (...args: string[]): void {
            if (!BOT_REG_EXP.test(args[parameterIndex])) {
                throw new InvalidArgumentException(key, parameterIndex, args[parameterIndex]);
            }
            return method.apply(this, args) as void;
        };

        return descriptor;
    };
}

export function VoidToNull(): MethodDecorator {
    return (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        if (!descriptor.value) return;
        const method = descriptor.value as VoidFunction;
        if (descriptor.value) {
            descriptor.value = function (...args: any[]) {
                return voidToNull(method.apply(this, args) as object);
            };
        }
        return descriptor;
    };
}
