/**
 * Metro configuration for the QuickVerify playground.
 *
 * The playground consumes the SDK via `file:..`, which means npm creates a
 * symlink that points outside of the project root. Metro refuses to follow
 * those symlinks unless we explicitly watch and resolve them. The custom
 * resolver below pins `@quickverify/react-native-sdk` to the compiled entry
 * inside the SDK root and falls back to Metro's default resolver for every
 * other module.
 */

const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { resolve: metroResolve } = require('metro-resolver');

const sdkRoot = path.resolve(__dirname, '..');
const sdkEntryPoint = path.join(sdkRoot, 'lib', 'index.js');
  const playgroundRnEntry = path.join(__dirname, 'node_modules', 'react-native', 'index.js');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

  return {
    ...defaultConfig,
    watchFolders: Array.from(
      new Set([...(defaultConfig.watchFolders || []), sdkRoot]),
    ),
    resolver: {
      ...defaultConfig.resolver,
      resolveRequest(context, moduleName, platform) {
        // Pin the SDK import to the compiled lib/ entry
        if (moduleName === '@quickverify/react-native-sdk') {
          return {
            type: 'sourceFile',
            filePath: sdkEntryPoint,
          };
        }

        // Ensure Metro resolves `react-native` to the playground's react-native
        // so the bundler uses the RN version declared by the playground (avoids
        // picking up a conflicting root-level React Native installation).
        if (moduleName === 'react-native') {
          return {
            type: 'sourceFile',
            filePath: playgroundRnEntry,
          };
        }

        return metroResolve(context, moduleName, platform);
      },
    },
  };
})();
