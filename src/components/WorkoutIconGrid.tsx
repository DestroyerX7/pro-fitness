import useTheme from "@/hooks/useTheme";
import { Icon } from "@/lib/icons";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";

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

export function IconDisplay({
  icon,
  size,
  color,
}: {
  icon: Icon;
  size: number;
  color: string;
}) {
  switch (icon.library) {
    case "MaterialIcons":
      return <MaterialIcons name={icon.name} size={size} color={color} />;
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons name={icon.name} size={size} color={color} />
      );
  }
}

export default function WorkoutIconGrid({
  value,
  numColumns = 5,
  gap = 8,
  onValueChange,
}: {
  value: Icon;
  numColumns?: number;
  gap?: number;
  onValueChange?: (icon: Icon) => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const theme = useTheme();

  const itemWidth = containerWidth
    ? (containerWidth - gap * (numColumns - 1)) / numColumns
    : 0;

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <View className="flex-row flex-wrap" style={{ gap }}>
        {icons.map((icon, i) => (
          <Pressable
            key={i}
            className="items-center justify-center rounded-xl"
            style={[
              { width: itemWidth, height: itemWidth },
              value.library === icon.library &&
                value.name === icon.name && {
                  borderWidth: 2,
                  borderColor: theme.foreground,
                },
            ]}
            onPress={() => onValueChange?.(icon)}
          >
            <IconDisplay
              icon={icon}
              size={itemWidth * 0.75}
              color={theme.foreground}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
