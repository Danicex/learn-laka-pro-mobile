// src/components/BottomNav.tsx
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TabKey = "home" | "library" | "quiz" | "profile";

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "library", label: "library", icon: "library-outline" },
  { key: "quiz", label: "quiz", icon: "quiz-outline" },
  { key: "profile", label: "Profile", icon: "person-outline" },
];

export default function BottomNav({
  active,
  onChange,
  onPressCenter,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  onPressCenter: () => void;
}) {
  return (
    <View style={styles.bar}>
      {tabs.slice(0, 2).map((tab) => (
        <TabButton key={tab.key} tab={tab} active={active} onChange={onChange} />
      ))}

      <Pressable style={styles.centerButton} onPress={onPressCenter}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      {tabs.slice(2).map((tab) => (
        <TabButton key={tab.key} tab={tab} active={active} onChange={onChange} />
      ))}
    </View>
  );
}

function TabButton({ tab, active, onChange }: any) {
  const isActive = active === tab.key;
  return (
    <Pressable style={styles.tab} onPress={() => onChange(tab.key)}>
      <Ionicons name={tab.icon} size={22} color={isActive ? "#000" : "#999"} />
      <Text style={{ color: isActive ? "#000" : "#999", fontSize: 12 }}>{tab.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  tab: { alignItems: "center", gap: 2 },
  centerButton: {
    backgroundColor: "#000",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20, // makes it float above the bar
  },
});