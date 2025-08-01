import * as React from "react";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { Reader, useReader, Themes, Location } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden, StatusBar } from "expo-status-bar";
const fontIncrease = 10;

type Props = NativeStackScreenProps<RootStackParamList, "Book">;

export default function Book({ route }: Props) {
  const {
    goToLocation,
    currentLocation,
    totalLocations,
    theme,
    section,
    changeFontSize,
  } = useReader();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = React.useState(true);
  const [loadingBook, setLoadingBook] = React.useState(true);
  const [showButtons, setShowButtons] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(100);
  const [currentLocations, setcurrentLocation] =
    React.useState<Location | null>();
  const [locationTostart, setLocationToStart] = React.useState<string>("");

  React.useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    setStatusBarHidden(true);
    return () => {
      NavigationBar.setVisibilityAsync("visible");
      setStatusBarHidden(false);
    };
  }, []);

  React.useEffect(() => {
    if (currentLocation) {
      setcurrentLocation(currentLocation);
    }
  }, [currentLocation, totalLocations]);

  React.useEffect(() => {
    setLoading(true);
    const retriveData = async () => {
      const data = await AsyncStorage.getItem(
        "BookProgress" + route.params.fileUrl
      );
      if (data) {
        const dataParsed = JSON.parse(data);
        changeFontSize(dataParsed.fontSize + "%");
        setFontSize(dataParsed.fontSize);
        setLocationToStart(dataParsed.onReturn);
      }
      setLoading(false);
    };
    retriveData();
  }, []);

  React.useEffect(() => {
    console.log({
      fontSize,
      onReturn: currentLocations?.start.cfi,
      currentLocations,
    });

    AsyncStorage.setItem(
      "BookProgress" + route.params.fileUrl,
      JSON.stringify({
        fontSize,
        onReturn: currentLocations?.start.cfi,
      })
    );
  }, [fontSize, currentLocations?.start.cfi]);

  if (!route.params.fileUrl) {
    return <SafeAreaView style={{ flex: 1 }}></SafeAreaView>;
  }

  const increaseFontSize = () => {
    changeFontSize(fontSize + fontIncrease + "%");
    setFontSize(fontSize + fontIncrease);
  };

  const decreaseFontSize = () => {
    changeFontSize(fontSize - fontIncrease + "%"); // Example: Decrease font size by 20%
    setFontSize(fontSize - fontIncrease);
  };

  if (loading) {
    return <View></View>;
  }

  const tap = Gesture.LongPress()
    .onEnd(() => {
      setShowButtons(!showButtons);
    })
    .runOnJS(true);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: theme.body.background,
        }}
      >
        {showButtons && (
          <>
            <View style={{ height: 40 }} />
            <Button title="Increase Font Size" onPress={increaseFontSize} />
          </>
        )}
        {showButtons && (
          <Button title="Decrease Font Size" onPress={decreaseFontSize} />
        )}
        <GestureDetector gesture={tap}>
          <View style={{ flex: 1 }}>
            <View collapsable={false} style={{ flex: 1 }}>
              <Reader
                defaultTheme={Themes.DARK}
                src={route.params.fileUrl}
                fileSystem={useFileSystem}
                onLocationsReady={() => {
                  setLoadingBook(false);
                  changeFontSize(fontSize + "%");
                  goToLocation(locationTostart);
                }}
                injectedJavascript={INJECTEDJAVASCRIPT}
              />
            </View>
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 5,
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <Text style={{ color: "white" }}>
                Página {currentLocations?.start?.location ?? 0} de {totalLocations}
              </Text>
              <Text style={{ color: "white" }}>
                {(currentLocations?.start?.percentage
                  ? currentLocations?.start?.percentage * 100
                  : 0
                ).toFixed(0)}
                %
              </Text>
            </View>
            {loadingBook && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <ActivityIndicator color={"white"} size={"large"} />
              </View>
            )}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const INJECTEDJAVASCRIPT = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `;
