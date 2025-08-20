import { ValueTransformer } from 'typeorm';

export class BigintNumberTransformer implements ValueTransformer {
    from(value: bigint) {
        return Number(value);
    }

    to(value: number) {
        return BigInt(value);
    }
}
