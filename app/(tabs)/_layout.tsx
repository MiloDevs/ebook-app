import { HapticTab } from "@/components/haptic-tab";
import createIconSetFromFontello from "@expo/vector-icons/createIconSetFromFontello";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import React from "react";
import fontelloConfig from "../../assets/icons/config.json";
import { Iconify } from "react-native-iconify/native";

const Icon = createIconSetFromFontello(
  fontelloConfig,
  "home-icons",
  "home-icons.ttf",
);

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    "home-icons": require("../../assets/fonts/home-icons.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={`home-${focused ? "fill" : "line"}`}
              size={18}
              color={color}
              stroke={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <Iconify
              size={20}
              color={color}
              icon={`mingcute:search-${focused ? "fill" : "line"}`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "settings",
          tabBarIcon: ({ color, focused }) => (
            <Iconify
              size={20}
              color={color}
              icon={`mingcute:settings-3-${focused ? "fill" : "line"}`}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// <Tabs.Screen
//   name="search"
//   options={{
//     title: "Search",
//     tabBarIcon: ({ color }) => (
//       <Iconify icon="mingcute:search-line" color={color} />
//     ),
//   }}
// />
// <Tabs.Screen
//   name="settings"
//   options={{
//     title: "settings",
//     tabBarIcon: ({ color }) => (
//       <Iconify icon="mingcute:settings-3-line" color={color} />
//     ),
//   }}
// />
