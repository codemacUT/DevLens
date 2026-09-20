import mongoose from 'mongoose';
const AnalysisSchema=new mongoose.Schema(
  {
    tool:{
      type:String,
      required:true,
      enum:['error','refactor','test','regex']
    },
    input:{
      type:String,
      required:true
    },
    output:{
      type:String,
      required:true
    },
    tokensUsed:{
      type:Number,
      default:0
    }
  },
  {
    timestamps:true
  }
);
export default mongoose.model('Analysis',AnalysisSchema);