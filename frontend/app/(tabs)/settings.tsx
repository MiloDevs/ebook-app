import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Assuming local path for Switch
import { DropdownMenu, MenuOption } from "@/components/ui/selectModal"; // Assuming local path for Dropdown
import { db } from "@/lib/db";
import { authClient } from "@/lib/auth-client";
import { Settings } from "@/types/settings";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Iconify from "react-native-iconify/native";
import { useAppContext } from "@/hooks/app-context";

// --- 1. CONFIGURATION ---

const SETTINGS_KEY = "@user_settings";

const defaultSettings: Settings = {
  keepawake: true,
  volumeupturnpages: true,
  readertheme: "system",
  openlastbook: false,
};

// Define the structure of a single setting item
interface SettingItemConfig {
  icon?: string;
  title: string;
  options?: string[]; // For 'selector' type
  key: keyof Settings; // Key that links to the settings object
  controlType: "toggle" | "selector"; // Type of control to render
}

// Define all settings items here
const settingsItems: SettingItemConfig[] = [
  {
    title: "Keep screen on",
    key: "keepawake",
    controlType: "toggle",
  },
  {
    title: "Volume button turns pages",
    key: "volumeupturnpages",
    controlType: "toggle",
  },
  {
    title: "Reader theme",
    key: "readertheme",
    options: ["dark", "light", "system", "sepia"],
    controlType: "selector",
  },
  {
    title: "Open last book on launch",
    key: "openlastbook",
    controlType: "toggle",
  },
];

// --- 2. MAIN COMPONENT ---

export default function SettingsPage() {
  const { setSettings, setUser, state } = useAppContext();

  // 💡 Get the current settings object from the global state.
  // Use a fallback to ensure the component doesn't crash while loading.
  const currentSettings = state?.settings || defaultSettings;

  // State to track which dropdown is open (using the key of the setting)
  const [activeDropdownKey, setActiveDropdownKey] = useState<
    keyof Settings | null
  >(null);

  async function handleSettingChange<K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) {
    // Use the functional update form on the global context setter
    // to ensure state updates are based on the latest value.
    setSettings((prevState) => ({
      ...prevState, // Spread the previous global settings
      [key]: value, // Override the key
    }));
  }

  async function logout() {
    await setUser({
      id: "",
      name: "",
      email: "",
    });
    await authClient.signOut();
  }

  // --- UI Renderers ---

  const DividerComponent = () => {
    return <View style={styles.divider}></View>;
  };

  const renderSettingItem = ({ item }: { item: SettingItemConfig }) => {
    const { key, title, icon, options, controlType } = item;
    const currentValue = currentSettings[key];
    const isToggle = controlType === "toggle";
    const isSelector = controlType === "selector";

    // Check if the current item's dropdown is visible
    const isDropdownVisible = activeDropdownKey === key;

    const handleValueChange = (newValue: Settings[keyof Settings]) => {
      handleSettingChange(key, newValue);
    };

    const handlePress = () => {
      if (isToggle) {
        handleValueChange(!currentValue);
      } else if (isSelector) {
        setActiveDropdownKey(key);
      }
    };

    const renderControl = () => {
      if (isToggle) {
        // Render Switch
        const switchValue =
          typeof currentValue === "boolean" ? currentValue : false;

        return (
          <Switch
            on={switchValue}
            onValueChange={(newValue) => handleValueChange(newValue)}
          />
        );
      }

      if (isSelector) {
        // Render Dropdown Menu (Selector)
        const stringCurrentValue = String(currentValue);

        return (
          <DropdownMenu
            visible={isDropdownVisible}
            handleOpen={() => setActiveDropdownKey(key)}
            handleClose={() => setActiveDropdownKey(null)}
            trigger={
              <View style={styles.selectorTrigger}>
                <Text style={styles.selectorText}>{stringCurrentValue}</Text>
                <Iconify
                  icon="mingcute:down-small-fill"
                  size={24}
                  color="gray"
                />
              </View>
            }
          >
            {options &&
              options.map((option: string) => (
                <MenuOption
                  key={option}
                  onSelect={() => {
                    handleValueChange(option);
                    setActiveDropdownKey(null); // Close after selection
                  }}
                >
                  <Text
                    className={`${
                      stringCurrentValue === option
                        ? "font-hepta_semibold"
                        : "font-hepta_regular"
                    } text-small`}
                  >
                    {option}
                  </Text>
                </MenuOption>
              ))}
          </DropdownMenu>
        );
      }
      return null;
    };

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={handlePress}
        activeOpacity={0.7}
        // Disable row press for selector, as the dropdown trigger handles interaction
        disabled={isSelector}
      >
        <View style={styles.titleContainer}>
          {icon && <Iconify icon={icon} style={styles.icon} />}
          <Text className="font-hepta_regular text-small">{title}</Text>
        </View>

        {renderControl()}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="bg-gray_0 flex-1 p-2">
      <Text className="font-hepta_medium text-h3 mb-8">Settings</Text>
      {/* main settings*/}
      <View className="p-1 flex-1">
        <View>
          <Text className="font-hepta_medium text-p mb-4">General</Text>
          <View className="bg-white border border-gray_25/40 rounded-3xl">
            <FlatList
              data={settingsItems}
              scrollEnabled={false}
              nestedScrollEnabled={false}
              ItemSeparatorComponent={DividerComponent}
              renderItem={renderSettingItem}
              keyExtractor={(item) => item.key as string}
            />
          </View>
        </View>
      </View>

      <Button title="Logout" onPress={logout} />
    </SafeAreaView>
  );
}

// --- 3. STYLES ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 8,
    gap: 16,
    justifyContent: "flex-start",
  },
  settingsGroup: {
    borderRadius: 16, // rounded-2xl
    backgroundColor: "rgba(235, 235, 235, 0.5)", // bg-gray_25/50
    overflow: "hidden",
  },
  headerText: {
    fontWeight: "600", // font-hepta_semibold
    padding: 8,
    paddingLeft: 16,
    fontSize: 16,
  },
  listContainer: {
    backgroundColor: "white",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#e5e7eb", // bg-gray_25
    width: "95%",
    alignSelf: "center",
  },
  // --- Item Styles ---
  itemContainer: {
    minHeight: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  titleText: {
    fontWeight: "500", // font-hepta_medium
  },
  selectorTrigger: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectorText: {
    color: "#6b7280", // text-gray-500
    marginRight: 8,
    fontSize: 16,
  },
  menuOption: {
    fontWeight: "500", // font-hepta_medium
  },
  menuOptionActive: {
    fontWeight: "700", // font-hepta_bold
  },
});
