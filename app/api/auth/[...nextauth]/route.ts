import NextAuth from "next-auth";
import { authOptions } from "./options";

// Export handler as a simple variable for more reliable handling
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
