import React, { useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};


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
      ? "http://10.53.54.24:3000"
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

  );}

  const styles = StyleSheet.create({

  safe: {

    flex: 1,

    backgroundColor: "#111827",

  },

  container: {

    flex: 1,

  },

  header: {

    paddingHorizontal: 16,

    paddingTop: 18,

    paddingBottom: 12,

    borderBottomWidth: 1,

    borderBottomColor: "#1f2937",

  },

  headerTitle: {

    color: "#fff",

    fontSize: 22,

    fontWeight: "700",

  },

  headerSubtitle: {

    color: "#9ca3af",

    fontSize: 14,

    marginTop: 4,

  },

  listContent: {

    padding: 16,

    gap: 12,

  },

  messageContainer: {

    maxWidth: "85%",

    padding: 12,

    borderRadius: 14,

  },

  userMessageContainer: {

    alignSelf: "flex-end",

    backgroundColor: "#2563eb",

  },

  assistantMessageContainer: {

    alignSelf: "flex-start",

    backgroundColor: "#1f2937",

  },

  messageText: {

    color: "#fff",

    fontSize: 15,

    lineHeight: 22,

  },

  userMessageText: {

    color: "#fff",

  },

  loadingBox: {

    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    paddingHorizontal: 16,

    paddingBottom: 8,

  },

  loadingText: {

    color: "#d1d5db",

  },

  inputArea: {

    flexDirection: "row",

    alignItems: "flex-end",

    padding: 12,

    borderTopWidth: 1,

    borderTopColor: "#1f2937",

    backgroundColor: "#111827",

    gap: 8,

  },

  input: {

    flex: 1,

    minHeight: 48,

    maxHeight: 120,

    backgroundColor: "#fff",

    borderRadius: 12,

    paddingHorizontal: 12,

    paddingVertical: 10,

    fontSize: 15,

  },

  sendButton: {

    backgroundColor: "#22c55e",

    paddingHorizontal: 16,

    paddingVertical: 14,

    borderRadius: 12,

  },

  sendButtonText: {

    color: "#111827",

    fontWeight: "700",

  },

});

