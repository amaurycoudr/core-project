import Card from "@/components/Card";
import { useApiClient } from "@/hooks/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Modal,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
} from "react-native";

export default function CardScreen() {
	const client = useApiClient();
	const [searchQuery, setSearchQuery] = useState("");
	const { data: searchData } = useQuery({
		queryFn: () => client.movie.search({ query: { query: searchQuery } }),
		queryKey: ["movie", "search", searchQuery],
		enabled: searchQuery.length > 1,
		select: ({ status, body }) => {
			if (status !== 200) {
				return [];
			}
			return body.list;
		},
	});
	const [card, setCard] = useState<NonNullable<typeof searchData>[number] | undefined>(undefined);

	return (
		<>
			<SafeAreaView style={styles.container}>
				<TextInput
					onChange={(value) => {
						setSearchQuery(value.nativeEvent.text);
					}}
					placeholder="Test"
					style={{
						padding: 12,
						borderWidth: 1,
						borderColor: "grey",
					}}
					value={searchQuery}
				/>
				<ScrollView>
					{searchData?.map((cardInput) => {
						const { title, tmdbId } = cardInput;
						return (
							<TouchableOpacity
								onPress={() => {
									setCard(cardInput);
								}}
								style={{
									padding: 12,
									borderTopWidth: 1,
									borderBottomWidth: 1,
									borderColor: "grey",
								}}
								key={tmdbId}
							>
								<Text>{title}</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
				<Modal visible={!!card} transparent animationType="fade">
					<Pressable
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: "rgba(0,0,0,0.30)",
						}}
						onPress={() => {
							setCard(undefined);
						}}
					>
						<Card title={card?.title ?? ""} posterUrl={card?.posterUrl} />
					</Pressable>
				</Modal>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 2,
		padding: 20,
	},
	link: {
		marginTop: 15,
		paddingVertical: 15,
	},
});
