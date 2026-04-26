import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

const BACKEND_URL = "https://vakatulkki.onrender.com";

// pidetään muistissa viimeisin ääni
let currentSound: Audio.Sound | null = null;

// tehdään turvallinen tiedostonimi
function makeCacheKey(text: string, lang: string) {
  const safeText = text
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll(/[^\p{L}\p{N}_-]/gu, "");

  return `${lang}_${safeText}`;
}

async function stopCurrentSound() {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (error) {
      console.error("Äänen pysäytys epäonnistui:", error);
    } finally {
      currentSound = null;
    }
  }
}

export async function handleSpeak(text: string, lang: string) {
  const cacheKey = makeCacheKey(text, lang);
  const fileUri = FileSystem.cacheDirectory + `${cacheKey}.mp3`;

  // pysäytä vanha ääni aina ennen uuden aloittamista
  await stopCurrentSound();

  // 1. Jos tiedosto löytyy cachesta, soita se heti
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (fileInfo.exists) {
    console.log("Audio löytyi cachesta:", fileUri);

    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    currentSound = sound;

    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        sound.unloadAsync();
        if (currentSound === sound) {
          currentSound = null;
        }
      }
    });

    return;
  }

  // 2. Muuten hae backendilta
  console.log("Audio haetaan backendilta");

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

  // 3. Tallenna cacheen
  await FileSystem.writeAsStringAsync(fileUri, data.audioBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 4. Soita tallennettu tiedosto
  const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
  currentSound = sound;

  await sound.playAsync();

  sound.setOnPlaybackStatusUpdate((status) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      sound.unloadAsync();
      if (currentSound === sound) {
        currentSound = null;
      }
    }
  });
}
