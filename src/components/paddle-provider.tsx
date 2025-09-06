"use client";

import { initializePaddle } from "@paddle/paddle-js";
import { createContext, useContext, useEffect, useState } from "react";

const PaddleContext = createContext(null);

export function PaddleProvider({ children }) {
	const [paddle, setPaddle] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const environment = process.env.NEXT_PUBLIC_PADDLE_ENV;
		const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

		if (!environment || !token) {
			setError("Paddle environment variables not configured");
			setIsLoading(false);
			return;
		}

		initializePaddle({
			environment: environment as any,
			token,
		})
			.then((paddleInstance) => {
				if (paddleInstance) {
					setPaddle(paddleInstance);
				} else {
					setError("Failed to initialize Paddle");
				}
				setIsLoading(false);
			})
			.catch((err) => {
				setError(`Failed to initialize Paddle: ${err.message}`);
				setIsLoading(false);
			});
	}, []);

	return (
		<PaddleContext.Provider value={{ paddle, isLoading, error }}>
			{children}
		</PaddleContext.Provider>
	);
}

export function usePaddle() {
	const context = useContext(PaddleContext);
	if (context === undefined) {
		throw new Error("usePaddle must be used within a PaddleProvider");
	}
	return context;
}
