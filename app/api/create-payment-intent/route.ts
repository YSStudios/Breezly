import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    
    console.log('Received amount:', amount);

    if (!amount || amount < 50) { // Stripe requires a minimum of 50 cents
      throw new Error('Invalid amount. Minimum amount is 50 cents.');
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is an integer
      currency: 'usd',
    });

    console.log('PaymentIntent created:', paymentIntent.id);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Error in create-payment-intent:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
