import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Animated,
} from "react-native";

export const MenuTrigger = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const MenuOption = ({
  onSelect,
  children,
}: {
  onSelect: () => void;
  children: ReactNode;
}) => {
  return (
    <TouchableOpacity onPress={onSelect} style={styles.menuOption}>
      {children}
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get("window").width;
const ANIMATION_DURATION = 250;
const Y_OFFSET = -5;

interface DropdownMenuProps {
  visible: boolean;
  handleClose: () => void;
  handleOpen: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  dropdownWidth?: number;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  handleOpen,
  handleClose,
  trigger,
  children,
  dropdownWidth = 150,
}) => {
  const triggerRef = useRef<View>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });
  const [alignRight, setAlignRight] = useState(false);

  const [renderModal, setRenderModal] = useState(visible);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setRenderModal(true);

      if (triggerRef.current) {
        triggerRef.current.measure((fx, fy, width, height, px, py) => {
          const newPosition = { x: px, y: py + height, width: width };
          const dropdownRightEdge = newPosition.x + dropdownWidth;

          setAlignRight(dropdownRightEdge > screenWidth);
          setPosition(newPosition);
        });
      }

      Animated.timing(animation, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setRenderModal(false);
      });
    }
  }, [visible, dropdownWidth]);

  useEffect(() => {
    if (triggerRef.current && renderModal) {
      triggerRef.current.measure((fx, fy, width, height, px, py) => {
        const newPosition = { x: px, y: py + height, width: width };
        const dropdownRightEdge = newPosition.x + dropdownWidth;

        setAlignRight(dropdownRightEdge > screenWidth);
        setPosition(newPosition);
      });
    }
  }, [renderModal, dropdownWidth]);

  const calculatedLeft = alignRight
    ? position.x + position.width - dropdownWidth
    : position.x;

  const animatedStyle = {
    opacity: animation,
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [Y_OFFSET, 0],
        }),
      },
    ],
  };

  return (
    <View>
      <TouchableWithoutFeedback onPress={handleOpen}>
        <View ref={triggerRef}>{trigger}</View>
      </TouchableWithoutFeedback>

      {renderModal && (
        <Modal
          transparent={true}
          visible={renderModal}
          onRequestClose={handleClose}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleClose}
          >
            <Animated.View
              style={[
                styles.menuContainer,
                animatedStyle,
                {
                  top: position.y + 5,
                  left: calculatedLeft,
                  width: dropdownWidth,
                },
              ]}
            >
              <View className="bg-white rounded-2xl p-4 border border-gray_25/50">
                {children}
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuContainer: {
    position: "absolute",
  },
  menuOption: {
    padding: 5,
  },
});
