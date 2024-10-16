import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }

  try {
    const cartItems = await prisma.orderItem.findMany({
      where: {
        order: {
          userId: session.user.id,
          status: 'CART'
        }
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return NextResponse.json({ message: "Error fetching cart items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }

  try {
    const { name, description, price, imageUrl } = await req.json();

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
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        user: {
          connect: { id: session.user.id }
        }
      },
    });

    // Add the product to the order
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price: parseFloat(price),
      },
    });

    // Update the order total
    await prisma.order.update({
      where: { id: order.id },
      data: { total: { increment: parseFloat(price) } },
    });

    return NextResponse.json({ message: "Product added to cart successfully", product });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    return NextResponse.json({ message: "Error adding product to cart", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: "Item ID is required" }, { status: 400 });
  }

  try {
    const deletedItem = await prisma.orderItem.delete({
      where: {
        id: id as string,
      },
    });

    // Update the order total
    await prisma.order.update({
      where: {
        id: deletedItem.orderId,
      },
      data: {
        total: {
          decrement: deletedItem.price,
        },
      },
    });

    return NextResponse.json({ message: "Item removed from cart successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ message: "Error removing item from cart", error: (error as Error).message }, { status: 500 });
  }
}
