import * as React from "react";

import {
  Button,
  FlatList,
  SafeAreaView,
  Image,
  View,
  Pressable,
  Text,
  Dimensions,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Epub from "epubjs";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type BookFileType = { uri: string; name: string };

export default function Main({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [bookList, setBookList] = React.useState<BookFileType[]>([]);
  const addBookList = ({ uri, name }: BookFileType) => {
    if (bookList.map((item) => item.name).includes(name)) {
      return;
    }
    AsyncStorage.setItem(
      "Books",
      JSON.stringify(bookList.concat({ uri, name }))
    );
    setBookList(bookList.concat({ uri, name }));
  };

  React.useEffect(() => {
    const retriveData = async () => {
      const data = await AsyncStorage.getItem("Books");
      if (data) {
        setBookList(JSON.parse(data));
      }
    };
    retriveData();
  }, []);

  const deleteFile = async (fileName: string) => {
    const data = await AsyncStorage.getItem("Books");
    if (data) {
      const cleanList = JSON.parse(data).filter(
        (item: BookFileType) => item.name !== fileName
      );
      await AsyncStorage.setItem("Books", JSON.stringify(cleanList));
      setBookList(cleanList);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "black",
        padding: 0,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom,
      }}
    >
      <FlatList
        data={bookList}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <FileCard
            file={item}
            navigation={navigation}
            deleteFile={deleteFile}
          />
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ItemSeparatorComponent={() => (
          <View
            style={{ backgroundColor: "#222", width: "100%", height: 10 }}
          />
        )}
      />
      <AddBookButton addBookList={addBookList} />
    </SafeAreaView>
  );
}

const AddBookButton = ({
  addBookList,
}: {
  addBookList: (item: BookFileType) => void;
}) => {
  const [pressed, setPressed] = React.useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={async () => {
        try {
          const asdfs = await DocumentPicker.getDocumentAsync();

          if (asdfs.canceled || asdfs.assets.length > 1) {
            return;
          }
          if (asdfs.assets[0].mimeType !== "application/epub+zip") {
            return;
          }
          addBookList({ uri: asdfs.assets[0].uri, name: asdfs.assets[0].name });
        } catch (error) {
          ToastAndroid.show(JSON.stringify(error), ToastAndroid.LONG);
        }
      }}
      style={{
        position: "absolute",
        bottom: 30,
        right: 30,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      }}
    >
      <View
        style={{
          backgroundColor: "#222",
          width: 64,
          height: 64,
          borderRadius: 32,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: "#444",
        }}
      >
        <Text style={{ fontSize: 36, color: "#fff", fontWeight: "bold" }}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const FileCard = ({
  file,
  deleteFile,
  navigation,
}: {
  file: BookFileType;
  deleteFile: (fileName: string) => Promise<void>;
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
}) => {
  const [pressed, setPressed] = React.useState(false);
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Book", { fileUrl: file.uri, bookName: file.name });
      }}
      onLongPress={() => deleteFile(file.name)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        backgroundColor: pressed ? "#333" : "#181818",
        borderRadius: 16,
        padding: 20,
        marginBottom: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      }}
    >
      <Text
        numberOfLines={2}
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
          letterSpacing: 0.5,
        }}
      >
        {file.name}
      </Text>
    </TouchableOpacity>
  );
};
