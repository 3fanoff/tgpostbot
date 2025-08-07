import { Converter, Populator } from '@interface/converter';
import { Provider } from '@nestjs/common';

export abstract class AbstractBaseConverter<SOURCE, TARGET> implements Converter<SOURCE, TARGET> {
    constructor(protected readonly populators: Populator<SOURCE, TARGET>[]) {}

    public static providers: Provider[] = [];

    convert(source: SOURCE): TARGET;
    convert(source: SOURCE[]): TARGET[];
    convert(source: SOURCE | SOURCE[]): TARGET | TARGET[] {
        if (Array.isArray(source)) {
            return source.map((item) => this.convertSource(item));
        }
        return this.convertSource(source);
    }

    protected populate(source: SOURCE, target: TARGET) {
        this.populators.forEach((populator) => populator.populate(source, target));
    }

    protected convertSource(source: SOURCE): TARGET {
        const target = this.targetInstance();
        this.populate(source, target);
        return target;
    }

    protected abstract targetInstance(): TARGET;
}
