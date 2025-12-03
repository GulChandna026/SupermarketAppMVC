const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const db = require('../db');

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
            
            // Check if stock is available
            if (product.quantity < quantity) {
                req.flash('error', `Not enough stock! Only ${product.quantity} item(s) available.`);
                return res.redirect('/shopping');
            }

            Cart.addItem(userId, productId, quantity, product.price, (err, result) => {
                if (err) {
                    console.error('Error adding to cart:', err);
                    return res.status(500).send('Error adding to cart');
                }
                req.flash('success', `${product.productName} added to cart!`);
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

    // First check if product has enough stock
    Product.getById(productId, (error, results) => {
        if (error) {
            console.error('Error fetching product:', error);
            return res.status(500).send('Error fetching product');
        }

        if (results.length > 0) {
            const product = results[0];
            
            // Check if stock is available for the new quantity
            if (product.quantity < quantity) {
                req.flash('error', `Not enough stock! Only ${product.quantity} item(s) available.`);
                return res.redirect('/cart');
            }

            Cart.updateQuantity(userId, productId, quantity, (error, results) => {
                if (error) {
                    console.error('Error updating quantity:', error);
                    return res.status(500).send('Error updating quantity');
                }
                res.redirect('/cart');
            });
        } else {
            res.status(404).send("Product not found");
        }
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


// Checkout - decrease stock and clear cart
exports.checkout = (req, res) => {
    const userId = req.session.user.id;

    // Step 1: Get all cart items
    Cart.getCart(userId, (error, cartItems) => {
        if (error) {
            console.error('Error fetching cart:', error);
            return res.status(500).send('Error during checkout');
        }

        if (!cartItems || cartItems.length === 0) {
            return res.render('checkout-success', { message: 'Cart was empty' });
        }

        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

        // Step 2: Create order
        Order.create(userId, total, (orderErr, orderResult) => {
            if (orderErr) {
                console.error('Error creating order:', orderErr);
                return res.status(500).send('Error during checkout');
            }

            const orderId = orderResult.insertId;
            const orderItems = cartItems.map(item => ({
                product_id: item.product_id,
                product_name: item.productName,
                quantity: item.quantity,
                unit_price: item.unit_price
            }));

            // Step 3: Add items to order
            Order.addItems(orderId, orderItems, (itemErr) => {
                if (itemErr) {
                    console.error('Error adding items to order:', itemErr);
                    return res.status(500).send('Error during checkout');
                }

                // Step 4: Decrease stock for each product
                let completed = 0;
                cartItems.forEach((item) => {
                    const sql = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
                    db.query(sql, [item.quantity, item.product_id], (err) => {
                        if (err) {
                            console.error('Error updating product quantity:', err);
                            return res.status(500).send('Error during checkout');
                        }

                        completed++;

                        // Step 5: Once all products updated, clear cart
                        if (completed === cartItems.length) {
                            Cart.clearCart(userId, (clearErr) => {
                                if (clearErr) {
                                    console.error('Error clearing cart:', clearErr);
                                    return res.status(500).send('Error clearing cart');
                                }
                                res.render('checkout-success', { message: 'Checkout successful! Your order #' + orderId + ' has been placed.' });
                            });
                        }
                    });
                });
            });
        });
    });
};

