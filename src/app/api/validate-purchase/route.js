import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/config";
import { PRICING_PLANS } from "@/lib/pricing";

export async function POST(request) {
	try {
		// Get the authenticated user from Clerk
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { priceId, planKey } = body;

		if (!priceId) {
			return NextResponse.json(
				{ error: "Price ID is required" },
				{ status: 400 },
			);
		}

		// Get user's current entitlements
		if (!API_CONFIG.INTERNAL_SECRET) {
			console.error("Missing INTERNAL_API_SECRET environment variable");
			return NextResponse.json(
				{ error: "Configuration error" },
				{ status: 500 },
			);
		}

		console.log(
			"Validating purchase for user:",
			userId,
			"priceId:",
			priceId,
			"planKey:",
			planKey,
		);

		// Fetch current entitlements from backend
		const entitlementsResponse = await fetch(
			API_CONFIG.getWorkerUrl(`/entitlements/${userId}`),
			{
				method: "GET",
				headers: API_CONFIG.getInternalHeaders(),
			},
		);

		let currentEntitlements = {
			plan: "free",
			status: "none",
		};

		if (entitlementsResponse.ok) {
			const data = await entitlementsResponse.json();
			currentEntitlements = data.entitlements || currentEntitlements;
		}

		// Determine target plan from priceId or planKey
		let targetPlan = planKey;
		if (!targetPlan) {
			for (const [key, plan] of Object.entries(PRICING_PLANS)) {
				if (plan.priceId === priceId) {
					targetPlan = key.toLowerCase();
					break;
				}
			}
		}

		if (!targetPlan || targetPlan === "unknown") {
			return NextResponse.json(
				{ error: "Invalid price ID or plan key" },
				{ status: 400 },
			);
		}

		// Check if user already has an active subscription
		const hasActiveSubscription = ["active", "trialing"].includes(
			currentEntitlements.status,
		);
		const currentPlan = currentEntitlements.plan || "free";

		// Define plan hierarchy for upgrade validation
		const planHierarchy = { free: 0, pro: 1, business: 2 };
		const canUpgrade = planHierarchy[targetPlan] > planHierarchy[currentPlan];

		// Validation logic
		if (hasActiveSubscription && targetPlan === currentPlan) {
			return NextResponse.json({
				valid: false,
				reason: "already_subscribed",
				message: `You already have an active ${currentPlan} subscription`,
				currentPlan,
				targetPlan,
				hasActiveSubscription,
			});
		}

		if (hasActiveSubscription && !canUpgrade) {
			return NextResponse.json({
				valid: false,
				reason: "downgrade_not_allowed",
				message: `You cannot downgrade from ${currentPlan} to ${targetPlan}. Please cancel your current subscription first.`,
				currentPlan,
				targetPlan,
				hasActiveSubscription,
			});
		}

		// Purchase is valid
		const isUpgrade = hasActiveSubscription && canUpgrade;

		return NextResponse.json({
			valid: true,
			reason: isUpgrade ? "valid_upgrade" : "valid_new_subscription",
			message: isUpgrade
				? `Valid upgrade from ${currentPlan} to ${targetPlan}`
				: `Valid new ${targetPlan} subscription`,
			currentPlan,
			targetPlan,
			hasActiveSubscription,
			isUpgrade,
		});
	} catch (error) {
		console.error("Error validating purchase:", {
			error: error.message,
			stack: error.stack,
		});

		return NextResponse.json(
			{
				valid: false,
				reason: "server_error",
				message: "Failed to validate purchase. Please try again.",
				error: error.message,
			},
			{ status: 500 },
		);
	}
}
