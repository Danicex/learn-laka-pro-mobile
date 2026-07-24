import { Stack } from "expo-router";
import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import '../global.css'

export default function RootLayout() {
  return (
      <Stack
      screenOptions={{
        headerTitle: () => (
          <Link href="/" asChild>
            <Pressable>
              <Text style={{ fontWeight: "bold" }}>llpro</Text>
            </Pressable>
          </Link>
        ),
      }}
    >
    </Stack>
  );
}
