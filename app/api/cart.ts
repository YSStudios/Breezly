import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from './auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Request method:', req.method); // Add this line for debugging

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: "You must be logged in." });
  }

  if (req.method === 'POST') {
    try {
      console.log('Received POST request body:', req.body); // Add this line for debugging

      const { name, description, price, imageUrl } = req.body;

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
        data: { name, description, price: parseFloat(price), imageUrl },
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

      res.status(200).json({ message: "Product added to cart successfully", product });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      res.status(500).json({ message: "Error adding product to cart", error: error instanceof Error ? error.message : String(error) });
    }
  } else if (req.method === 'GET') {
    // Existing GET logic...
  } else if (req.method === 'DELETE') {
    // Existing DELETE logic...
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}