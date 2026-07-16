
const fs = require('fs');
const Book = require('../models/Book');

exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.createBook = (req, res) => {
  const bookObject = req.file ? JSON.parse(req.body.book) : req.body;
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.file
      ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      : bookObject.imageUrl,
    averageRating: 0,
    ratings: [],
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre introuvable.' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé.' });
      }

      const bookObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
          }
        : { ...req.body };

      delete bookObject._userId;

      if (req.file) {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) {
            console.error(err);
          }

          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: 'Livre modifié !' }))
            .catch((error) => res.status(400).json({ error }));
        });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Livre modifié !' }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre introuvable.' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé.' });
      }

      const filename = book.imageUrl.split('/images/')[1];

      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = (req, res) => {
  const rating = Number(req.body.rating);

  if (rating < 0 || rating > 5) {
    return res.status(400).json({
      message: 'La note doit être comprise entre 0 et 5.',
    });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const alreadyRated = book.ratings.find(
        (rating) => rating.userId === req.auth.userId
      );

      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: 'Vous avez déjà noté ce livre.' });
      }

      const ratings = [
        ...book.ratings,
        {
          userId: req.auth.userId,
          grade: rating,
        },
      ];

      const averageRating =
        ratings.reduce((sum, rating) => sum + rating.grade, 0) /
        ratings.length;

      Book.findByIdAndUpdate(
        req.params.id,
        { ratings, averageRating },
        { new: true }
      )
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
```
