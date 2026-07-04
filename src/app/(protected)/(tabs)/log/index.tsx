import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";
import useTheme from "@/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { ReactElement } from "react";
import { Pressable, ScrollView, View } from "react-native";

type LogMenuItemData = {
  id: string;
  icon: ReactElement;
  title: string;
  description: string;
  href: Href;
};

function LogMenuItem({ icon, title, description, href }: LogMenuItemData) {
  return (
    <Pressable onPress={() => router.push(href)}>
      <Card className="flex-row gap-4">
        {icon}

        <View className="gap-1 flex-1">
          <ThemedText className="text-2xl font-bold">{title}</ThemedText>

          <ThemedText className="text-muted-foreground">
            {description}
          </ThemedText>
        </View>
      </Card>
    </Pressable>
  );
}

export default function Index() {
  const theme = useTheme();

  const logMenuItems: LogMenuItemData[] = [
    {
      id: "calories",
      icon: (
        <MaterialCommunityIcons
          name="food"
          size={64}
          color={theme.foreground}
        />
      ),
      title: "Log Calories",
      description: "Add food or drinks you have consumed to log their calories",
      href: "/(protected)/(tabs)/log/nutrition",
    },
    {
      id: "workout",
      icon: (
        <MaterialCommunityIcons name="run" size={64} color={theme.foreground} />
      ),
      title: "Log Workout",
      description: "Enter a workout to log its duration",
      href: "/(protected)/(tabs)/log/workout",
    },
    {
      id: "scan",
      icon: (
        <MaterialCommunityIcons
          name="barcode-scan"
          size={64}
          color={theme.foreground}
        />
      ),
      title: "Scan Barcode",
      description: "Use your camera to scan a barcode and log its calories",
      href: "/(protected)/(tabs)/log/scan",
    },
    {
      id: "presets",
      icon: (
        <MaterialCommunityIcons
          name="tune"
          size={64}
          color={theme.foreground}
        />
      ),
      title: "Presets",
      description:
        "Quickly log calories or workouts by using one of your saved presets",
      href: "/(protected)/(tabs)/log/preset",
    },
    {
      id: "goal",
      icon: (
        <MaterialCommunityIcons
          name="bullseye-arrow"
          size={64}
          color={theme.foreground}
        />
      ),
      title: "Create Goal",
      description: "Add a goal you want to accomplish",
      href: "/(protected)/(tabs)/log/goal",
    },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-4 gap-4"
      showsVerticalScrollIndicator={false}
    >
      {logMenuItems.map((logMenuItem) => (
        <LogMenuItem key={logMenuItem.id} {...logMenuItem} />
      ))}
    </ScrollView>
  );
}
