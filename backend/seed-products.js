require('dotenv').config();
const db = require('./models');

const seedProducts = async () => {
  try {
    const products = [
      { name: 'Áo thun trắng basic', price: 120000, image: 'https://i.imgur.com/1.jpg', CategoryId: 1 },
      { name: 'Áo sơ mi xanh', price: 190000, image: 'https://i.imgur.com/2.jpg', CategoryId: 1 },
      { name: 'Quần jeans đen', price: 250000, image: 'https://i.imgur.com/3.jpg', CategoryId: 2 },
      { name: 'Quần short kaki', price: 150000, image: 'https://i.imgur.com/4.jpg', CategoryId: 2 },
      { name: 'Giày sneaker trắng', price: 350000, image: 'https://i.imgur.com/5.jpg', CategoryId: 3 },
      { name: 'Giày thể thao đen', price: 400000, image: 'https://i.imgur.com/6.jpg', CategoryId: 3 },
      { name: 'Mũ lưỡi trai', price: 80000, image: 'https://i.imgur.com/7.jpg', CategoryId: 4 },
      { name: 'Thắt lưng da', price: 120000, image: 'https://i.imgur.com/8.jpg', CategoryId: 4 }
    ];

    for (const item of products) {
      await db.Product.findOrCreate({
        where: { name: item.name },
        defaults: item
      });
    }

    console.log('✓ Products seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
