import { ApiClientContextProvider } from "@/hooks/apiClient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
	const queryClient = new QueryClient();
	return (
		<GestureHandlerRootView>
			<ApiClientContextProvider>
				<QueryClientProvider client={queryClient}>
					<Stack>
						<Stack.Screen name="index" options={{ headerShown: false }} />
						<Stack.Screen name="card" />
						<Stack.Screen name="+not-found" />
					</Stack>
					<StatusBar style="auto" />
				</QueryClientProvider>
			</ApiClientContextProvider>
		</GestureHandlerRootView>
	);
}
