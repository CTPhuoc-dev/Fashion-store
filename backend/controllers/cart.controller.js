const db = require("../models");

const getOrCreateCart = async userId => {
  let cart = await db.Cart.findOne({ where: { userId } });
  if (!cart) {
    cart = await db.Cart.create({ userId });
  }
  return cart;
};

exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const result = await db.Cart.findByPk(cart.id, {
      include: [
        {
          model: db.CartItem,
          as: "items",
          include: [
            {
              model: db.Product,
              as: "product"
            }
          ]
        }
      ]
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ error: "productId and quantity are required" });
    }

    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const cart = await getOrCreateCart(req.user.id);
    const [item, created] = await db.CartItem.findOrCreate({
      where: {
        cartId: cart.id,
        productId
      },
      defaults: {
        quantity
      }
    });

    if (!created) {
      item.quantity += quantity;
      await item.save();
    }

    const result = await db.Cart.findByPk(cart.id, {
      include: [
        {
          model: db.CartItem,
          as: "items",
          include: [
            {
              model: db.Product,
              as: "product"
            }
          ]
        }
      ]
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity == null || quantity < 0) {
      return res.status(400).json({ error: "quantity is required and must be >= 0" });
    }

    const item = await db.CartItem.findOne({
      where: { id: itemId },
      include: [{ model: db.Cart, as: "cart" }]
    });

    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    if (quantity === 0) {
      await item.destroy();
    } else {
      item.quantity = quantity;
      await item.save();
    }

    const cart = await getOrCreateCart(req.user.id);
    const result = await db.Cart.findByPk(cart.id, {
      include: [
        {
          model: db.CartItem,
          as: "items",
          include: [
            {
              model: db.Product,
              as: "product"
            }
          ]
        }
      ]
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await db.CartItem.findOne({
      where: { id: itemId },
      include: [{ model: db.Cart, as: "cart" }]
    });

    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await item.destroy();
    res.json({ message: "Cart item removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await db.CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
