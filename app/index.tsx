import { useState } from "react";


// Componentes do React Native
import {
  Text,
  View,
  StatusBar,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";


// Componentes de Terceiros
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";


// Configurações iniciais
const statusBarHeight = StatusBar.currentHeight;
const KEY_GPT = "SUA CHAVE AQUI";


export default function TravelPlanner() {
  // Estados da aplicação
  const [city, setCity] = useState("");
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [travel, setTravel] = useState("");


  /**
   * Gera o roteiro de viagem usando a API da OpenAI
   */
  async function handleGenerate() {
    // Validação básica do input
    if (!city.trim()) {
      Alert.alert("Atenção", "Preencha o nome da cidade!");
      return;
    }


    // Reset de estados e UI
    setTravel("");
    setLoading(true);
    Keyboard.dismiss();


    // Construção do prompt
    const prompt = `Crie um roteiro para uma viagem de exatos ${days.toFixed(
      0
    )} dias na cidade de ${city}, busque por lugares turisticos,
    lugares mais visitados, seja preciso nos dias de estadia fornecidos e limite o roteiro apenas na cidade fornecida.
    Forneça em tópicos com nome do local onde ir em cada dia. Formate a resposta com marcadores.`;


    // Configuração da requisição
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY_GPT}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
        top_p: 1,
      }),
    };


    /**
     * Lógica de retentativa para requisições à API
     */
    async function fetchWithRetry(retries = 3, delay = 1000) {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            requestOptions
          );
         
          if (response.ok) return await response.json();
         
          if (response.status === 429) {
            Alert.alert("Aviso", "Limite de requisições. Tentando novamente...");
            await new Promise((resolve) =>
              setTimeout(resolve, delay * (i + 1))
            );
          } else {
            throw new Error(`Erro na API: ${response.status}`);
          }
        } catch (error) {
          if (i === retries - 1) throw error;
        }
      }
    }


    // Execução principal
    try {
      const data = await fetchWithRetry();
     
      if (data?.choices?.[0]?.message?.content) {
        setTravel(data.choices[0].message.content);
      } else {
        setTravel("Não foi possível gerar o roteiro. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro crítico:", error);
      Alert.alert("Erro", "Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }


  // Renderização da UI
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor="#F1F1F1"
      />


      {/* Cabeçalho */}
      <Text style={styles.heading}>RoadMap.AI</Text>


      {/* Formulário */}
      <View style={styles.form}>
        <Text style={styles.label}>🏙️ Cidade destino</Text>
        <TextInput
          placeholder="Ex: Rio de Janeiro, RJ"
          style={styles.input}
          value={city}
          onChangeText={setCity}
          accessibilityLabel="Campo para inserir a cidade destino"
        />


        <Text style={styles.label}>
          📅 Tempo de estadia:{" "}
          <Text style={styles.days}>{days} dias</Text>
        </Text>
        <Slider
          minimumValue={1}
          maximumValue={7}
          minimumTrackTintColor="#009688"
          maximumTrackTintColor="#000000"
          value={days}
          onValueChange={(value) => setDays(Math.round(value))}
          accessibilityLabel="Seletor de número de dias"
        />
      </View>


      {/* Botão de ação principal */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={handleGenerate}
        accessibilityLabel="Botão para gerar roteiro"
      >
        <Text style={styles.buttonText}>Gerar Roteiro</Text>
        <MaterialIcons name="travel-explore" size={24} color="#FFF" />
      </Pressable>


      {/* Área de resultados */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.containerScroll}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.content}>
            <Text style={styles.title}>⏳ Gerando seu roteiro...</Text>
            <ActivityIndicator color="#000" size="large" />
          </View>
        ) : travel ? (
          <View style={styles.content}>
            <Text style={styles.title}>✅ Seu Roteiro Perfeito</Text>
            <Text style={styles.travelText}>{travel}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}


// Estilização
const styles = StyleSheet.create({
  // Layout principal
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    paddingTop: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    paddingTop: Platform.OS === "android" ? statusBarHeight : 54,
    color: "#2d3436",
  },


  // Estilos do formulário
  form: {
    backgroundColor: "#FFF",
    width: "90%",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
    color: "#2d3436",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#dfe6e9",
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
  },
  days: {
    color: "#e84393",
    fontWeight: "bold",
  },


  // Botão principal
  button: {
    backgroundColor: "#ff7675",
    width: "90%",
    borderRadius: 8,
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginVertical: 12,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
  },


  // Área de conteúdo
  content: {
    backgroundColor: "#FFF",
    padding: 20,
    width: "100%",
    marginTop: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#2d3436",
  },
  travelText: {
    lineHeight: 24,
    color: "#636e72",
    fontSize: 15,
  },


  // ScrollView
  scrollContent: {
    paddingBottom: 40,
  },
  containerScroll: {
    width: "90%",
    marginTop: 8,
  },
});
