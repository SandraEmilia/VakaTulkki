import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { categories } from "../../src/data/categories";
import { languages } from "../../src/data/languages";
import { phrases } from "../../src/data/phrases";
import { handleSpeak } from "../../src/utils/handleSpeak";

type Screen = "language" | "categories" | "phrases";

export default function App() {
  const [screen, setScreen] = useState<Screen>("language");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (screen === "language") {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.appName}>VakaTulkki</Text>
          <Text style={styles.title}>Valitse kieli</Text>
        </View>

        {languages.map((language) => (
          <Pressable
            key={language.code}
            style={styles.button}
            onPress={() => {
              setSelectedLanguage(language.code);
              setScreen("categories");
            }}
          >
            <Text style={styles.buttonText}>{language.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  if (screen === "categories") {
    if (!selectedLanguage) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerBox}>
            <Text style={styles.appName}>VakaTulkki</Text>
            <Text style={styles.title}>Valitse kategoria</Text>
            <Text style={styles.subtitle}>Kieli: {selectedLanguage}</Text>
          </View>

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
        <Text style={styles.title}>Valitse kategoria</Text>
        <Text style={styles.subtitle}>Kieli: {selectedLanguage}</Text>

        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={styles.button}
            onPress={() => {
              setSelectedCategory(category.id);
              setScreen("phrases");
            }}
          >
            <Text style={styles.buttonText}>{category.label}</Text>
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

  if (screen === "phrases") {
    if (!selectedLanguage) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerBox}>
            <Text style={styles.appName}>VakaTulkki</Text>
            <Text style={styles.title}>Fraasit</Text>
            <Text style={styles.subtitle}>
              Kategoria: {selectedCategory} • Kieli: {selectedLanguage}
            </Text>
          </View>

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
          <Text style={styles.title}>Kategoria puuttuu</Text>

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
      (phrase) => phrase.category === selectedCategory,
    );

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Fraasit</Text>
        <Text style={styles.subtitle}>
          Kategoria: {selectedCategory} • Kieli: {selectedLanguage}
        </Text>

        {filteredPhrases.map((phrase) => (
          <Pressable
            key={phrase.id}
            style={styles.button}
            onPress={() => handleSpeak(phrase.fi, selectedLanguage)}
          >
            <Text style={styles.buttonText}>{phrase.fi}</Text>
          </Pressable>
        ))}

        <Pressable
          style={[styles.button, styles.backButton]}
          onPress={() => setScreen("categories")}
        >
          <Text style={styles.buttonText}>← Takaisin kategorioihin</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return null;
}

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
    marginBottom: 18,
    textAlign: "center",
    color: "#5F7F95",
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginVertical: 8,
    shadowColor: "#B7DDF7",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
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
