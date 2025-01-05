const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url} from ${req.headers['user-agent']}`);
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());

// Important: Serve static files with absolute URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'loveconnect'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('Connected to database!');
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token missing!' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token!' });
        req.user = user;
        next();
    });
};

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPG, JPEG, PNG are allowed.'));
        }
        cb(null, true);
    }
});

// Register endpoint
app.post('/register', upload.single('profileImage'), async (req, res) => {
    const { firstName, lastName, age, gender, email, password, bio, interests } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

        const sql = `
            INSERT INTO users 
            (first_name, last_name, age, gender, email, password, bio, interests, profile_image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(
            sql,
            [firstName, lastName, age, gender, email, hashedPassword, bio, interests, profileImage],
            (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error during registration: ' + err.message });
                }
                res.status(201).json({ 
                    message: 'Account registered successfully!',
                    profileImage: profileImage
                });
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error during registration: ' + error.message });
    }
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error during login: ' + err.message });

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ 
            message: 'Login successful!', 
            token,
            profileImage: user.profile_image 
        });
    });
});

// Get Profile endpoint
app.get('/profile', authenticateToken, (req, res) => {
    const sql = 'SELECT first_name, last_name, age, gender, email, bio, interests, profile_image FROM users WHERE id = ?';

    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error while fetching profile: ' + err.message });

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found!' });
        }

        const user = results[0];
        // Ensure the profile_image is a full URL if it exists
        if (user.profile_image) {
            user.profile_image = `http://localhost:${PORT}${user.profile_image}`;
        }
        user.interests = JSON.parse(user.interests);
        res.status(200).json(user);
    });
});

// Update Profile endpoint
app.put('/profile/update', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const { firstName, lastName, age, gender, email, bio, interests } = req.body;
    
    try {
        // If a new image is uploaded, get its path
        const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

        // First, get the current user data to check for existing profile image
        const getUserSql = 'SELECT profile_image FROM users WHERE id = ?';
        db.query(getUserSql, [req.user.id], async (err, results) => {
            if (err) throw err;

            const currentUser = results[0];
            
            // If there's a new image and an old image exists, delete the old one
            if (profileImage && currentUser.profile_image) {
                const oldImagePath = path.join(__dirname, currentUser.profile_image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Prepare update query
            const updateFields = [
                firstName, lastName, age, gender, email, bio, 
                JSON.stringify(interests)
            ];

            let sql = `
                UPDATE users 
                SET first_name = ?, last_name = ?, age = ?, 
                    gender = ?, email = ?, bio = ?, interests = ?
            `;

            if (profileImage) {
                sql += ', profile_image = ?';
                updateFields.push(profileImage);
            }

            sql += ' WHERE id = ?';
            updateFields.push(req.user.id);

            // Execute update
            db.query(sql, updateFields, (err, result) => {
                if (err) throw err;

                res.status(200).json({
                    message: 'Profile updated successfully!',
                    profileImage: profileImage ? `http://localhost:${PORT}${profileImage}` : null
                });
            });
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Error updating profile: ' + error.message });
    }
});

// Change Password endpoint
app.put('/profile/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [req.user.id], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error during password change: ' + err.message });

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found!' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
        db.query(updateSql, [hashedNewPassword, req.user.id], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error while updating password: ' + err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Failed to update password' });
            }

            res.status(200).json({ message: 'Password updated successfully' });
        });
    });
});

//user ep
app.get('/users/profiles', authenticateToken, (req, res) => {
    const sql = `
        SELECT 
            id,
            CONCAT(first_name, ' ', last_name) as name,
            age,
            bio,
            interests,
            profile_image as image
        FROM users 
        WHERE id != ?
        ORDER BY RAND()
    `;

    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ 
            error: 'Database error while fetching profiles: ' + err.message 
        });

        // Format the results
        const profiles = results.map(profile => ({
            id: profile.id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio,
            interests: JSON.parse(profile.interests),
            image: profile.image ? `http://localhost:${PORT}${profile.image}` : ""
        }));

        res.status(200).json(profiles);
    });
});


// Swipe endpoint
app.post('/users/swipe', authenticateToken, (req, res) => {
    const { swipedId, action } = req.body;
    const swiperId = req.user.id;

    // First, insert the swipe action
    const insertSwipeSql = `
        INSERT INTO swipes (swiper_id, swiped_id, action)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE action = ?
    `;

    db.query(insertSwipeSql, [swiperId, swipedId, action, action], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to record swipe action' });
        }

        // If it's a like, check for a match
        if (action === 'like') {
            const checkMatchSql = `
                SELECT * FROM swipes 
                WHERE swiper_id = ? AND swiped_id = ? 
                AND action = 'like'
            `;

            db.query(checkMatchSql, [swipedId, swiperId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to check for match' });
                }

                // If there's a mutual like, it's a match!
                const isMatch = results.length > 0;

                res.json({ 
                    message: 'Swipe recorded successfully',
                    isMatch: isMatch
                });
            });
        } else {
            // If it's a dislike, just send success response
            res.json({ 
                message: 'Swipe recorded successfully',
                isMatch: false
            });
        }
    });
});

// Get matches endpoint 
app.get('/users/profiles', authenticateToken, (req, res) => {
    const sql = `
        SELECT 
            u.id,
            CONCAT(u.first_name, ' ', u.last_name) as name,
            u.age,
            u.bio,
            u.interests,
            u.profile_image as image
        FROM users u
        WHERE u.id != ?  -- Exclude the current user
        AND NOT EXISTS (
            SELECT 1 
            FROM swipes s 
            WHERE s.swiper_id = ? 
            AND s.swiped_id = u.id
        )  -- Exclude already swiped profiles
        ORDER BY RAND()
        LIMIT 50
    `;

    db.query(sql, [req.user.id, req.user.id], (err, results) => {
        if (err) return res.status(500).json({ 
            error: 'Database error while fetching profiles: ' + err.message 
        });

        // Format the results
        const profiles = results.map(profile => ({
            id: profile.id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio,
            interests: JSON.parse(profile.interests),
            image: profile.image ? `http://localhost:${PORT}${profile.image}` : ""
        }));

        res.status(200).json(profiles);
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});


// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });