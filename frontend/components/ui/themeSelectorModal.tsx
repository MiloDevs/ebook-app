import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Iconify from "react-native-iconify/native";
import { AnimatedModal } from "./animatedModal";
import { Settings } from "@/types/settings";

const THEME_OPTIONS: Settings["readertheme"][] = ["system", "light", "dark"];

const THEME_ICONS = {
  system: "mingcute:computer-line",
  light: "mingcute:computer-line",
  dark: "mingcute:computer-line",
};

interface ThemeSelectorModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentTheme: Settings["readertheme"];
  onThemeSelect: (theme: Settings["readertheme"]) => Promise<void>;
  variant?: "bottom" | "center" | "dropdown";
  anchorPosition?: { top: number; right: number };
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isVisible,
  onClose,
  currentTheme,
  onThemeSelect,
  variant = "bottom",
  anchorPosition,
}) => {
  const handleSelect = async (theme: Settings["readertheme"]) => {
    await onThemeSelect(theme);
    onClose();
  };

  const isDropdown = variant === "dropdown";

  return (
    <AnimatedModal
      isVisible={isVisible}
      onClose={onClose}
      variant={variant}
      anchorPosition={anchorPosition}
    >
      <View style={styles.content}>
        {!isDropdown && (
          <View style={styles.header}>
            <Text style={styles.title}>Theme</Text>
          </View>
        )}

        <View
          style={[
            styles.optionsContainer,
            isDropdown && styles.optionsContainerDropdown,
          ]}
        >
          {THEME_OPTIONS.map((theme, index) => {
            const isSelected = currentTheme === theme;
            const isLast = index === THEME_OPTIONS.length - 1;

            return (
              <TouchableOpacity
                key={theme}
                style={[
                  isDropdown ? styles.optionDropdown : styles.option,
                  isSelected && styles.optionSelected,
                  !isLast && styles.optionBorder,
                ]}
                onPress={() => handleSelect(theme)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  {/*<View
                    style={[
                      isDropdown
                        ? styles.iconContainerDropdown
                        : styles.iconContainer,
                      isSelected && styles.iconContainerSelected,
                    ]}
                  >
                    <Iconify
                      icon={THEME_ICONS[theme]}
                      size={isDropdown ? 18 : 20}
                      color={isSelected ? "#007AFF" : "#666"}
                    />
                  </View>*/}
                  <Text
                    style={[
                      isDropdown
                        ? styles.optionTextDropdown
                        : styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.checkContainer}>
                    <Iconify
                      icon="mingcute:computer-line"
                      size={isDropdown ? 18 : 22}
                      color="#007AFF"
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </AnimatedModal>
  );
};

const styles = StyleSheet.create({
  content: {
    width: "100%",
    zIndex: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.3,
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionsContainerDropdown: {
    paddingVertical: 4,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "white",
  },
  optionDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.06)",
  },
  optionSelected: {
    backgroundColor: "rgba(0, 122, 255, 0.04)",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerDropdown: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerSelected: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  optionText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#333",
    letterSpacing: -0.2,
  },
  optionTextDropdown: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    letterSpacing: -0.2,
  },
  optionTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  checkContainer: {
    marginLeft: 8,
  },
});
