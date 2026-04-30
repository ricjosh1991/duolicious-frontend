import { View } from "react-native";
import { StatusBarSpacer } from "./status-bar-spacer";
import { DefaultText } from "./default-text";
import { isMobile } from "../util/util";
import { useAppTheme } from "../app-theme/app-theme";
import Ionicons from "@expo/vector-icons/Ionicons";

const TopNavBar = (props) => {
  const { appTheme } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: appTheme.primaryColor,
        zIndex: 999,
        width: "100%",
        overflow: "visible",
        ...props.containerStyle,
      }}
    >
      <StatusBarSpacer />
      <View
        style={{
          width: "100%",
          maxWidth: 600,
          height: 48,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          ...props.style,
        }}
      >
        {props.children}
      </View>
    </View>
  );
};

const DuoliciousTopNavBar = (props) => {
  const { style, textColor, screenTitle, children } = props;

  const { appTheme } = useAppTheme();

  if (!isMobile() && !children) {
    return <View style={{ height: 10 }} />;
  }

  return (
    <>
      <TopNavBar
        containerStyle={{
          backgroundColor: appTheme.brandColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        }}
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 6,
          ...style,
        }}
      >
        {isMobile() && (
          <>
            <Ionicons
              name="calendar-clear-outline"
              size={22}
              color={textColor ?? "white"}
            />
            <DefaultText
              style={{
                fontFamily: "PoppinsSemiBold",
                color: textColor ?? "white",
                fontSize: 22,
                letterSpacing: 0.5,
              }}
            >
              Clear Date
            </DefaultText>
          </>
        )}
        {children}
      </TopNavBar>
      {screenTitle && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
            backgroundColor: appTheme.primaryColor,
          }}
        >
          <DefaultText
            style={{
              fontFamily: 'PoppinsSemiBold',
              fontSize: 18,
              color: appTheme.secondaryColor,
            }}
          >
            {screenTitle}
          </DefaultText>
        </View>
      )}
    </>
  );
};

const ScreenTitle = ({ title }: { title: string }) => {
  const { appTheme } = useAppTheme();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: appTheme.primaryColor,
      }}
    >
      <DefaultText
        style={{
          fontFamily: 'PoppinsSemiBold',
          fontSize: 18,
          color: appTheme.secondaryColor,
        }}
      >
        {title}
      </DefaultText>
    </View>
  );
};

export { DuoliciousTopNavBar, TopNavBar, ScreenTitle };
