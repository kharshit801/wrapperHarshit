import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    userId: { type: String, required: true }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;
