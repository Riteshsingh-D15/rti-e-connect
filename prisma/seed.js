import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("Seeding RTI Connect Database...");

  // Seed Users
  const citizenUser = await prisma.user.upsert({
    where: { email: "citizen@example.com" },
    update: {},
    create: {
      name: "Ananya Sharma",
      email: "citizen@example.com",
      passwordHash,
      role: "CITIZEN",
      phone: "9876543210",
      state: "Delhi",
      district: "New Delhi",
      citizen: {
        create: {
          address: "142, Barakhamba Road, Connaught Place",
          state: "Delhi",
          district: "New Delhi",
          pincode: "110001",
        },
      },
    },
  });

  const officerUser = await prisma.user.upsert({
    where: { email: "officer@example.com" },
    update: {},
    create: {
      name: "Rakesh Verma",
      email: "officer@example.com",
      passwordHash,
      role: "GOVERNMENT OFFICER",
      phone: "9811223344",
      state: "Delhi",
      district: "Central Delhi",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Meera Nair",
      email: "admin@example.com",
      passwordHash,
      role: "ADMINISTRATOR",
      phone: "9988776655",
      state: "Delhi",
      district: "New Delhi",
    },
  });

  // Seed Departments
  const departmentsData = [
    { name: "Public Works Department", code: "PWD", description: "State road and civil engineering public works", contactEmail: "pio.pwd@gov.in" },
    { name: "Education Department", code: "EDU", description: "Primary, secondary, and higher education governance", contactEmail: "pio.edu@gov.in" },
    { name: "Health and Family Welfare Department", code: "HLT", description: "Healthcare centres, hospitals, and drug supply", contactEmail: "pio.health@gov.in" },
    { name: "Electricity and Power Department", code: "ELEC", description: "Power distribution and grid infrastructure", contactEmail: "pio.power@gov.in" },
    { name: "Water Supply and Sanitation Department", code: "WAT", description: "Drinking water pipelines and sewerage", contactEmail: "pio.water@gov.in" },
    { name: "Transport Department", code: "TRN", description: "Motor vehicle regulation and public transit", contactEmail: "pio.transport@gov.in" },
    { name: "Municipal Administration and Urban Development", code: "MUN", description: "Urban local bodies and solid waste management", contactEmail: "pio.urban@gov.in" },
    { name: "Home / Police Department", code: "POL", description: "Law enforcement and public safety administration", contactEmail: "pio.police@gov.in" },
    { name: "Revenue and Land Records Department", code: "REV", description: "Land titling, mutation, and revenue records", contactEmail: "pio.revenue@gov.in" },
  ];

  for (const dept of departmentsData) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
