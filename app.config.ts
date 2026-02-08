import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Track Analyzer Pro",
  slug: "track-analyzer",   // leave matching the original slug used by the project

  ios: {
    bundleIdentifier: "com.cfreeman4798.trackanalyzerpro"
  },

  extra: {
    eas: {
      projectId: "053aacf8-9bb9-41d9-af12-a10076022eba"
    }
  }
};

export default config;
