import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

// Initialize Stripe with correct API version (using any to bypass strict typing)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get request data
    const { priceId, cartItems } = await req.json();
    
    // Validate priceId
    if (!priceId) {
      return NextResponse.json({ error: "Missing price ID" }, { status: 400 });
    }
    
    // Get BASE_URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    console.log("Creating checkout session with:", {
      priceId,
      itemCount: cartItems?.length || 0,
      userEmail: session.user.email,
      baseUrl
    });
    
    // Create a Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: {
        formIds: JSON.stringify((cartItems || []).map((item: { formId: string }) => item.formId)),
        itemCount: String((cartItems || []).length)
      },
      customer_email: session.user.email,
    });
    
    console.log("Checkout session created:", {
      sessionId: stripeSession.id,
      url: stripeSession.url
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    // Return more detailed error for debugging
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: "Stripe Error", 
          message: error.message,
          code: error.code,
          type: error.type
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Error creating checkout session", message: String(error) },
      { status: 500 }
    );
  }
} 