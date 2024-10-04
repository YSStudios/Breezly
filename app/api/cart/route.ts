import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  console.log('Received GET request to /api/cart');

  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session || !session.user) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: { userId: session.user.id, status: 'CART' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json([], { status: 200 });
    }

    const cartItems = order.items.map(item => ({
      id: item.id,
      name: item.product.name,
      description: item.product.description,
      price: parseFloat(item.price.toString()),
      quantity: item.quantity,
    }));

    console.log('Cart items:', cartItems);
    return NextResponse.json(cartItems, { status: 200 });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return NextResponse.json({ message: "Error fetching cart items", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('Received POST request to /api/cart');

  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session || !session.user) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);

    const { name, description, price, imageUrl } = body;

    // Validate input
    if (!name || !description || typeof price !== 'number') {
      console.log('Invalid input data');
      return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
    }

    // Find or create a cart (order with status 'CART')
    let order = await prisma.order.findFirst({
      where: { userId: session.user.id, status: 'CART' },
    });

    if (!order) {
      order = await prisma.order.create({
        data: { userId: session.user.id, status: 'CART', total: 0 },
      });
    }

    // Create a new product
    const product = await prisma.product.create({
      data: { name, description, price, imageUrl },
    });

    // Add the product to the order
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price,
      },
    });

    // Update the order total
    await prisma.order.update({
      where: { id: order.id },
      data: { total: { increment: price } },
    });

    console.log('Successfully added product to cart');
    return NextResponse.json({ message: "Product added to cart successfully", product }, { status: 200 });
  } catch (error) {
    console.error('Error in cart API route:', error);
    return NextResponse.json({ message: "Error adding product to cart", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log('Received DELETE request to /api/cart');

  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session || !session.user) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ message: "Item ID is required" }, { status: 400 });
    }

    // Find the order item
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (!orderItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // Ensure the order belongs to the current user
    if (orderItem.order.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Delete the order item
    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Update the order total
    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { 
        total: { decrement: orderItem.price * orderItem.quantity },
      },
    });

    console.log('Successfully removed item from cart');
    return NextResponse.json({ message: "Item removed from cart successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error in cart API route:', error);
    return NextResponse.json({ message: "Error removing item from cart", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}