var express = require('express');
const authProvider = require('../auth/AuthProvider');
const { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('../authConfig');
const axios = require('axios');

const router = express.Router();

// Helper function to call Microsoft Graph API
async function callGraphAPI(accessToken, endpoint) {
    const result = await axios.get(`https://graph.microsoft.com/v1.0${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return result.data;
}

// Route to sign in
router.get('/signin', authProvider.login({
    scopes: ['Tasks.ReadWrite'],
    redirectUri: REDIRECT_URI,
    successRedirect: '/'
}));

// Route to acquire token for user profile
router.get('/acquireToken', authProvider.acquireToken({
    scopes: ['User.Read'],
    redirectUri: REDIRECT_URI,
    successRedirect: '/users/profile'
}));

// Handle authentication redirect
router.post('/redirect', authProvider.handleRedirect());

// Route to sign out
router.get('/signout', authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
}));

// Main route to fetch tasks and display them on index.hbs
router.get('/', async (req, res) => {
    if (!req.user || !req.user.accessToken) {
        return res.redirect('/signin');
    }

    try {
        // Fetch tasks from Microsoft To-Do via Microsoft Graph API
        const tasks = await callGraphAPI(req.user.accessToken, '/me/todo/lists');
        res.render('index', { user: req.user, tasks: tasks.value });
    } catch (err) {
        console.error(err);
        res.render('index', { user: req.user, tasks: [] });
    }
});

module.exports = router;
