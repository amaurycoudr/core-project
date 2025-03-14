import { useApiClient, useSetTokens } from '@/hooks/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
export default function HomeScreen() {
    const [connected, setConnected] = useState(false);
    const client = useApiClient();
    const setTokens = useSetTokens();

    const signIn = useMutation({
        mutationFn: client.auth.signIn,
        onSuccess: ({ body, status }) => {
            if (status === 200) {
                setTokens(body);
                setConnected(true);
            }
        },
    });
    return (
        <>
            <Stack.Screen options={{ title: 'Test r!' }} />
            <View style={styles.container}>
                {connected ? (
                    <Link href={'/card'}>
                        <Text>Card</Text>
                    </Link>
                ) : (
                    <Button
                        onPress={() => {
                            signIn.mutate({
                                body: {
                                    email: 'user@example.com',
                                    password: 'stringst',
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});
