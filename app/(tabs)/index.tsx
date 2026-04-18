import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { categories } from "../../src/data/categories";
import { languages } from "../../src/data/languages";
import { phrases } from "../../src/data/phrases";
import { handleSpeak } from "../../src/utils/handleSpeak";

type Screen = "language" | "categories" | "phrases";

export default function App() {
  const [screen, setScreen] = useState<Screen>("language");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLanguageLabel = (code: string | null) => {
    return languages.find((l) => l.code === code)?.label || code;
  };

  const getCategoryLabel = (id: string | null) => {
    return categories.find((c) => c.id === id)?.label || id;
  };

  const renderHeader = (title: string, subtitle?: string) => (
    <View style={styles.headerBox}>
      <Text style={styles.appName}>VakaTulkki</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );

  const onPhrasePress = async (text: string) => {
    if (!selectedLanguage) return;

    try {
      setIsLoading(true);
      await handleSpeak(text, selectedLanguage);
    } catch (error) {
      console.error("Puheen toisto epäonnistui:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 KIELIVALINTA
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

  // 🔹 KATEGORIAT
  if (screen === "categories") {
    if (!selectedLanguage) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          {renderHeader("Kieli puuttuu")}

          <Pressable
            style={styles.button}
            onPress={() => setScreen("language")}
          >
            <Text style={styles.buttonText}>← Takaisin kielivalintaan</Text>
          </Pressable>
        </ScrollView>
      );
    }

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
          onPress={() => {
            setSelectedCategory(null);
            setScreen("language");
          }}
        >
          <Text style={styles.buttonText}>← Vaihda kieli</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // 🔹 FRAASIT
  if (screen === "phrases") {
    if (!selectedLanguage) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          {renderHeader("Kieli puuttuu")}

          <Pressable
            style={styles.button}
            onPress={() => setScreen("language")}
          >
            <Text style={styles.buttonText}>← Takaisin kielivalintaan</Text>
          </Pressable>
        </ScrollView>
      );
    }

    if (!selectedCategory) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          {renderHeader("Kategoria puuttuu")}

          <Pressable
            style={styles.button}
            onPress={() => setScreen("categories")}
          >
            <Text style={styles.buttonText}>← Takaisin kategorioihin</Text>
          </Pressable>
        </ScrollView>
      );
    }

    const filteredPhrases = phrases.filter(
      (p) => p.category === selectedCategory,
    );

    return (
      <View style={styles.screenWrapper}>
        <ScrollView contentContainerStyle={styles.container}>
          {renderHeader(
            "Fraasit",
            `Kategoria: ${getCategoryLabel(
              selectedCategory,
            )} • Kieli: ${getLanguageLabel(selectedLanguage)}`,
          )}

          {filteredPhrases.map((p) => (
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
            disabled={isLoading}
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

// 🎨 STYLES
const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
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
    shadowColor: "#B7DDF7",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    color: "#3B6E8F",
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    color: "#2F5D7A",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
    color: "#5F7F95",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: "center",
    elevation: 6,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#3B6E8F",
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 16,
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
});
