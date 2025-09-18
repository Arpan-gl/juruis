import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// POST /api/schemes/recommend
// body: { category, gender, education_level, current_study, income, state, abroad }
router.post('/recommend', async (req, res) => {
  try {
    const answers = {
      category: req.body?.category || '',
      gender: req.body?.gender || '',
      education_level: req.body?.education_level || '',
      current_study: req.body?.current_study || '',
      income: req.body?.income || '',
      state: req.body?.state || '',
      abroad: req.body?.abroad || '',
    };

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const baseDir = path.resolve(__dirname, '../utills/schemes');
    const scriptPath = path.join(baseDir, 'chat_rag.py');
    const indexPath = path.join(baseDir, 'scheme_indices_eligibility_index');

    const args = [
      scriptPath,
      '--guided',
      '--answers', JSON.stringify(answers),
      '--index', indexPath,
    ];

    const env = { ...process.env };
    // Provide fallback GEMINI key if present in server env; script also has fallback
    if (!env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY) {
      env.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    }

    const pythonExe = process.env.PYTHON || 'python';
    // Use direct process spawn without shell to avoid Windows path/space issues
    const child = spawn(pythonExe, args, { env, cwd: baseDir });
    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    child.on('close', (code) => {
      if (code === 0) {
        return res.status(200).json({ success: true, result: output });
      }
      return res.status(500).json({ success: false, error: errorOutput || 'Failed to generate recommendations' });
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

export default router;



