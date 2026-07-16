import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    investmentType: {
      type: String,
      required: true, // no enum restriction now
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    investment: {
      type: Number,
      default: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
      image: {
      public_id: String,
      url: String,
    },
    investments: [investmentSchema],
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);
export default Company;

