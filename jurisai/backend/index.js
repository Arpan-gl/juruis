import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import geminiRoutes from './routes/gemini.js';
import cookieParser from 'cookie-parser';
import signUpRouter from './routes/signUp.js';
import signInRouter from './routes/signIn.js';
import signOutRouter from './routes/signOut.js';
import getUserDetailRoute from './routes/getUser.js';
import AilawyerRoute from './routes/Ailawyer.js';
import issueRoutes from './routes/issues.js';
import responseRoutes from './routes/responses.js';
import hireRoutes from './routes/hire.js';
import lawyerApplicationRoutes from './routes/lawyerApplications.js';
import adminRoutes from './routes/admin.js';
import schemesRoutes from './routes/schemes.js';
import smartContractAnalysisRoutes from './routes/smartContractAnalysis.js';
import lawyerRecommenderRoutes from './routes/lawyerRecommender.js';

const app = express();

// CORS configuration - must be before other middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Add CORS headers manually as a fallback
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Other middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anumaancs:pagal@gdg.g5f6w.mongodb.net/?retryWrites=true&w=majority&appName=GDG';  


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,serverSelectionTimeoutMS: 20000 })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));






//routes
app.use('/api/gemini', geminiRoutes);
app.use("/api/signUp",signUpRouter);
app.use("/api/signIn",signInRouter);
app.use("/api/signOut",signOutRouter);
app.use("/api/getUserDetail",getUserDetailRoute);
app.use("/api/Ailawyer",AilawyerRoute);
app.use("/api/issues", issueRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/hire", hireRoutes);
app.use("/api/lawyer-applications", lawyerApplicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/smart-contract-analysis", smartContractAnalysisRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/lawyers', lawyerRecommenderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});