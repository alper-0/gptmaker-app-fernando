import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1 },
  header: {
    backgroundColor: "#1a1a2e",
    padding: 16,
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { color: "#aaa", fontSize: 13, marginTop: 2 },
  listContent: { padding: 12 },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
  },
  userMessageContainer: { alignSelf: "flex-end", backgroundColor: "#1a1a2e" },
  assistantMessageContainer: { alignSelf: "flex-start", backgroundColor: "#e0e0e0" },
  messageText: { fontSize: 15, color: "#333" },
  userMessageText: { color: "#fff" },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  inputArea: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: "center",
  },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      text:"Olá! Posso te ajudar com o agendamento na Barbearia ????. Me diga o que você deseja.",
    },
  ])
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const apiURL = process.env.EXPO_PUBLIC_API_URL;
  const contextId = "sessao-anonima-app";

  async function handleSend(){
    const text = input.trim();
    if (!text || loading ) return;
    Keyboard.dismiss();

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text,
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    const apiURL =
      Platform.OS === "android"
      ? "http://10.244.134.77:3000"
      : "http://127.0.0.1:3000";
    
    try {
      /**
      * fetch
      * faz uma requisição HTTP par ao backend da aplicação
      * Neste caso:
      * - método POST
      * - URL {apiURL/chat}
      * - header: informa que estamos enviando JSON
      * - body: converte o objeto Javascript JSON
      **/
      const response = await fetch(`${apiURL}/api/chat`,{
        method: "POST",
        headers:{
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          message:text,
          contextId,
        })
      });

      /*
      * response.json()
      * Converte o corpo da resposta da API em objeto Javascript
      * 
      * Exemplo esperado:
      * {
      * "message": "Olá Qual barberio você prefere? "
      * }
      **/
     const data = await response.json()

     /**
      * Se a API devolver um campo "message", usamos esse texto.
      * Caso contrário, mostramos uma mensagem padrão de fallback.
      */
     const assistantText =
      data?.message || "Desculpe, não consegui obter resposta agora...";

    /**
     * Monta a mensagem do assistente no mesmo padrão usado pelo chat.
     */
    const assistantMessage: ChatMessage = {
      id: String(Date.now() +1),
      role: "assistant",
      text: assistantText,
    }
    /**
     * Adiciona a resposta do assistente à lista de mensagem
     */
    setMessages( (prev) => [...prev, assistantMessage])   

    } catch (error){
        const errorMessage: ChatMessage = {
          id: String(Date.now() + 2),
          role: "assistant",
          text: "Ocorreu um erro ao conectar com o servidor",
        };
        setMessages((prev) => [...prev, errorMessage])

    } finally {
      setLoading(false);
      setTimeout( () => {
        flatListRef.current?.scrollToEnd({animated: true})
      })
    }
  }

  /* 
  * Função usada pelo FlatList para desenhar cada mensagem
  */
  function renderItem({ item }: { item: ChatMessage}){
    const isUser = item.role === 'user'
    return(
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer: styles.assistantMessageContainer,
      ]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.text}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top","bottom"]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS ==="ios" ? "padding": "height"}>
        {/* Cabeçalho do App */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Barbearia Agenda</Text>
          <Text style={styles.headerSubtitle}>Assistente Virtual</Text>
        </View>
        {/* Lista de mensagens */}
        <FlatList 
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />

        {/* Indicador visual enquanto aguarda a resposta da API */}
        { loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
            <Text style={styles.loadingBox}>Aguarde ...</Text>
          </View>
        )}
        {/* Área inferior com input e botão de envio */}
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.input}
            placeholder='Ex.: Quero agendar um horário'
            value={input}
            onChangeText={setInput}
            multiline
            />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={loading}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
        
      </KeyboardAvoidingView>
    </SafeAreaView>

  );


}
