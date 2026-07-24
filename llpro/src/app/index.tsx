// src/app/index.tsx
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import BottomNav from "./components/BottomNav";
import HomeFeed from "./home/HomeFeed";
import Library from "./library/Library";
import Profile from "./profile/Profile";
import UserTest from "./user_test/UserTest";


type TabKey = "home" | "library" | "quiz" | "profile";

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeTab === "home" && <HomeFeed />}
        {activeTab === "library" && <Library />}
        {activeTab === "quiz" && <UserTest />}
        {activeTab === "profile" && <Profile />}
      </View>

      <BottomNav
        active={activeTab}
        onChange={setActiveTab}
        onPressCenter={() => console.log("open new chat / action sheet")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});