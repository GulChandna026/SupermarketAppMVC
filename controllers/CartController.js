const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Get cart
exports.getCart = (req, res) => {
    const userId = req.session.user.id;
    Cart.getCart(userId, (error, results) => {
        if (error) {
            console.error('Error fetching cart:', error);
            return res.status(500).send('Error fetching cart');
        }
        res.render('cart', { cart: results, user: req.session.user });
    });
};

// Add product to cart
exports.addToCart = (req, res) => {
    const userId = req.session.user.id;
    const productId = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity) || 1;

    Product.getById(productId, (error, results) => {
        if (error) {
            console.error('Error fetching product:', error);
            return res.status(500).send('Error fetching product');
        }

        if (results.length > 0) {
            const product = results[0];
            Cart.addItem(userId, productId, quantity, product.price, (err, result) => {
                if (err) {
                    console.error('Error adding to cart:', err);
                    return res.status(500).send('Error adding to cart');
                }
                res.redirect('/cart');
            });
        } else {
            res.status(404).send("Product not found");
        }
    });
};

// Remove item from cart
exports.removeFromCart = (req, res) => {
    const userId = req.session.user.id;
    const productId = parseInt(req.params.id);

    Cart.removeItem(userId, productId, (error, results) => {
        if (error) {
            console.error('Error removing from cart:', error);
            return res.status(500).send('Error removing from cart');
        }
        res.redirect('/cart');
    });
};

// Update cart item quantity
exports.updateQuantity = (req, res) => {
    const userId = req.session.user.id;
    const productId = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity);

    Cart.updateQuantity(userId, productId, quantity, (error, results) => {
        if (error) {
            console.error('Error updating quantity:', error);
            return res.status(500).send('Error updating quantity');
        }
        res.redirect('/cart');
    });
};

// Clear entire cart
exports.clearCart = (req, res) => {
    const userId = req.session.user.id;
    Cart.clearCart(userId, (error, results) => {
        if (error) {
            console.error('Error clearing cart:', error);
            return res.status(500).send('Error clearing cart');
        }
        res.redirect('/cart');
    });
};

// Get cart total
exports.getCartTotal = (req, res) => {
    const userId = req.session.user.id;
    Cart.getCartTotal(userId, (error, results) => {
        if (error) {
            console.error('Error getting cart total:', error);
            return res.status(500).send('Error getting cart total');
        }
        const total = results[0].total || 0;
        res.json({ total: total.toFixed(2) });
    });
};
