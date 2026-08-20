const { SendData, ServerError, NotFound } = require('../helpers/response');
const { Transaction } = require('../db/mockDatabase');

// Get all transactions for the user
module.exports.get = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await Transaction.find({ userId });

    // Sort by date descending (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    return next(SendData(data));
  } catch (err) {
    return next(ServerError(err));
  }
};

// Get transaction by id
module.exports.getById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return next(NotFound());
    return next(SendData(transaction));
  } catch (err) {
    return next(ServerError(err));
  }
};

// Create a new transaction
module.exports.create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await Transaction.create({ ...req.body, userId });
    return next(SendData(data, 201));
  } catch (err) {
    return next(ServerError(err));
  }
};

// Update transaction by id
module.exports.update = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return next(NotFound());

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body);
    return next(SendData(updated));
  } catch (err) {
    return next(ServerError(err));
  }
};

// Delete transaction by id
module.exports.remove = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return next(NotFound());

    await Transaction.findByIdAndDelete(req.params.id);
    return next(SendData({ message: 'Transaction deleted successfully' }));
  } catch (err) {
    return next(ServerError(err));
  }
};
