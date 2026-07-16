const express = require('express');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const booksCtrl = require('../controllers/books');

const router = express.Router();

router.get('/bestrating', booksCtrl.getBestRatedBooks);
router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);
router.post('/', auth, multer, booksCtrl.createBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.rateBook);

module.exports = router;
