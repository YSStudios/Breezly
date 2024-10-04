import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: "You must be logged in." });
  }

  const { id } = req.query;

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

    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: "Error removing item from cart", error: (error as Error).message });
  }
}