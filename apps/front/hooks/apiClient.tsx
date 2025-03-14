import { contract } from "@repo/contract";
import { type InitClientReturn, initClient } from "@ts-rest/core";
import { jwtDecode } from "jwt-decode";
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";

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
	setTokens: (arg: Tokens) => void;
};

const ClientContext = createContext(null as unknown as ApiClientContextType);

export const ApiClientContextProvider = ({ children }: { children: ReactNode }) => {
	const [tokens, setTokens] = useState<
		{ accessToken: string; refreshToken: string } | { accessToken: undefined; refreshToken: undefined }
	>({
		accessToken: undefined,
		refreshToken: undefined,
	});
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
	}, [tokens.accessToken, tokens.refreshToken, apiClient.auth.refreshTokens]);

	return <ClientContext.Provider value={{ apiClient, setTokens }}>{children}</ClientContext.Provider>;
};

export const useApiClient = () => {
	return useContext(ClientContext).apiClient;
};

export const useSetTokens = () => {
	return useContext(ClientContext).setTokens;
};
