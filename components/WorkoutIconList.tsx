import { colors } from "@/lib/colors";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

export type Icon =
  | { library: "MaterialIcons"; name: keyof typeof MaterialIcons.glyphMap }
  | {
      library: "MaterialCommunityIcons";
      name: keyof typeof MaterialCommunityIcons.glyphMap;
    };

const icons: Icon[] = [
  { library: "MaterialCommunityIcons", name: "run" },
  { library: "MaterialCommunityIcons", name: "dumbbell" },
  { library: "MaterialCommunityIcons", name: "weight-lifter" },
  { library: "MaterialCommunityIcons", name: "arm-flex" },
  { library: "MaterialCommunityIcons", name: "bike" },
  { library: "MaterialCommunityIcons", name: "swim" },
  { library: "MaterialCommunityIcons", name: "gymnastics" },
  { library: "MaterialCommunityIcons", name: "football" },
  { library: "MaterialCommunityIcons", name: "soccer" },
  { library: "MaterialCommunityIcons", name: "basketball" },
  { library: "MaterialCommunityIcons", name: "tennis" },
  { library: "MaterialCommunityIcons", name: "table-tennis" },
  { library: "MaterialCommunityIcons", name: "golf" },
  { library: "MaterialCommunityIcons", name: "bowling" },
  { library: "MaterialCommunityIcons", name: "ski" },
  { library: "MaterialCommunityIcons", name: "snowboard" },
  { library: "MaterialIcons", name: "ice-skating" },
  { library: "MaterialCommunityIcons", name: "bow-arrow" },
];

export const iconLibraries = {
  MaterialIcons,
  MaterialCommunityIcons,
};

type Props = {
  iconSize?: number;
  buttonWidth?: number;
  defaultSelected: Icon;
  onSelect: (icon: Icon) => void;
};

export default function WorkoutIconList({
  iconSize = 48,
  buttonWidth = 64,
  defaultSelected,
  onSelect,
}: Props) {
  const [selectedIcon, setSelectedIcon] = useState<Icon>(defaultSelected);

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const select = (icon: Icon) => {
    onSelect(icon);
    setSelectedIcon(icon);
  };

  return (
    <View className="flex-row gap-4 flex-wrap">
      {icons.map((icon, index) => {
        const IconComponent = iconLibraries[icon.library];

        return (
          <Pressable
            key={index}
            className="items-center justify-center"
            style={[
              {
                width: buttonWidth,
                height: buttonWidth,
              },
              selectedIcon.library === icon.library &&
                selectedIcon.name === icon.name && {
                  borderWidth: 2,
                  borderRadius: 8,
                  borderColor: theme.foreground,
                },
            ]}
            onPress={() => select(icon)}
          >
            <IconComponent
              name={icon.name as any}
              size={iconSize}
              color={theme.foreground}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
