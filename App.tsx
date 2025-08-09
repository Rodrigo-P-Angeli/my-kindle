import * as React from "react";
import { ReaderProvider } from "@epubjs-react-native/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Main from "./src/screens/Main";
import Book from "./src/screens/Book/Index";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <NavigationContainer>
      <ReaderProvider>
        <RootStack />
      </ReaderProvider>
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Main}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Book"
        component={Book}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export type RootStackParamList = {
  Home: undefined;
  Book: { fileUrl: string, bookName: string };
};
