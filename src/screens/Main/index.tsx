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
        padding: 30,
        paddingTop: insets.top + 30,
        paddingBottom: insets.bottom,
      }}
    >
      <FlatList
        data={bookList}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <FileImage
            file={item}
            navigation={navigation}
            deleteFile={deleteFile}
          />
        )}
        ItemSeparatorComponent={() => (
          <View
            style={{ backgroundColor: "black", width: "100%", height: 0.5 }}
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
  return (
    <TouchableOpacity
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
    >
      <View
        style={{
          backgroundColor: "#888",
          width: 60,
          height: 60,
          borderRadius: 60,
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "flex-end",
        }}
      >
        <Text style={{ fontSize: 30, color: "white" }}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const FileImage = ({
  file,
  deleteFile,
  navigation,
}: {
  file: BookFileType;
  deleteFile: (fileName: string) => Promise<void>;
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Book", { fileUrl: file.uri });
      }}
      onLongPress={() => deleteFile(file.name)}
    >
      <Text
        numberOfLines={2}
        style={{
          flex: 1,
          width: Dimensions.get("screen").width - 60,
          paddingVertical: 15,
        }}
      >
        {file.name}
      </Text>
    </TouchableOpacity>
  );
};
