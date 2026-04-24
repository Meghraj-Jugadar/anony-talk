const Filter = require('bad-words');
const filter = new Filter();

const EXTRA_BAD_WORDS = ['kill yourself', 'kys', 'go die'];

const containsAbuse = (text) => {
  if (filter.isProfane(text)) return true;
  return EXTRA_BAD_WORDS.some(w => text.toLowerCase().includes(w));
};

const moderateContent = (req, res, next) => {
  const { title, content } = req.body;
  const textToCheck = `${title || ''} ${content || ''}`;

  if (containsAbuse(textToCheck)) {
    return res.status(400).json({ error: 'Content contains inappropriate language.' });
  }
  next();
};

const moderateComment = (req, res, next) => {
  const { content } = req.body;
  if (containsAbuse(content || '')) {
    return res.status(400).json({ error: 'Comment contains inappropriate language.' });
  }
  next();
};

module.exports = { moderateContent, moderateComment };
