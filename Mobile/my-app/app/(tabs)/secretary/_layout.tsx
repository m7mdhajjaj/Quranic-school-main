import { Stack } from "expo-router";

export default function SecretaryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="students" />
      <Stack.Screen name="teachers" />
      <Stack.Screen name="groups" />
    </Stack>
  );
}
