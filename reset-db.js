const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus semua data TrackingEvidence...");
  await prisma.trackingEvidence.deleteMany({});
  
  console.log("Menghapus semua data Alumni...");
  await prisma.alumni.deleteMany({});
  
  console.log("Database berhasil di-reset!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
