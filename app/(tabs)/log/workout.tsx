import { colors } from "@/lib/colors";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Icon =
  | { library: "MaterialIcons"; name: keyof typeof MaterialIcons.glyphMap }
  | {
      library: "MaterialCommunityIcons";
      name: keyof typeof MaterialCommunityIcons.glyphMap;
    }
  | { library: "Ionicons"; name: keyof typeof Ionicons.glyphMap };

const icons: Icon[] = [
  { library: "MaterialCommunityIcons", name: "run" },
  { library: "MaterialCommunityIcons", name: "weight-lifter" },
  { library: "MaterialCommunityIcons", name: "bike" },
  { library: "MaterialCommunityIcons", name: "swim" },
  { library: "MaterialCommunityIcons", name: "gymnastics" },
  { library: "MaterialCommunityIcons", name: "football" },
  { library: "MaterialCommunityIcons", name: "soccer" },
  { library: "MaterialCommunityIcons", name: "tennis" },
  { library: "MaterialCommunityIcons", name: "table-tennis" },
  { library: "MaterialCommunityIcons", name: "golf" },
  { library: "MaterialCommunityIcons", name: "bowling" },
  { library: "MaterialCommunityIcons", name: "ski" },
  { library: "MaterialCommunityIcons", name: "snowboard" },
  { library: "MaterialIcons", name: "ice-skating" },
  { library: "MaterialCommunityIcons", name: "bow-arrow" },
];

const iconLibraries = {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} as const;

export default function Workout() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<Icon>({
    library: "MaterialCommunityIcons",
    name: "run",
  });

  const logWorkout = async () => {
    const trimmedName = name.trim();
    const durationNum = Number(duration);

    if (trimmedName.length < 1 || durationNum < 1) {
      return;
    }

    await axios.post("http://10.0.0.53:8081/api/log-workout", {
      userId: "htsrttp8sXmTrqo89LzklkHgOFtxXiSY",
      name: trimmedName,
      duration: durationNum,
      iconLibrary: selectedIcon.library,
      iconName: selectedIcon.name,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View className="p-4 gap-4">
      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Duration"
        value={duration}
        onChangeText={(text) => setDuration(text)}
      />

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Date"
        value={new Date().toLocaleDateString()}
      />

      <Text className="font-bold text-foreground text-2xl">Icon</Text>

      <View className="flex-row gap-4 flex-wrap">
        {icons.map((icon, index) => {
          const IconComponent = iconLibraries[icon.library];

          return (
            <Pressable
              key={index}
              className="w-16 h-16 items-center justify-center"
              style={[
                selectedIcon.library === icon.library &&
                  selectedIcon.name === icon.name && {
                    borderWidth: 2,
                    borderRadius: 8,
                    borderColor: colors.foreground,
                  },
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <IconComponent
                name={icon.name as any}
                size={48}
                color={colors.foreground}
              />
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={logWorkout} className="bg-primary p-4 rounded-full">
        <Text className="text-primaryForeground text-center text-lg font-bold">
          Log Workout
        </Text>
      </Pressable>
    </View>
  );
}
