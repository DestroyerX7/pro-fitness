import { ScrollView, Text, View } from "react-native";

export default function Test() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <ScrollView
        contentContainerStyle={{ flexDirection: "row", gap: 16 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View className="gap-4">
          <Text>Primary</Text>

          <View className="w-32 h-32 rounded-lg bg-[#0080ff]" />
          <View className="w-32 h-32 rounded-lg bg-[#ffffff] border" />
        </View>

        <View className="gap-4">
          <Text>Main</Text>

          <View className="w-32 h-32 rounded-lg bg-[#ffffff] border" />
          <View className="w-32 h-32 rounded-lg bg-[#333333]" />
        </View>

        <View className="gap-4">
          <Text>Secondary</Text>

          <View className="w-32 h-32 rounded-lg bg-[#f0f0f0]" />
          <View className="w-32 h-32 rounded-lg bg-[#444444]" />
        </View>

        <View className="gap-4">
          <Text>Muted</Text>

          <View className="w-32 h-32 rounded-lg bg-[#f8f8f8]" />
          <View className="w-32 h-32 rounded-lg bg-[#888888]" />
        </View>

        <View className="gap-4">
          <Text>Border</Text>

          <View className="w-32 h-32 rounded-lg bg-[#e0e0e0]" />
        </View>
      </ScrollView>

      <View className="border-[#e0e0e0] border rounded-lg p-4">
        <Text className="text-[#333333]">Card Example</Text>
        <Text className="text-[#888888]">Subtext</Text>
      </View>

      <View className="bg-[#f0f0f0] rounded-lg p-4">
        <Text className="text-[#444444]">Secondary Card Example</Text>
      </View>

      <View className="bg-[#f8f8f8] rounded-lg p-4">
        <Text className="text-[#333333]">Muted Card Example</Text>
      </View>
    </ScrollView>
  );
}
