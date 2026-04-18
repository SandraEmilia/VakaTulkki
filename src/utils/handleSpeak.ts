import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

const BACKEND_URL = "http://192.168.1.3:3001";

function makeCacheKey(text: string, lang: string) {
  const safeText = text
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll(/[^\p{L}\p{N}_-]/gu, "");

  return `${lang}_${safeText}`;
}

export async function handleSpeak(text: string, lang: string) {
  try {
    const cachekey = makeCacheKey(text, lang);
    const fileUri = FileSystem.cacheDirectory + `${cachekey}.mp3`;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (fileInfo.exists) {
      console.log("Audio löytyi cachesta", fileUri);

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      return;
    }

    console.log("Audio haetaan backendistä");

    const response = await fetch(`${BACKEND_URL}/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, lang }),
    });

    if (!response.ok) {
      throw new Error("Backend response was not OK");
    }

    const data = await response.json();

    if (!data.audioBase64) {
      throw new Error("Audioa ei palautunut backendilta");
    }

    await FileSystem.writeAsStringAsync(fileUri, data.audioBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error("handleSpeak error:", error);
  }
}
