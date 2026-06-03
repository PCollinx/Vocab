const {
  withDangerousMod,
  withAppBuildGradle,
  withProjectBuildGradle,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withGoogleServices(config) {
  // Add Google Services classpath to android/build.gradle
  config = withProjectBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('com.google.gms:google-services')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n        classpath 'com.google.gms:google-services:4.4.2'`
      );
    }
    return cfg;
  });

  // Apply Google Services plugin in android/app/build.gradle
  config = withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('com.google.gms.google-services')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /apply plugin: "com\.android\.application"/,
        `apply plugin: "com.android.application"\napply plugin: 'com.google.gms.google-services'`
      );
    }
    return cfg;
  });

  // Copy google-services.json from project root to android/app/
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const src = path.resolve(cfg.modRequest.projectRoot, 'google-services.json');
      const dest = path.join(cfg.modRequest.platformProjectRoot, 'app', 'google-services.json');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
      return cfg;
    },
  ]);

  return config;
};
