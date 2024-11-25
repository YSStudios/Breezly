import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // Get the cart items from metadata
      const cartItems = JSON.parse(session.metadata?.cartItems || "[]");
      
      for (const item of cartItems) {
        if (item.offerDetails) {
          const formData = await prisma.formData.findUnique({
            where: { id: item.formId }
          });

          if (formData) {
            await prisma.formData.update({
              where: { id: item.formId },
              data: {
                data: {
                  ...formData.data as any,
                  paymentId: session.id,
                  paymentStatus: "PAID"
                }
              }
            });
          }

          // Send emails to buyer and seller
          await sendOfferEmails({
            buyerEmail: session.customer_details?.email || "",
            offerDetails: item.offerDetails,
            formId: item.formId,
          });
        }
      }

      return NextResponse.json({ message: "success" });
    } catch (error) {
      console.error("Error processing successful payment:", error);
      return NextResponse.json(
        { error: "Error processing payment" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function sendOfferEmails({ buyerEmail, offerDetails, formId }: {
  buyerEmail: string;
  offerDetails: any;
  formId: string;
}) {
  // Implement your email sending logic here
  console.log("Sending emails to:", buyerEmail);
  console.log("Offer details:", offerDetails);
  console.log("Form ID:", formId);
} 