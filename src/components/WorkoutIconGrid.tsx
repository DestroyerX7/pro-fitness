import useTheme from "@/hooks/useTheme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";

export type IconType =
  | { library: "MaterialIcons"; name: keyof typeof MaterialIcons.glyphMap }
  | {
      library: "MaterialCommunityIcons";
      name: keyof typeof MaterialCommunityIcons.glyphMap;
    };

const iconTypes: IconType[] = [
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

export function Icon({
  iconType,
  size,
  color,
}: {
  iconType: IconType;
  size: number;
  color: string;
}) {
  switch (iconType.library) {
    case "MaterialIcons":
      return <MaterialIcons name={iconType.name} size={size} color={color} />;
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons
          name={iconType.name}
          size={size}
          color={color}
        />
      );
  }
}

export default function WorkoutIconGrid({
  value,
  numColumns = 5,
  gap = 8,
  onValueChange,
}: {
  value: IconType;
  numColumns?: number;
  gap?: number;
  onValueChange?: (iconType: IconType) => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const theme = useTheme();

  const itemWidth = containerWidth
    ? (containerWidth - gap * (numColumns - 1)) / numColumns
    : 0;

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <View className="flex-row flex-wrap" style={{ gap }}>
        {iconTypes.map((iconType, i) => (
          <Pressable
            key={i}
            className="items-center justify-center rounded-xl"
            style={[
              { width: itemWidth, height: itemWidth },
              value.library === iconType.library &&
                value.name === iconType.name && {
                  borderWidth: 2,
                  borderColor: theme.foreground,
                },
            ]}
            onPress={() => onValueChange?.(iconType)}
          >
            <Icon
              iconType={iconType}
              size={itemWidth * 0.75}
              color={theme.foreground}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
