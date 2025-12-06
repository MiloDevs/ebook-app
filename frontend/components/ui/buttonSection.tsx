import { TouchableOpacity, FlatList, Text, View, Modal } from "react-native";
import Iconify from "react-native-iconify/native";
import { Switch } from "./switch";
import { Settings } from "@/types/settings"; // Import your Settings type
import { ThemeSelectorModal } from "./themeSelectorModal";
import { DropdownMenu, MenuOption } from "./selectModal";
import { useState } from "react";

// --- TYPE EXPANSION ---

// 1. Updated ButtonSectionItem to include keys and control types
export interface ButtonSectionItem {
  icon?: string;
  title: string;
  options?: string[];
  action?: () => void;

  // New properties for settings integration:
  key: keyof Settings; // Key that links to the settings object (e.g., 'keepawake')
  controlType?: "toggle" | "selector"; // Type of control to render
}

// 2. Updated ButtonSectionProps to include state and handler
export interface ButtonSectionProps {
  title?: string;
  items: ButtonSectionItem[]; // Items array is now required (non-optional in logic)

  // New properties for settings integration:
  currentSettings: Settings; // The current settings state object
  onSettingChange: <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => Promise<void>; // The handler to update settings
}

// --- COMPONENTS ---

const DividerComponent = () => {
  return <View className="h-0.5 bg-gray_25 w-[95%] mx-auto"></View>;
};

// 3. New Component Props for clarity in ItemComponent
interface ItemComponentProps<K extends keyof Settings>
  extends ButtonSectionItem {
  key: K; // Explicitly enforce the key type
  currentValue: Settings[K]; // Current value is strictly tied to the key
  onValueChange: (newValue: Settings[K]) => void; // Handler is strictly tied to the key
}

const ItemComponent = <K extends keyof Settings>({
  title,
  icon,
  key,
  options,
  controlType,
  currentValue,
  onValueChange,
}: ItemComponentProps<K>) => {
  // Determine if the item should render a switch
  const isToggle = controlType === "toggle";

  const handlePress = () => {
    if (isToggle) {
      // If it's a toggle, flip the boolean value
      onValueChange(!currentValue as Settings[K]);
    } else if (controlType === "selector") {
      setVisible(true);
    } else if (key) {
      // Fallback for an item that is just clickable (action button)
      // If an action exists, execute it
      // action?.();
    }
  };

  const [visible, setVisible] = useState(false);
  const renderControl = () => {
    if (isToggle) {
      // Cast the value to boolean for the Switch component
      const switchValue =
        typeof currentValue === "boolean" ? currentValue : false;

      return (
        <Switch
          on={switchValue}
          onValueChange={(newValue) => onValueChange(newValue as Settings[K])}
        />
      );
    }
    // If it's a 'selector', you might render the current value and a chevron
    if (controlType === "selector") {
      const stringCurrentValue = String(currentValue);
      return (
        <DropdownMenu
          visible={visible}
          handleOpen={() => setVisible(true)}
          handleClose={() => setVisible(false)}
          trigger={
            <View className="flex-row items-center">
              <Text className="font-hepta_regular text-p text-gray-500 mr-2">
                {stringCurrentValue}
              </Text>
              <Iconify icon="mingcute:down-small-fill" size={24} color="gray" />
            </View>
          }
        >
          {options &&
            options.map((option: string) => (
              <MenuOption
                key={option}
                onSelect={() => {
                  console.log("selected value:", option);
                  onValueChange(option as Settings[K]);
                  setVisible(false);
                }}
              >
                <Text
                  className={`${currentValue === option && "font-hepta_bold"} font-hepta_medium`}
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
    // TouchableOpacity handles the press action for the whole row
    <TouchableOpacity
      className="min-h-10 justify-between flex-row p-4 active:bg-gray_50"
      onPress={handlePress}
      // You might conditionally disable the press if it's a non-toggle/non-selector item
      // disabled={!isToggle}
    >
      <View className="flex-row items-center">
        {icon && (
          <Iconify
            icon={icon}
            style={{
              marginRight: 8,
            }}
          />
        )}
        <Text className="font-hepta_medium">{title}</Text>
      </View>

      {/* Render the appropriate control (Switch, Chevron, etc.) */}
      {renderControl()}
    </TouchableOpacity>
  );
};

export const ButtonSection = ({
  title,
  items,
  currentSettings,
  onSettingChange,
}: ButtonSectionProps) => {
  const renderItemWithState = ({ item }: { item: ButtonSectionItem }) => {
    const { key, ...restProps } = item;
    // Get the current value from the settings object using the item key
    const currentValue = currentSettings[key];

    // Create the value change handler bound to this item's key
    const handleValueChange = (newValue: Settings[keyof Settings]) => {
      // Use the key to call the external handler
      onSettingChange(key, newValue);
    };

    return (
      <ItemComponent
        {...restProps}
        key={key}
        currentValue={currentValue}
        onValueChange={handleValueChange}
      />
    );
  };

  return (
    <View className="rounded-2xl bg-gray_25/50 overflow-hidden">
      {title && (
        <Text className="font-hepta_semibold text-p p-2 pl-4">{title}</Text>
      )}
      {items && items?.length > 0 && (
        <FlatList
          data={items}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          ItemSeparatorComponent={DividerComponent}
          // 💡 Use the new render function that injects state and handler
          renderItem={renderItemWithState}
          keyExtractor={(item) => item.key as string}
        />
      )}
    </View>
  );
};
