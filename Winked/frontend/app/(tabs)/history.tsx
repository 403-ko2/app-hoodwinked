import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { deleteHistoryEntry, getHistory, resolvePersonaImage, type HistoryItem } from "../../services/api";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedOutputId, setCopiedOutputId] = useState<string | null>(null);

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");
      const result = await getHistory(100);
      setHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const toggleExpanded = (key: string) => {
    setExpandedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDelete = async (entry: HistoryItem) => {
    try {
      setDeletingId(entry.id);
      await deleteHistoryEntry(entry.id);
      setHistory((prev) => prev.filter((item) => item.id !== entry.id));
      await loadHistory(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete history entry";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyOutput = async (entry: HistoryItem) => {
    if (!entry.outputText) return;
    await Clipboard.setStringAsync(entry.outputText);
    setCopiedOutputId(entry.id);
    setTimeout(() => {
      setCopiedOutputId((prev) => (prev === entry.id ? null : prev));
    }, 1400);
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const inputKey = `${item.id}-input`;
    const outputKey = `${item.id}-output`;
    const isInputExpanded = !!expandedFields[inputKey];
    const isOutputExpanded = !!expandedFields[outputKey];
    const createdAtLabel = new Date(item.createdAt).toLocaleString();
    const personaImage = resolvePersonaImage(item.personaName, item.personaImageUrl);

    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Image
            source={personaImage}
            style={{ width: 42, height: 42, borderRadius: 21, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{item.personaName}</Text>
            <Text style={{ fontSize: 12, color: colors.text }}>{createdAtLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            disabled={deletingId === item.id}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: "#ffe5e5",
            }}
          >
            <Text style={{ color: "#b00020", fontWeight: "600" }}>
              {deletingId === item.id ? "Deleting..." : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 12, color: colors.text, marginBottom: 4 }}>Input</Text>
        <TouchableOpacity onPress={() => toggleExpanded(inputKey)} activeOpacity={0.7}>
          <Text numberOfLines={isInputExpanded ? undefined : 2} style={{ marginBottom: 8, color: colors.text }}>
            {item.inputText || "(empty)"}
          </Text>
          <Text style={{ color: "#6a1b9a", marginBottom: 10 }}>
            {isInputExpanded ? "Show less" : "Show full input"}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#efe7f8",
            borderRadius: 10,
            padding: 10,
            backgroundColor: colors.background,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: colors.text, flex: 1 }}>Output</Text>
            <TouchableOpacity onPress={() => copyOutput(item)} hitSlop={8} style={{ padding: 4 }}>
              <Ionicons name="copy-outline" size={18} color="#6a1b9a" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => toggleExpanded(outputKey)} activeOpacity={0.7}>
            <Text numberOfLines={isOutputExpanded ? undefined : 3} style={{ color: colors.text }}>
              {item.outputText || "(empty)"}
            </Text>
            <Text style={{ color: "#6a1b9a", marginTop: 6 }}>
              {isOutputExpanded ? "Show less" : "Show full output"}
            </Text>
          </TouchableOpacity>
          {copiedOutputId === item.id ? (
            <Text style={{ color: "#2e7d32", fontSize: 12, marginTop: 4 }}>Copied</Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color="#6a1b9a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12, color: colors.text }}>History</Text>
      {error ? (
        <Text style={{ color: "#b00020", marginBottom: 10 }}>{error}</Text>
      ) : null}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} />}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#666" }}>
            No rewrite history yet.
          </Text>
        }
      />
    </View>
  );
}
