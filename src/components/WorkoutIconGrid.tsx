import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/nativewind";
import { WorkoutLogIcon } from "@/lib/types/workout-log-icon";
import { Pressable, View, ViewProps } from "react-native";
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

function chunk<T>(arr: Array<T>, size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

type Props = {
  value: WorkoutLogIcon;
  numColumns?: number;
  onValueChange?: (workoutLogIcon: WorkoutLogIcon) => void;
} & ViewProps;

export default function WorkoutIconGrid({
  value,
  numColumns = 6,
  onValueChange,
  className,
  ...props
}: Props) {
  const theme = useTheme();

  const trailingPadding =
    Math.ceil(workoutLogIcons.length / numColumns) * numColumns -
    workoutLogIcons.length;

  const items: (WorkoutLogIcon | null)[] = [
    ...workoutLogIcons,
    ...Array(trailingPadding).fill(null),
  ];

  const rows = chunk(items, numColumns);
  const iconSize = Math.floor(256 / numColumns);

  return (
    <View className={cn("gap-2", className)} {...props}>
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-2">
          {row.map((item, j) => {
            if (item === null) {
              return (
                <View
                  key={i * numColumns + j}
                  className="flex-1 aspect-square"
                />
              );
            }

            return (
              <Pressable
                key={i * numColumns + j}
                className={cn(
                  "flex-1 aspect-square items-center justify-center rounded-xl border-2",
                  value.library === item.library && value.name === item.name
                    ? "border-foreground"
                    : "border-transparent",
                )}
                onPress={() => onValueChange?.(item)}
              >
                <WorkoutLogIconDisplay
                  workoutLogIcon={item}
                  size={iconSize}
                  color={theme.foreground}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
