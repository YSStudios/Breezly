import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method == 'GET') {
    try {
      const users = await prisma.user.findMany({
        include: {
          accounts: true, // Include related accounts
          sessions: true, // Include sessions
        },
      });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users.', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
