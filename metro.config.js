const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

// Force @firebase/auth to always use the React Native build so getAuth
// uses AsyncStorage persistence on Android as well as iOS.
const rnAuthBuild = path.resolve(
  __dirname,
  'node_modules/@firebase/auth/dist/rn/index.js'
);
const upstream = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@firebase/auth') {
    return { filePath: rnAuthBuild, type: 'sourceFile' };
  }
  return upstream
    ? upstream(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
