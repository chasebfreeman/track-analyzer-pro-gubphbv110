import React from "react";
import { View, ActivityIndicator, Pressable, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import ZoomAnything from "react-native-zoom-anything";

export default function PhotoViewerModal() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url: string }>();

  const imageUrl = typeof url === "string" ? url : "";

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      {/* Close button */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 60,
          left: 18,
          zIndex: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.18)",
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Close</Text>
      </Pressable>

      {/* If no URL, show spinner */}
      {!imageUrl ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ZoomAnything style={{ flex: 1 }}>
  <Image
    source={{ uri: imageUrl }}
    style={{ width: "100%", height: "100%" }}
    contentFit="contain"
    cachePolicy="disk"
  />
</ZoomAnything>

      )}
    </View>
  );
}
