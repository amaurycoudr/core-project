import { contract } from "@repo/contract";
import { type InitClientReturn, initClient } from "@ts-rest/core";
import { jwtDecode } from "jwt-decode";
import { type ReactNode, createContext, useContext, useEffect } from "react";
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";
type ApiClientType = InitClientReturn<
	typeof contract,
	{ baseUrl: "http://localhost:3001/"; throwOnUnknownStatus: true }
>;

type Tokens = {
	accessToken: string;
	refreshToken: string;
};

type ApiClientContextType = {
	apiClient: ApiClientType;
	isSignIn: boolean;
	setTokens: (arg: Tokens) => void;
};

const ClientContext = createContext(null as unknown as ApiClientContextType);

const storage = new MMKVLoader().initialize();

export const ApiClientContextProvider = ({ children }: { children: ReactNode }) => {
	const [tokens, setTokens] = useMMKVStorage<Tokens | { accessToken: undefined; refreshToken: undefined }>(
		"tokens",
		storage,
		{
			accessToken: undefined,
			refreshToken: undefined,
		},
	);

	const apiClient = initClient(contract, {
		baseUrl: "http://localhost:3001",
		baseHeaders: {
			authorization: tokens.accessToken ? `Bearer ${tokens.accessToken}` : "",
		},
		throwOnUnknownStatus: true,
	});

	useEffect(() => {
		const interval = setInterval(() => {
			if (!tokens.accessToken) return;
			const { exp } = jwtDecode(tokens.accessToken);
			const isExpired = exp! * 1000 - 60_000 * 5 < Date.now();

			if (isExpired) {
				void apiClient.auth.refreshTokens({ body: { refreshToken: tokens.refreshToken } }).then((response) => {
					if (response.status === 200) {
						setTokens(response.body);
					}
				});
			}
		}, 60_000);

		return () => {
			clearInterval(interval);
		};
	}, [tokens.accessToken, tokens.refreshToken, apiClient.auth.refreshTokens, setTokens]);

	return (
		<ClientContext.Provider value={{ apiClient, setTokens, isSignIn: !!tokens.accessToken }}>
			{children}
		</ClientContext.Provider>
	);
};

export const useApiClient = () => {
	return useContext(ClientContext).apiClient;
};
export const useIsSignIn = () => {
	return useContext(ClientContext).isSignIn;
};

export const useSetTokens = () => {
	return useContext(ClientContext).setTokens;
};
