import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categories
  const fiction = await prisma.category.upsert({
    where: { slug: "fiction" },
    update: {},
    create: { name: "Fiction", slug: "fiction", description: "Novels, short stories and literary works" },
  });
  const nonFiction = await prisma.category.upsert({
    where: { slug: "non-fiction" },
    update: {},
    create: { name: "Non-Fiction", slug: "non-fiction", description: "Biographies, history, science and more" },
  });
  const mystery = await prisma.category.upsert({
    where: { slug: "mystery" },
    update: {},
    create: { name: "Mystery & Thriller", slug: "mystery", description: "Suspense, crime and detective fiction" },
  });
  const scienceFiction = await prisma.category.upsert({
    where: { slug: "sci-fi" },
    update: {},
    create: { name: "Science Fiction", slug: "sci-fi", description: "Futuristic worlds and scientific exploration" },
  });
  const selfHelp = await prisma.category.upsert({
    where: { slug: "self-help" },
    update: {},
    create: { name: "Self Help", slug: "self-help", description: "Personal growth and development" },
  });

  // Brands (Publishers)
  const penguin = await prisma.brand.upsert({
    where: { slug: "penguin" },
    update: {},
    create: { name: "Penguin Books", slug: "penguin" },
  });
  const harper = await prisma.brand.upsert({
    where: { slug: "harper-collins" },
    update: {},
    create: { name: "HarperCollins", slug: "harper-collins" },
  });
  const random = await prisma.brand.upsert({
    where: { slug: "random-house" },
    update: {},
    create: { name: "Random House", slug: "random-house" },
  });

  // Books
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      description: "A story of wealth, love, and the American Dream set in the Jazz Age.",
      price: 12.99,
      originalPrice: 16.99,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
      stock: 50,
      rating: 4.5,
      reviewCount: 2341,
      deliveryDays: 3,
      isFeatured: true,
      isBestseller: true,
      categoryId: fiction.id,
      brandId: penguin.id,
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "9780061935466",
      description: "A gripping tale of racial injustice and childhood innocence in the American South.",
      price: 13.99,
      originalPrice: 17.99,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg",
      stock: 35,
      rating: 4.8,
      reviewCount: 3821,
      deliveryDays: 3,
      isFeatured: true,
      isBestseller: true,
      categoryId: fiction.id,
      brandId: harper.id,
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      description: "A dystopian social science fiction novel about totalitarianism and surveillance.",
      price: 11.99,
      originalPrice: 14.99,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
      stock: 60,
      rating: 4.7,
      reviewCount: 5012,
      deliveryDays: 2,
      isFeatured: true,
      isNewArrival: false,
      categoryId: scienceFiction.id,
      brandId: penguin.id,
    },
    {
      title: "Gone Girl",
      author: "Gillian Flynn",
      isbn: "9780307588371",
      description: "A psychological thriller about a husband suspected of his wife's disappearance.",
      price: 14.99,
      originalPrice: 18.99,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780307588371-L.jpg",
      stock: 40,
      rating: 4.3,
      reviewCount: 1876,
      deliveryDays: 4,
      isFeatured: false,
      isBestseller: true,
      categoryId: mystery.id,
      brandId: random.id,
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441013593",
      description: "An epic science fiction saga set on the desert planet Arrakis.",
      price: 16.99,
      originalPrice: 21.99,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg",
      stock: 45,
      rating: 4.6,
      reviewCount: 4230,
      deliveryDays: 3,
      isFeatured: true,
      isNewArrival: true,
      categoryId: scienceFiction.id,
      brandId: penguin.id,
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "9780735211292",
      description: "A proven framework for improving every day through tiny changes.",
      price: 17.99,
      originalPrice: 22.99,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
      stock: 80,
      rating: 4.9,
      reviewCount: 6543,
      deliveryDays: 2,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      categoryId: selfHelp.id,
      brandId: random.id,
    },
    {
      title: "Sapiens",
      author: "Yuval Noah Harari",
      isbn: "9780062316097",
      description: "A brief history of humankind from ancient to modern times.",
      price: 15.99,
      originalPrice: 19.99,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
      stock: 55,
      rating: 4.6,
      reviewCount: 4890,
      deliveryDays: 3,
      isFeatured: true,
      isBestseller: true,
      categoryId: nonFiction.id,
      brandId: harper.id,
    },
    {
      title: "The Da Vinci Code",
      author: "Dan Brown",
      isbn: "9780307474278",
      description: "A thrilling mystery involving secret societies and art history.",
      price: 13.49,
      originalPrice: 16.99,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg",
      stock: 30,
      rating: 4.2,
      reviewCount: 3201,
      deliveryDays: 4,
      isNewArrival: false,
      isBestseller: true,
      categoryId: mystery.id,
      brandId: random.id,
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book as any,
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
