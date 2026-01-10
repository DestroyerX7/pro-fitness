import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CalorieLog = {
  id: string;
  name: string;
  calories: number;
  // date: Date;
  imageUrl: string | null;
};

export default function Index() {
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>([]);

  useEffect(() => {
    const getCalorieLogs = async () => {
      const response: { data: { calorieLogs: CalorieLog[] } } = await axios.get(
        "http://10.0.0.53:8081/api/get-calorie-logs/htsrttp8sXmTrqo89LzklkHgOFtxXiSY"
      );

      setCalorieLogs(response.data.calorieLogs);
    };

    getCalorieLogs();
  }, []);

  const loggedCalories = calorieLogs.reduce((a, b) => a + b.calories, 0);

  return (
    <SafeAreaView style={{ padding: 16 }}>
      <View>
        <Text>Today's Calories</Text>

        <Text>{loggedCalories} / 2600</Text>

        <View style={{ height: 32, backgroundColor: "lightgray" }}>
          <View
            style={{
              height: "100%",
              backgroundColor: "forestgreen",
              width: `${(loggedCalories / 2600) * 100}%`,
            }}
          />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>{2600 - loggedCalories} calories remaining</Text>

          <Text>{((loggedCalories / 2600) * 100).toFixed(2)}%</Text>
        </View>
      </View>

      {calorieLogs.map(({ id, imageUrl, name, calories }) => (
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            backgroundColor: "white",
            borderColor: "lightgray",
          }}
          key={id}
        >
          {imageUrl !== null ? (
            <Image
              style={{ width: 48, height: 48, borderRadius: 8 }}
              source={{ uri: imageUrl }}
            />
          ) : (
            <View
              style={{
                width: 48,
                height: 48,
                borderWidth: 1,
                borderRadius: 8,
                borderColor: "lightgray",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="food" size={32} />
            </View>
          )}

          <View style={{ flex: 1, gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>{name}</Text>
            <Text style={{ color: "gray" }}>{calories}</Text>
          </View>

          <Ionicons name="ellipsis-horizontal" size={24} color="black" />
        </View>
      ))}
    </SafeAreaView>
  );
}
