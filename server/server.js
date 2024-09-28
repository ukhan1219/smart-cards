// server.js
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as googleStrategy } from 'passport-google-oauth20';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from Vite frontend
    credentials: true // Allow credentials (cookies, sessions)
}));

app.use(fileUpload()); 

app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }   
    else{
        console.log(req.files);
    }
    const image = req.files.image;

    // Example: Use Google Cloud Vision API or similar.
    try {
        // const response = await axios.post('/api/upload', {
        //     image: image.data,
        //     // Additional parameters...
        // });
        console.log('Image uploaded:', image.name, image.data);

        // Send the response back to the client
        // res.json(response.data);
        res.json({
            message: 'Image uploaded successfully!',
            fileName: image.name,
            fileSize: image.size,
            fileType: image.mimetype
        });
        
    } catch (error) {
        console.error('Error calling image recognition API:', error);
        res.status(500).send('Error processing the image.');
    }
});

dotenv.config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new googleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // Here we can associate the Google account with a user record in our database
    return done(null, profile);
  }
));

// Serialize user
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
// Deserialize user
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Routes for OAuth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to frontend
    res.redirect('http://localhost:5173/upload');
  }
);

// A route to check if user is logged in
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send('Not authenticated');
    }
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
