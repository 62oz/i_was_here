const express = require('express');
require('dotenv').config();
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { db, emailExists, hashPassword, checkPassword, getUserByEmail } = require('./database.js');
const { getDistanceFromLatLonInKm } = require('./utils.js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const AWS = require('aws-sdk');
const s3 = require('./aws.js').s3;

const app = express();

app.use(bodyParser.json());


app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  const emailAlreadyExists = await emailExists(email);

  if (emailAlreadyExists) {
    return res.status(400).json({ error: 'Email already exists.' });
    }
  db.run('INSERT INTO user (email, password) VALUES (?, ?)', [email, hashedPassword], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    if (!user || Object.keys(user).length === 0) {
        return res.status(400).json({ error: 'User not found.' });
    }
    console.log('user:', JSON.stringify(user));
    const passwordMatch = await checkPassword(password, user.password);
    if (!passwordMatch) {
        return res.status(400).json({ error: 'Incorrect password.' });
    }

    const payload = {
        userId: user.id,
        email: user.email
    };

    // Generate a token
    const token = jwt.sign(payload, 'I_WAS_HERE', { expiresIn: '1h' });

    res.json({ id: user.id, token: token });
});

app.post('/posts', (req, res) => {
    db.all('SELECT * FROM posts', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // only return posts that are 100m within user
        const filteredRows = rows.filter(row => {
            const distance = getDistanceFromLatLonInKm(req.body.latitude, req.body.longitude, row.latitude, row.longitude);
            return distance <= 0.1;
        }
        );
        res.json({ posts: filteredRows });
    });
});

app.get('/my-posts', async (req, res) => {
  console.log("Getting my posts...")
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, 'I_WAS_HERE');
    const userId = decoded.userId;

    db.all('SELECT * FROM posts WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ posts: rows });
    });
});

app.post('/create-post', upload.single('image'), async (req, res) => {
  console.log("Creating post...")
  try {
      // req.file will hold the uploaded file information
      if (!req.file) {
          return res.status(400).send('No file uploaded.');
      }

      const token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, 'I_WAS_HERE');
      const userId = decoded.userId;

      const imageBuffer = req.file.buffer;  // This contains the image data

      console.log("AWS_BUCKET_NAME:", AWS_BUCKET_NAME)

      // Upload to S3
      const uploadParams = {
          Bucket: AWS_BUCKET_NAME,
          Key: `user/${userId}/${new Date().toISOString()}.jpg`,  // This is the file name
          Body: imageBuffer,
          ACL: 'private',
          ContentType: 'image/jpeg'
      };

      s3.upload(uploadParams, async function(err, s3Data) {
          if (err) {
              console.log("Error uploading image:", err);
              return res.status(500).send({ message: "Error uploading image." });
          }

          const imageURL = s3Data.Location;

          // Get other data
          const latitude = req.body.latitude;
          const longitude = req.body.longitude;

          db.run('INSERT INTO posts (user_id, image_url, latitude, longitude) VALUES (?, ?, ?, ?)', [userId, imageURL, latitude, longitude]),
          (err, result) => {
              if (err) {
                if (err) reject(err);
                else resolve(result);
              }
          };

          res.status(200).send({ message: "Post created successfully." });
      });

  } catch (error) {
      console.error("Error:", error);
      res.status(500).send({ message: "Internal server error." });
  }
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
