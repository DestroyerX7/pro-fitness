import useTheme from "@/hooks/useTheme";
import { WorkoutLogIcon } from "@/lib/types/workout-log-icon";
import { useState } from "react";
import { Pressable, View } from "react-native";
import WorkoutLogIconDisplay from "./WorkoutLogIconDisplay";

const workoutLogIcons: WorkoutLogIcon[] = [
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

export default function WorkoutIconGrid({
  value,
  numColumns = 6,
  gap = 8,
  onValueChange,
}: {
  value: WorkoutLogIcon;
  numColumns?: number;
  gap?: number;
  onValueChange?: (workoutLogIcon: WorkoutLogIcon) => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const theme = useTheme();

  const itemWidth = containerWidth
    ? (containerWidth - gap * (numColumns - 1)) / numColumns
    : 0;

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <View className="flex-row flex-wrap" style={{ gap }}>
        {workoutLogIcons.map((workoutLogIcon, i) => (
          <Pressable
            key={i}
            className="items-center justify-center rounded-xl"
            style={[
              { width: itemWidth, height: itemWidth },
              value.library === workoutLogIcon.library &&
                value.name === workoutLogIcon.name && {
                  borderWidth: 2,
                  borderColor: theme.foreground,
                },
            ]}
            onPress={() => onValueChange?.(workoutLogIcon)}
          >
            <WorkoutLogIconDisplay
              workoutLogIcon={workoutLogIcon}
              size={itemWidth * 0.75}
              color={theme.foreground}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
