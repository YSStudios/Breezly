import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "You must be logged in." });
  }

  if (req.method === 'POST') {
    const { address, data } = req.body;

    try {
      const formData = await prisma.formData.upsert({
        where: {
          userId_address: {
            userId: session.user.id,
            address: address,
          },
        },
        update: {
          data: data,
        },
        create: {
          userId: session.user.id,
          address: address,
          data: data,
        },
      });

      res.status(200).json(formData);
    } catch (error) {
      res.status(500).json({ message: "Error saving form data" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}