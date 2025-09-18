import express from "express";
import { uploadSingleFile, getUploadedFilePath, deleteFileIfExists } from "../utils/multer.js";
import { contractSignatureModel } from "../models/contractSignature.models.js";
import {
  contractSignatureService,
  encryptionService,
} from "../utils/encryption.js";
import { verifyUser } from "../middleware.js";
import axios from "axios";
import FormData from "form-data";
import upload from "../utils/multer.js";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const router = express.Router();

// Use shared multer middleware

/**
 * POST /api/smart-contract-analysis/analyze
 * Smart contract analysis with signature logging
 */
router.post(
  "/analyze",
  verifyUser,
  uploadSingleFile("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Determine saved file path (stored in upload/ by multer diskStorage)
      const uploadedFilePath = getUploadedFilePath(req.file);
      if (!uploadedFilePath) {
        return res.status(500).json({ success: false, message: "Upload failed" });
      }

      // Generate file hash for duplicate detection (read from disk)
      const fileBuffer = fs.readFileSync(uploadedFilePath);
      const fileHash = encryptionService.generateFileHash(fileBuffer);

      // Check if contract already exists
      const existingContract = await contractSignatureModel.findOne({
        fileHash,
        uploadedBy: req.user._id,
        status: "active",
      });

      if (existingContract) {
        // Cleanup uploaded file since we won't process it further
        const uploadedFilePathDup = getUploadedFilePath(req.file);
        deleteFileIfExists(uploadedFilePathDup);
        // Increment access count and return exis
        // ting analysis
        await existingContract.incrementAccess();

        const decryptedAnalysis = existingContract.getDecryptedAnalysis();
        const decryptedContent = existingContract.getDecryptedContent();

        return res.status(200).json({
          success: true,
          message: "Contract already analyzed. Returning previous analysis.",
          isDuplicate: true,
          analysis: decryptedAnalysis,
          extracted_text: decryptedContent.extractedText,
          contractId: existingContract._id,
          accessCount: existingContract.accessCount,
          lastAnalyzed: existingContract.analysisDate,
          contractInfo: {
            fileName: existingContract.fileName,
            fileSize: existingContract.fileSize,
            analysisDate: existingContract.analysisDate,
          },
        });
      }

      // If contract doesn't exist, proceed with analysis via local Python script
      try {
        // Prepare a temporary Python script to load and run our analyzer (Windows-safe)
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "contract-"));

        // Prepare a temporary Python script to load and run our analyzer (Windows-safe)
        const pythonCode = `import os, json, sys, importlib.util, traceback\n\n\ntry:\n    backend_dir = os.getcwd()\n    script_path = os.path.join(backend_dir, 'utills', 'contract', 'contract_analyser.py')\n    spec = importlib.util.spec_from_file_location('contract_analyser', script_path)\n    mod = importlib.util.module_from_spec(spec)\n    spec.loader.exec_module(mod)\n    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY') or ''\n    an = mod.EnhancedContractAnalyzer(api_key)\n    input_path = sys.argv[1] if len(sys.argv) > 1 else ''\n    res = an.process_contract(input_path, None)\n    print(json.dumps({'ok': True, 'analysis': res, 'extracted_text': ''}))\nexcept Exception as e:\n    print(json.dumps({'ok': False, 'error': str(e), 'trace': traceback.format_exc()}))\n`;
        const bridgePath = path.join(tempDir, 'run_analyzer.py');
        fs.writeFileSync(bridgePath, pythonCode, { encoding: 'utf-8' });

         const pythonExe = process.env.PYTHON || "python";
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const backendDir = path.resolve(__dirname, "..");
         const child = spawn(pythonExe, [bridgePath, uploadedFilePath], {
          cwd: backendDir,
          shell: false,
          windowsHide: true
        });

        let out = "";
        let err = "";
         const result = await new Promise((resolve, reject) => {
          child.stdout.on("data", (d) => {
            out += d.toString();
          });
          child.stderr.on("data", (d) => {
            err += d.toString();
          });
          child.on("close", (code) => {
             try {
               // Prefer last JSON-looking line
               const lines = out.trim().split("\n").filter(Boolean);
               const candidate = lines.reverse().find(l => l.trim().startsWith('{') && l.trim().endsWith('}')) || '{}';
               const parsed = JSON.parse(candidate);
               if (code !== 0 || parsed.ok === false) {
                 reject(new Error(parsed.error || err || 'Analyzer exited with error'));
               } else {
                 resolve(parsed);
               }
             } catch (e) {
               reject(new Error(err || 'Failed to parse analyzer output'));
             }
          });
        });

         if (!result || !result.analysis) {
          throw new Error("Invalid response from local analyzer");
        }

        const { analysis, extracted_text } = result;

        // Create encrypted signature
        const signatureData = contractSignatureService.createSignature(
          {
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            uploadDate: new Date(),
            extractedText: extracted_text,
          },
          analysis,
          req.user._id
        );

        // Save to database
        const contractSignature = new contractSignatureModel({
          fileHash,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          uploadedBy: req.user._id,
          encryptedContent: signatureData.encryptedContent,
          encryptedAnalysis: signatureData.encryptedAnalysis,
          encryptionKey: signatureData.key,
          iv: signatureData.iv,
          contentTag: signatureData.contentTag,
          analysisTag: signatureData.analysisTag,
        });

        await contractSignature.save();

        // Cleanup uploaded file after successful processing
        deleteFileIfExists(uploadedFilePath);
        // Cleanup temp directory
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}

        res.status(200).json({
          success: true,
          message: "Contract analyzed and stored successfully",
          isDuplicate: false,
          analysis,
          extracted_text,
          contractId: contractSignature._id,
          contractInfo: {
            fileName: contractSignature.fileName,
            fileSize: contractSignature.fileSize,
            analysisDate: contractSignature.analysisDate,
          },
        });
      } catch (analysisError) {
        console.error("Analysis service error:", analysisError);

        // If analysis fails, still try to store the file for future processing
        if (analysisError.response && analysisError.response.status === 500) {
          return res.status(500).json({
            success: false,
            message: "Contract analysis failed. Please try again.",
            error:
              analysisError.response.data?.error || "Analysis service error",
          });
        }

        // Ensure cleanup of uploaded file and temp dir on failure as well
        deleteFileIfExists(uploadedFilePath);
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
        throw analysisError;
      }
    } catch (error) {
      console.error("Smart contract analysis error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to analyze contract",
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/smart-contract-analysis/check-duplicate
 * Check if a contract already exists without performing analysis
 */
router.post(
  "/check-duplicate",
  verifyUser,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const fileHash = encryptionService.generateFileHash(req.file.buffer);

      const existingContract = await contractSignatureModel.findOne({
        fileHash,
        uploadedBy: req.user._id,
        status: "active",
      });

      if (existingContract) {
        const analysis = existingContract.getDecryptedAnalysis();
        const content = existingContract.getDecryptedContent();

        res.status(200).json({
          success: true,
          isDuplicate: true,
          contractId: existingContract._id,
          analysis,
          extracted_text: content.extractedText,
          contractInfo: {
            fileName: existingContract.fileName,
            fileSize: existingContract.fileSize,
            analysisDate: existingContract.analysisDate,
            accessCount: existingContract.accessCount,
          },
        });
      } else {
        res.status(200).json({
          success: true,
          isDuplicate: false,
          message: "Contract not found in database. Analysis required.",
        });
      }
    } catch (error) {
      console.error("Duplicate check error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check for duplicate contract",
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/smart-contract-analysis/user/contracts
 * Get all contracts for the authenticated user with basic info
 */
router.get("/user/contracts", verifyUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "active" } = req.query;

    const contracts = await contractSignatureModel
      .find({
        uploadedBy: req.user._id,
        status,
      })
      .select(
        "-encryptedContent -encryptedAnalysis -encryptionKey -iv -contentTag -analysisTag"
      )
      .sort({ analysisDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await contractSignatureModel.countDocuments({
      uploadedBy: req.user._id,
      status,
    });

    res.status(200).json({
      success: true,
      contracts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("User contracts retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user contracts",
      error: error.message,
    });
  }
});

/**
 * GET /api/smart-contract-analysis/contract/:contractId
 * Get specific contract analysis
 */
router.get("/contract/:contractId", verifyUser, async (req, res) => {
  try {
    const { contractId } = req.params;

    const contractSignature = await contractSignatureModel.findOne({
      _id: contractId,
      uploadedBy: req.user._id,
      status: "active",
    });

    if (!contractSignature) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Increment access count
    await contractSignature.incrementAccess();

    // Decrypt and return analysis
    const analysis = contractSignature.getDecryptedAnalysis();
    const content = contractSignature.getDecryptedContent();

    res.status(200).json({
      success: true,
      contract: {
        id: contractSignature._id,
        fileName: contractSignature.fileName,
        fileSize: contractSignature.fileSize,
        fileType: contractSignature.fileType,
        analysisDate: contractSignature.analysisDate,
        accessCount: contractSignature.accessCount,
        lastAccessed: contractSignature.lastAccessed,
      },
      analysis,
      extracted_text: content.extractedText,
    });
  } catch (error) {
    console.error("Contract retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve contract",
      error: error.message,
    });
  }
});

/**
 * GET /api/smart-contract-analysis/stats
 * Get contract analysis statistics
 */
router.get("/stats", verifyUser, async (req, res) => {
  try {
    const stats = await contractSignatureModel.aggregate([
      {
        $match: {
          uploadedBy: req.user._id,
          status: "active",
        },
      },
      {
        $group: {
          _id: null,
          totalContracts: { $sum: 1 },
          totalAccessCount: { $sum: "$accessCount" },
          averageAccessCount: { $avg: "$accessCount" },
          totalFileSize: { $sum: "$fileSize" },
          lastUploadDate: { $max: "$analysisDate" },
        },
      },
    ]);

    const fileTypeStats = await contractSignatureModel.aggregate([
      {
        $match: {
          uploadedBy: req.user._id,
          status: "active",
        },
      },
      {
        $group: {
          _id: "$fileType",
          count: { $sum: 1 },
        },
      },
    ]);

    const recentContracts = await contractSignatureModel
      .find({
        uploadedBy: req.user._id,
        status: "active",
      })
      .select("fileName analysisDate accessCount")
      .sort({ analysisDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalContracts: 0,
        totalAccessCount: 0,
        averageAccessCount: 0,
        totalFileSize: 0,
        lastUploadDate: null,
      },
      fileTypeBreakdown: fileTypeStats,
      recentContracts,
    });
  } catch (error) {
    console.error("Stats retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve statistics",
      error: error.message,
    });
  }
});

export default router;
