import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
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
        <Text style={styles.title}>Valitse kieli</Text>

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
          <Text style={styles.title}>Kieli puuttuu</Text>

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
          <Text style={styles.title}>Kieli puuttuu</Text>

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
            onPress={() => handleSpeak(phrase.fi)}
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    color: "gray",
  },
  button: {
    padding: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginVertical: 8,
  },
  backButton: {
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
  },
});
