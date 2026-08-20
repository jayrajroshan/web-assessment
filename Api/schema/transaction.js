module.exports = {
  transaction: {
    $id: 'transaction',
    type: 'object',
    required: ['type', 'amount', 'description', 'date'],
    properties: {
      type: { type: 'string', enum: ['expense', 'income'] },
      amount: { type: 'number', minimum: 0.01 },
      category: { type: 'string', maxLength: 50 },
      description: { type: 'string', maxLength: 255, isNotEmpty: true },
      date: { type: 'string', format: 'date' }
    },
    additionalProperties: false
  },
  transactionUpdate: {
    $id: 'transactionUpdate',
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['expense', 'income'] },
      amount: { type: 'number', minimum: 0.01 },
      category: { type: 'string', maxLength: 50 },
      description: { type: 'string', maxLength: 255, isNotEmpty: true },
      date: { type: 'string', format: 'date' }
    },
    additionalProperties: false
  }
};
