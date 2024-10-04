import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

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
