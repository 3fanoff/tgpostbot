export interface Converter<SOURCE, TARGET> {
    convert(source: SOURCE): TARGET;
    convert(source: SOURCE[]): TARGET[];
}

export interface Populator<SOURCE, TARGET> {
    populate(source: SOURCE, target: TARGET): void;
}
