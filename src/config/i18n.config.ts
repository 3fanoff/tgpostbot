import { join } from 'node:path';
import { AcceptLanguageResolver, I18nOptions, I18nYamlLoader } from 'nestjs-i18n';

export default (): I18nOptions => {
    return {
        fallbackLanguage: 'en',
        loaderOptions: {
            path: join(__dirname, '../locales/'),
            watch: true,
            includeSubfolders: true,
            filePattern: '*.yaml',
        },
        loader: I18nYamlLoader,
        resolvers: [AcceptLanguageResolver],
        typesOutputPath: join(__dirname, '../../src/gensrc/i18n.types.ts'),
    };
};
