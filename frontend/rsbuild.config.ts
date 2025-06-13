// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
    source: {
        alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@pages': './src/pages',
            '@cusTypes': './src/types',
            '@services': './src/api/services',
            '@contexts': './src/contexts',
        },
    },
    plugins: [pluginReact()],
    tools: {
        rspack: (config, { appendPlugins }) => {
            
        }
    },
    output: {
        distPath: {
            root: 'public',
        },
        cssModules: {
            auto: true,
            localIdentName: '[name]__[local]--[hash:base64:5]',
        }
    }
});
