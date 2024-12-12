const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 5005;

app.use(bodyParser.json());
app.use(cors());
             
app.use(express.static(path.join(__dirname, 'itcc14' )));

mongoose.connect('mongodb://127.0.0.1:27017/TBKD', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
    try {
        const { username, firstName, lastName, email, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, firstName, lastName, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User Registered Successfully!' });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        res.status(200).json({ 
            message: 'Login successful!', 
            redirectTo: '/ITCC 14.html' 
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('Get User Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.put('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { firstName, lastName, email, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Update User Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.delete('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.remove();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
