import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { categories } from "../src/data/categories";
import { languages } from "../src/data/languages";
import { phrases } from "../src/data/phrases";
import { handleSpeak } from "../src/utils/handleSpeak";

type Screen = "intro" | "language" | "categories" | "phrases";

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ⏱️ Intro timeout
  useEffect(() => {
    if (screen === "intro") {
      const timer = setTimeout(() => {
        setScreen("language");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const getLanguageLabel = (code: string | null) =>
    languages.find((l) => l.code === code)?.label || code;

  const getCategoryLabel = (id: string | null) =>
    categories.find((c) => c.id === id)?.label || id;

  const renderHeader = (title: string, subtitle?: string) => (
    <View style={styles.headerBox}>
      <Text style={styles.appName}>VakaTulkki</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );

  const onPhrasePress = async (text: string) => {
    if (!selectedLanguage) return;
    try {
      setIsLoading(true);
      await handleSpeak(text, selectedLanguage);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  //INTRO
  if (screen === "intro") {
    return (
      <View style={styles.introContainer}>
        <View style={styles.introCloud}>
          <Text style={styles.introTitle}>VakaTulkki</Text>
        </View>
        <Text style={styles.introSubtitle}>
          Monikielisen vuorovaikutuksen tueksi
        </Text>
      </View>
    );
  }

  //LANGUAGE
  if (screen === "language") {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {renderHeader("Valitse kieli")}

        {languages.map((lang) => (
          <Pressable
            key={lang.code}
            style={styles.button}
            onPress={() => {
              setSelectedLanguage(lang.code);
              setSelectedCategory(null);
              setScreen("categories");
            }}
          >
            <Text style={styles.buttonText}>{lang.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  //CATEGORIES
  if (screen === "categories") {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {renderHeader(
          "Valitse kategoria",
          `Kieli: ${getLanguageLabel(selectedLanguage)}`,
        )}

        {categories.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.button, { backgroundColor: item.color }]}
            onPress={() => {
              setSelectedCategory(item.id);
              setScreen("phrases");
            }}
          >
            <Text style={styles.buttonText}>
              {item.icon} {item.label}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={[styles.button, styles.backButton]}
          onPress={() => setScreen("language")}
        >
          <Text style={styles.buttonText}>← Vaihda kieli</Text>
        </Pressable>
      </ScrollView>
    );
  }

  //PHRASES
  if (screen === "phrases") {
    const filtered = phrases.filter((p) => p.category === selectedCategory);

    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {renderHeader(
            "Fraasit",
            `Kategoria: ${getCategoryLabel(
              selectedCategory,
            )} • Kieli: ${getLanguageLabel(selectedLanguage)}`,
          )}

          {filtered.map((p) => (
            <Pressable
              key={p.id}
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
              onPress={() => onPhrasePress(p.fi)}
            >
              <Text style={styles.buttonText}>{p.fi}</Text>
            </Pressable>
          ))}

          <Pressable
            style={[styles.button, styles.backButton]}
            onPress={() => setScreen("categories")}
          >
            <Text style={styles.buttonText}>← Takaisin kategorioihin</Text>
          </Pressable>
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingModal}>
              <ActivityIndicator size="large" color="#3B6E8F" />
              <Text style={styles.loadingText}>Haetaan ääntä...</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  return null;
}

//STYLES
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#EAF6FF",
  },

  headerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
    elevation: 4,
  },

  appName: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    color: "#3B6E8F",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
    color: "#2F5D7A",
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
    color: "#5F7F95",
  },

  button: {
    paddingVertical: 18,
    borderRadius: 18,
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  backButton: {
    marginTop: 20,
    backgroundColor: "#D9EEF9",
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#2F5D7A",
  },

  //LOADING
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingModal: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#3B6E8F",
    fontWeight: "600",
  },

  //INTRO
  introContainer: {
    flex: 1,
    backgroundColor: "#EAF6FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  introCloud: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    paddingVertical: 28,
    paddingHorizontal: 36,
    elevation: 6,
  },

  introTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#3B6E8F",
  },

  introSubtitle: {
    marginTop: 18,
    fontSize: 16,
    color: "#5F7F95",
    textAlign: "center",
  },
});
