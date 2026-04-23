// seed-categories.js
require('dotenv').config();
const db = require('./models');

const seedCategories = async () => {
  try {
    const categories = [
      { name: 'Áo', description: 'Các loại áo thời trang' },
      { name: 'Quần', description: 'Các loại quần thời trang' },
      { name: 'Giày', description: 'Giày dép các loại' },
      { name: 'Phụ kiện', description: 'Phụ kiện thời trang' }
    ];

    for (const cat of categories) {
      await db.Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
    }

    console.log('✓ Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
