import { colors } from "@/constants/colors";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";

export default function TabsLayout() {
  return (
    <NativeTabs
      labelStyle={{
        // For the text color
        color: DynamicColorIOS({
          dark: colors.dark.primary,
          light: colors.light.primary,
        }),
      }}
      // For the selected icon color
      tintColor={DynamicColorIOS({
        dark: colors.dark.primary,
        light: colors.light.primary,
      })}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md={{ default: "home", selected: "home_filled" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="goals">
        <NativeTabs.Trigger.Icon
          sf={{ default: "target", selected: "target" }}
        />
        <NativeTabs.Trigger.Label>Goals</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="log">
        <NativeTabs.Trigger.Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
        />
        <NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Icon
          sf={{ default: "calendar", selected: "calendar" }}
        />
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{ default: "person", selected: "person.fill" }}
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
