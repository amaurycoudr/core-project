import { useApiClient, useIsSignIn, useSetTokens } from "@/hooks/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
export default function HomeScreen() {
	const client = useApiClient();
	const isSignIn = useIsSignIn();
	const setTokens = useSetTokens();

	const signIn = useMutation({
		mutationFn: client.auth.signIn,
		onSuccess: ({ body, status }) => {
			if (status === 200) {
				setTokens(body);
			}
		},
	});
	return (
		<>
			<View style={styles.container}>
				{isSignIn ? (
					<Link href={"/card"}>
						<Text>Card</Text>
					</Link>
				) : (
					<Button
						onPress={() => {
							signIn.mutate({
								body: {
									email: "user@example.com",
									password: "stringst",
								},
							});
						}}
						title="Test"
					/>
				)}
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	link: {
		marginTop: 15,
		paddingVertical: 15,
	},
});
