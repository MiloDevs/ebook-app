import { HapticTab } from "@/components/haptic-tab";
import createIconSetFromFontello from "@expo/vector-icons/createIconSetFromFontello";
import { Tabs } from "expo-router";
import React from "react";
import fontelloConfig from "../../assets/icons/config.json";
import { Iconify } from "react-native-iconify/native";
import { COLORS, FONTS } from "@/constants/colors";

const Icon = createIconSetFromFontello(
  fontelloConfig,
  "home-icons",
  "home-icons.ttf"
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabelStyle: {
            ...FONTS.small,
            ...FONTS.medium,
          },
          tabBarActiveTintColor: COLORS.primary,
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
          tabBarLabelStyle: {
            ...FONTS.small,
            ...FONTS.medium,
          },
          tabBarActiveTintColor: COLORS.primary,
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
        name="library"
        options={{
          title: "Library",
          tabBarLabelStyle: {
            ...FONTS.small,
            ...FONTS.medium,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarIcon: ({ color, focused }) => (
            <Iconify
              size={20}
              color={color}
              icon={`mingcute:bookmark-${focused ? "fill" : "line"}`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "settings",
          tabBarLabelStyle: {
            ...FONTS.small,
            ...FONTS.medium,
          },
          tabBarActiveTintColor: COLORS.primary,
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
