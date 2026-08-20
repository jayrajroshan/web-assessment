const express = require('express');
const controller = require('../controllers/transactions');
const { isAuth } = require('../middlewares/isAuth');
const { validator } = require('../middlewares/validator');

const router = express.Router();

router
  .route('/')
  .get(isAuth, controller.get)
  .post(isAuth, validator('transaction'), controller.create);

router
  .route('/:id')
  .get(isAuth, controller.getById)
  .patch(isAuth, validator({ body: 'transactionUpdate' }), controller.update)
  .delete(isAuth, controller.remove);

module.exports = router;
