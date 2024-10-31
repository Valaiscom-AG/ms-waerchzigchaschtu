/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var router = express.Router();


// Route for the home page
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Wärchzigchaschtu',
        icon: '/assets/apps/icons/tools.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the telefonliste
router.get('/telefonliste', function (req, res, next) {
    res.render('telefonliste', {
        title: 'Telefonliste',
        icon: '/assets/apps/icons/telefonliste.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the fiber-checker
router.get('/fiber-checker', function (req, res, next) {
    res.render('fiber-checker', {
        title: 'fiber-checker',
        icon: '/assets/apps/icons/fiber-checker.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});
// Route for the gebietskarte
router.get('/gebietskarte', function (req, res, next) {
    res.render('gebietskarte', {
        title: 'Gebietskarte',
        icon: '/assets/apps/icons/gebietskarte.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the email-signatur
router.get('/email-signatur', function (req, res, next) {
    res.render('email-signatur', {
        title: 'Email-Signatur',
        icon: '/assets/apps/icons/email-signatur.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the editor
router.get('/editor', function (req, res, next) {
    res.render('editor', {
        title: 'Editor',
        icon: '/assets/apps/icons/editor.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the dokumentation
router.get('/dokumentation', function (req, res, next) {
    res.render('dokumentation', {
        title: 'Dokumentation',
        icon: '/assets/apps/icons/dokumentation.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the installieren
router.get('/installieren', function (req, res, next) {
    res.render('installieren', {
        title: 'Installieren',
        icon: '/assets/apps/icons/installieren.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the brief
router.get('/brief', function (req, res, next) {
    res.render('brief', {
        title: 'Brief',
        icon: '/assets/apps/icons/briefe.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the brief
router.get('/grafik', function (req, res, next) {
    res.render('grafik', {
        title: 'Grafik',
        icon: '/assets/apps/icons/briefe.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the brief
router.get('/helpdesk', function (req, res, next) {
    res.render('helpdesk', {
        title: 'Helpdesk',
        icon: '/assets/apps/icons/briefe.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the cs-dashboard
router.get('/cs-dashboard', function (req, res, next) {
    res.render('cs-dashboard', {
        title: 'Kundenfeedback Dashboard',
        icon: '/assets/apps/icons/cs.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the cs-updates
router.get('/cs-updates', function (req, res, next) {
    res.render('cs-updates', {
        title: 'Kundenfeedback Center',
        icon: '/assets/apps/icons/cs.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the cs-updates
router.get('/cs', function (req, res, next) {
    res.render('cs-home', {
        title: 'Kundenfeedback Center',
        icon: '/assets/apps/icons/cs.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

// Route for the visitenkarten
router.get('/visitenkarten', function (req, res, next) {
    res.render('visitenkarten', {
        title: 'Visitenkarten',
        icon: '/assets/apps/icons/leads.png',
        isAuthenticated: req.session.isAuthenticated,
        username: req.session.account?.username,
    });
});

module.exports = router;