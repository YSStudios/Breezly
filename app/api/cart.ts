import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from './auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Define a schema for the request body
const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  imageUrl: z.string().url(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Request method:', req.method); // Add this line for debugging

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: "You must be logged in." });
  }

  if (req.method === 'POST') {
    try {
      // Validate and parse the request body
      const { name, description, price, imageUrl } = productSchema.parse(req.body);

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

      res.status(200).json({ message: "Product added to cart successfully", product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
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
