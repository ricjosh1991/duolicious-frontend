import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';
import {
  createNavigatorFactory,
  type DefaultNavigatorOptions,
  type ParamListBase,
  type TabActionHelpers,
  type TabNavigationState,
  TabRouter,
  type TabRouterOptions,
  useNavigationBuilder,
} from '@react-navigation/native';
import { WebBar } from './web-bar';
import { Scrollbar } from './scroll-bar';
import { RightPanel } from './right-panel';

// Props accepted by the view
type TabNavigationConfig = {
  tabBarStyle: StyleProp<ViewStyle>;
  contentStyle: StyleProp<ViewStyle>;
};

// Supported screen options
type TabNavigationOptions = {
  title?: string;
};

// Map of event name and the type of data (in event.data)
//
// canPreventDefault: true adds the defaultPrevented property to the
// emitted events.
type TabNavigationEventMap = {
  tabPress: {
    data: { isAlreadyFocused: boolean };
    canPreventDefault: true;
  };
};

// The props accepted by the component is a combination of 3 things
type Props<Navigation> = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  TabNavigationState<ParamListBase>,
  TabNavigationOptions,
  TabNavigationEventMap,
  Navigation
> &
  TabRouterOptions &
  TabNavigationConfig;

function WebNavigator<Navigation>({
  id,
  initialRouteName,
  children,
  layout,
  screenListeners,
  screenOptions,
  screenLayout,
  backBehavior,
  tabBarStyle,
}: Props<Navigation>) {
  const { state, navigation, descriptors, NavigationContent } =
    useNavigationBuilder<
      TabNavigationState<ParamListBase>,
      TabRouterOptions,
      TabActionHelpers<ParamListBase>,
      TabNavigationOptions,
      TabNavigationEventMap
    >(TabRouter, {
      id,
      initialRouteName,
      children,
      layout,
      screenListeners,
      screenOptions,
      screenLayout,
      backBehavior,
    });

  const { width: windowWidth } = useWindowDimensions();

  return (
    <NavigationContent>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        {windowWidth >= 768 &&
          <View style={{ height: '100%', flex: 1, minWidth: 280 }}>
            <WebBar
              state={state}
              navigation={navigation}
              tabBarStyle={tabBarStyle}
              descriptors={descriptors}
            />
          </View>
        }
        <View style={{ height: '100%', flex: 3, maxWidth: windowWidth < 768 ? undefined : 600 }}>
          {state.routes.map((route, i) => {
            return (
              <View
                key={route.key}
                style={[
                  StyleSheet.absoluteFill,
                  {
                    paddingHorizontal: windowWidth < 768 ? 0 : 20,
                    display: i === state.index ? 'flex' : 'none',
                    borderRightWidth: windowWidth < 768 ? 0 : 1,
                    borderColor: 'black',
                  },
                ]}
              >
                {descriptors[route.key].render()}
              </View>
            );
          })}
        </View>
        {windowWidth > 1100 &&
          <View style={{ height: '100%', flex: 1 }}>
            <RightPanel/>
          </View>
        }
        <Scrollbar/>
      </View>
    </NavigationContent>
  );
};

function createWebNavigator(config?: any) {
  return createNavigatorFactory(WebNavigator)(config);
}

export {
  createWebNavigator,
};
