import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

export type WorkoutLogIcon =
  | { library: "MaterialIcons"; name: keyof typeof MaterialIcons.glyphMap }
  | {
      library: "MaterialCommunityIcons";
      name: keyof typeof MaterialCommunityIcons.glyphMap;
    };

type Props = {
  workoutLogIcon: WorkoutLogIcon;
  size: number;
  color: string;
};

export default function WorkoutLogIconDisplay({
  workoutLogIcon,
  size,
  color,
}: Props) {
  switch (workoutLogIcon.library) {
    case "MaterialIcons":
      return (
        <MaterialIcons name={workoutLogIcon.name} size={size} color={color} />
      );
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons
          name={workoutLogIcon.name}
          size={size}
          color={color}
        />
      );
  }
}
