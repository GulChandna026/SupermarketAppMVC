const db = require('../db');
const User = require('../models/User');

// Render register page
exports.renderRegister = (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
};

// Handle user registration
exports.register = (req, res) => {
    const { username, email, password, address, contact, role } = req.body;

    const userData = {
        username: username,
        email: email,
        password: password,
        address: address,
        contact: contact,
        role: role
    };

    User.create(userData, (err, result) => {
        if (err) {
            console.error('Registration error:', err);
            req.flash('error', 'Registration failed. Please try again.');
            return res.redirect('/register');
        }
        console.log('User registered:', result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
};

// Render login page
exports.renderLogin = (req, res) => {
    res.render('login', { messages: req.flash('success'), errors: req.flash('error') });
};

// Handle user login
exports.login = (req, res) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/login');
    }

    User.verifyLogin(email, password, (err, results) => {
        if (err) {
            console.error('Login error:', err);
            req.flash('error', 'Login failed. Please try again.');
            return res.redirect('/login');
        }

        if (results.length > 0) {
            // Successful login
            req.session.user = results[0];
            req.flash('success', 'Login successful!');
            if (req.session.user.role === 'user') {
                res.redirect('/shopping');
            } else {
                res.redirect('/inventory');
            }
        } else {
            // Invalid credentials
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    });
};

// Handle user logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
};
