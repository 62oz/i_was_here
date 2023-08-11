const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

let db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    throw err;
  }
});

// Create table
db.run('CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT, verified INTEGER DEFAULT 0)', (err) => {
  if (err) {
    throw err;
  }
});


// Create posts table
db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, -- Foreign key referencing the user who created the post
    image_url TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    caption TEXT, -- Optional caption for the post
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)` , (err) => {
    if (err) {
        throw err;
    }
});

// Create likes table
db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, -- Foreign key referencing the user who liked the post
    post_id INTEGER, -- Foreign key referencing the post that was liked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)` , (err) => {
    if (err) {
        throw err;
    }
});

function emailExists(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT email FROM user WHERE email = ?', [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? true : false);
      }
    });
  });
}

async function hashPassword(password) {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
}

async function checkPassword(plainPassword, hashedPassword) {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
}

function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM user WHERE email = ?', [email], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

function saveImage(userID, fileURL, location) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO posts (user_id, image_url, latitude, longitude) VALUES (?, ?, ?, ?)',
        [userID, fileURL, location.latitude, location.longitude],
        (err, result ) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

function getLikesByPostIdAndUserId(postId, userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getLikesByPost(postId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM likes WHERE post_id = ?', [postId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
  db,
  emailExists,
    hashPassword,
    checkPassword,
    getUserByEmail,
    saveImage,
    getLikesByPostIdAndUserId,
    getLikesByPost
};
