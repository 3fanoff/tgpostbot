import { Converter, Populator, PopulatorMap, SourceMap } from '@interface/converter';
import { Provider } from '@nestjs/common';
import { VoidToNull } from '@decorator/bot.decorator';

export abstract class AbstractBaseConverter<SOURCE, TARGET> implements Converter<SOURCE, TARGET> {
    protected constructor(protected readonly populators: PopulatorMap<SOURCE, TARGET>) {}

    public static providers: Provider[] = [];

    convert(source: SOURCE): TARGET;
    convert(source: SOURCE[]): TARGET[];
    convert(source: SOURCE | SOURCE[]): TARGET | TARGET[] {
        if (Array.isArray(source)) {
            return source.map((item) => this.convertSource(item));
        }
        return this.convertSource(source);
    }

    convertUnion(source: SourceMap<SOURCE>): TARGET;
    convertUnion(source: SourceMap<SOURCE>[]): TARGET[];
    convertUnion(source: SourceMap<SOURCE> | SourceMap<SOURCE>[]): TARGET | TARGET[] {
        if (Array.isArray(source)) {
            return source.map((item: SourceMap<SOURCE>) => this.convertUnionSource(item));
        }
        return this.convertUnionSource(source);
    }

    protected populate(source: SOURCE, target: TARGET) {
        Object.values(this.populators).forEach((populator: Populator<SOURCE, TARGET>) => populator.populate(source, target));
    }

    @VoidToNull()
    protected convertSource(source: SOURCE): TARGET {
        const target = this.targetInstance();
        this.populate(source, target);
        return target;
    }

    @VoidToNull()
    protected convertUnionSource(source: SourceMap<SOURCE>): TARGET {
        const target = this.targetInstance();
        for (const [key, sourceItem] of Object.entries(source)) {
            const populator = this.populators[key] as Populator<SOURCE, TARGET>;
            populator.populate(sourceItem as SOURCE, target);
        }
        return target;
    }

    protected abstract targetInstance(): TARGET;
}
