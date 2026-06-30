import { Text, View } from "react-native";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "green" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: "600" }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{ fontSize: 15 }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  loggedCalories: ({ text1, text2 }) => (
    <View
      style={{
        height: 60,
        width: "90%",
        backgroundColor: "#1e1e1e",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 20 }}>🍽️</Text>
      <View>
        <Text style={{ color: "white", fontWeight: "600" }}>{text1}</Text>
        <Text style={{ color: "#aaa", fontSize: 12 }}>{text2}</Text>
      </View>
    </View>
  ),
  loggedWorkout: ({ text1, text2 }) => (
    <View
      style={{
        height: 60,
        width: "90%",
        backgroundColor: "#1e1e1e",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 20 }}>💪</Text>
      <View>
        <Text style={{ color: "white", fontWeight: "600" }}>{text1}</Text>
        <Text style={{ color: "#aaa", fontSize: 12 }}>{text2}</Text>
      </View>
    </View>
  ),
  createdGoal: ({ text1, text2 }) => (
    <View
      style={{
        height: 60,
        width: "90%",
        backgroundColor: "#1e1e1e",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 20 }}>🎯</Text>
      <View>
        <Text style={{ color: "white", fontWeight: "600" }}>{text1}</Text>
        <Text style={{ color: "#aaa", fontSize: 12 }}>{text2}</Text>
      </View>
    </View>
  ),
};
