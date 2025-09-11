const router = require('express').Router();
const auth = require('../middleware/auth');
const { suggestTaskFromContext } = require('../services/aiSuggestService');

router.use(auth);

router.post('/suggest-task', async (req, res) => {
  try {
    const { context = '' } = req.body || {};

    const result = await suggestTaskFromContext(String(context));
    res.json(result);
  } catch (err) {
    console.error('AI suggest error:', err);
    res.status(500).json({ message: 'AI suggestion failed', error: err?.message });
  }
});

module.exports = router;
