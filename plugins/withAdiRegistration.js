const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withAdiRegistration(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      const sourceFile = path.join(
        projectRoot,
        "google-play",
        "adi-registration.properties",
      );

      const targetDir = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "assets",
      );

      const targetFile = path.join(targetDir, "adi-registration.properties");

      fs.mkdirSync(targetDir, { recursive: true });
      fs.copyFileSync(sourceFile, targetFile);

      return config;
    },
  ]);
};
