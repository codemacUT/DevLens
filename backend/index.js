import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Analysis from './models/Analysis.js';
function strip(text){
  if(!text) return '';
  return text.replace(/[#*`]/g, '');
}
dotenv.config();
const app=express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
const PORT=process.env.PORT || 5001;
const GEMINI_API_KEY=process.env.GEMINI_API_KEY;
const TOOL_PROMPTS={
  error: "You are a senior debugging engineer embedded into devtools. Identify the root cause, pinpoint the offending line/syntax/logic, provide a concrete working fix, and highlight edge cases that might trigger it again.",
  refactor: "You are a software architect. Analyze the snippet for readability, cyclomatic complexity, anti-patterns, and performance bottlenecks. Output the cleanly refactored version with explanations.",
  test: "You are a QA automation lead. Generate production-grade unit tests covering happy paths, edge boundaries, null/undefined inputs, and async failures. State which test runner framework is assumed (Jest/PyTest/Go test).",
  regex: "You are a regex specialist. Either build a robust regular expression for the requirements described or dissect the regex provided, explain each token breakdown, and list test cases that pass/fail."
};
app.post('/api/analyze',async (req,res)=>{
  const {tool,input}=req.body;
  const prompt=TOOL_PROMPTS[tool] || "Analyze the following developer input:";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
  try{
    const geminiRes=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[
          {
            role:'user',
            parts:[{ text: `${prompt}\n\nPayload:\n${input}` }]
          }
        ],
        generationConfig:{temperature:0.2}
      })
    });
    const data=await geminiRes.json();
    if(!geminiRes.ok){
      throw new Error(data.error?.message || `Gemini API Error: ${geminiRes.statusText}`);
    }
    const rawOutput=data.candidates?.[0]?.content?.parts?.[0]?.text || '// No response received.';
    const outputText=strip(rawOutput);
    const totalTokens=data.usageMetadata?.totalTokenCount || 0;
    const record=await Analysis.create({tool,input,output: outputText,tokensUsed: totalTokens});
    res.json({
      success: true,
      id: record._id,
      output: outputText,
      tokensUsed: totalTokens
    });
  }
  catch(err){
    console.error(err);
    res.status(500).json({error:err.message || 'Server error while executing analysis.'});
  }
});
app.get('/api/history',async(req,res)=>{
  try{
    const history=await Analysis.find().sort({ createdAt: -1 }).limit(15).select('tool input output createdAt tokensUsed');
    res.json(history);
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devlens').then(()=>{
    console.log('MongoDB connected successfully');
    app.listen(PORT, ()=>console.log(`DevLens API listening on port ${PORT}`));
  }).catch((err)=>{
    console.error(err);
    process.exit(1);
  });