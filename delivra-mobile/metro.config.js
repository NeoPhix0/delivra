const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// SVG transformer configuration
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Résolution des path aliases pour le babel-plugin-module-resolver
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const aliasMap = {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@context': path.resolve(__dirname, 'src/context'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@constants': path.resolve(__dirname, 'src/constants'),
    '@i18n': path.resolve(__dirname, 'src/i18n'),
    '@utils': path.resolve(__dirname, 'src/utils'),
  };

  for (const [alias, target] of Object.entries(aliasMap)) {
    if (moduleName.startsWith(alias + '/') || moduleName === alias) {
      const resolvedPath = moduleName.replace(alias, target);
      return context.resolveRequest(context, resolvedPath, platform);
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

// Ajouter watchFolders pour que Metro puisse voir le package delivra-shared
if (require('fs').existsSync(path.resolve(__dirname, '../delivra-shared'))) {
  config.watchFolders = [
    path.resolve(__dirname, '../delivra-shared'),
  ];

  config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, './node_modules'),
    path.resolve(__dirname, '../delivra-shared/node_modules'),
  ];
}

module.exports = config;