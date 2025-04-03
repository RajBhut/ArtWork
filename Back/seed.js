const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Artist = require("./model/Artist.js");
const Artwork = require("./model/Artwork.js");
const Exhibition = require("./model/Exhibition.js");
const Sale = require("./model/Sale.js");

mongoose.connect("mongodb://localhost:27017/artgallery", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createArtists = async (count = 5) => {
  const artists = [];
  for (let i = 0; i < count; i++) {
    artists.push(
      new Artist({
        name: faker.person.fullName(),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        imageUrl: faker.image.avatar(),
        contact: {
          email: faker.internet.email(),
          phone: faker.phone.number(),
          website: faker.internet.url(),
        },
        specialization: [faker.music.genre(), faker.music.genre()],
        achievements: [
          {
            title: faker.lorem.words(3),
            year: faker.date.past().getFullYear(),
            description: faker.lorem.sentence(),
          },
        ],
      }).save()
    );
  }
  return Promise.all(artists);
};

const createArtworks = async (artists, count = 10) => {
  const artworks = [];
  for (let i = 0; i < count; i++) {
    artworks.push(
      new Artwork({
        title: faker.commerce.productName(),
        artist: faker.helpers.arrayElement(artists)._id,
        description: faker.lorem.sentence(),
        price: faker.commerce.price(),
        imageUrl: faker.image.urlPicsumPhotos(),
        category: faker.commerce.department(),
        medium: faker.lorem.word(),
        dimensions: {
          height: faker.number.int({ min: 10, max: 100 }),
          width: faker.number.int({ min: 10, max: 100 }),
          unit: "cm",
        },
        year: faker.date.past().getFullYear(),
        status: faker.helpers.arrayElement(["available", "sold", "exhibition"]),
        tags: [faker.word.noun(), faker.word.noun()],
      }).save()
    );
  }
  return Promise.all(artworks);
};

const createExhibitions = async (artworks, count = 3) => {
  const exhibitions = [];
  for (let i = 0; i < count; i++) {
    exhibitions.push(
      new Exhibition({
        title: faker.company.name(),
        description: faker.lorem.sentence(),
        startDate: faker.date.future(),
        endDate: faker.date.future(),
        artworks: faker.helpers.arrayElements(artworks, 3),
        imageUrl: faker.image.urlPicsumPhotos(),
        location: {
          venue: faker.company.name(),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          country: faker.location.country(),
        },
        curator: faker.person.fullName(),
        status: faker.helpers.arrayElement([
          "upcoming",
          "ongoing",
          "completed",
        ]),
        ticketPrice: faker.commerce.price(),
      }).save()
    );
  }
  return Promise.all(exhibitions);
};

const createSales = async (artworks, count = 5) => {
  const sales = [];
  for (let i = 0; i < count; i++) {
    sales.push(
      new Sale({
        artwork: faker.helpers.arrayElement(artworks)._id,
        buyer: faker.person.fullName(),
        price: faker.commerce.price(),
        paymentStatus: faker.helpers.arrayElement([
          "pending",
          "completed",
          "refunded",
        ]),
        paymentMethod: faker.helpers.arrayElement([
          "credit card",
          "paypal",
          "bank transfer",
        ]),
        commission: faker.commerce.price({ min: 10, max: 50 }),
        transactionId: faker.string.uuid(),
      }).save()
    );
  }
  return Promise.all(sales);
};

const seedDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log("Database cleared");

    const artists = await createArtists();
    console.log("Artists added");

    const artworks = await createArtworks(artists);
    console.log("Artworks added");

    const exhibitions = await createExhibitions(artworks);
    console.log("Exhibitions added");

    await createSales(artworks);
    console.log("Sales added");

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
