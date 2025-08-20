import { POPULATOR as populatorKey } from '@lib/bot.const';

export interface Converter<SOURCE, TARGET> {
    convert(source: SOURCE): TARGET;
    convert(source: SOURCE[]): TARGET[];
    convertUnion(source: SourceMap<SOURCE>): TARGET;
    convertUnion(source: SourceMap<SOURCE>[]): TARGET[];
}

export interface Populator<SOURCE, TARGET> {
    populate(source: SOURCE, target: TARGET): void;
}

export interface SourceMap<SOURCE> {
    [key: populatorKey]: SOURCE;
}

export interface PopulatorMap<SOURCE, TARGET> {
    [key: populatorKey]: Populator<SOURCE, TARGET>;
}
