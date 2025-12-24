import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const adminUser = await db.query.users.findFirst({
    where: eq(users.role, 'admin')
  });

  return {
    hasAdmin: !!adminUser
  };
});
