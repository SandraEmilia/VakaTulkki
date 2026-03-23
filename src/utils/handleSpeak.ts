import * as Speech from "expo-speech";

export async function handleSpeak(text: string) {
  Speech.speak(text);
}
