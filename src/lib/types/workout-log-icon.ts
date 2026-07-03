import type { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

export type WorkoutLogIcon =
  | { library: "MaterialIcons"; name: keyof typeof MaterialIcons.glyphMap }
  | {
      library: "MaterialCommunityIcons";
      name: keyof typeof MaterialCommunityIcons.glyphMap;
    };
