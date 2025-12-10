import { Schema, type Document, models, model } from "mongoose"

export interface IFaq extends Document {
  question: string
  answer: string
  category: string
}

const FaqSchema = new Schema<IFaq>(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
  },
  { timestamps: true },
)

const Faq = models.Faq || model<IFaq>("Faq", FaqSchema)
export default Faq
