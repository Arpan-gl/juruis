import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { userModel } from '../models/user.models.js';

const router = express.Router();

// Build lawyer profiles from DB to feed Python vector DB (first-time or refresh)
router.post('/build', async (req, res) => {
  try {
    const verifiedLawyers = await userModel.find({ role: 'lawyer', 'lawyerProfile.isVerified': true }).select(
      'username lawyerProfile.bio lawyerProfile.practiceAreas lawyerProfile.yearsOfExperience lawyerProfile.achievements'
    );

    const lawyers = verifiedLawyers.map((u, idx) => ({
      id: u._id.toString(),
      name: u.username,
      professional_summary: u.lawyerProfile?.bio || 'Experienced lawyer',
      expertise: Array.isArray(u.lawyerProfile?.practiceAreas) ? u.lawyerProfile.practiceAreas : [],
      experience_years: u.lawyerProfile?.yearsOfExperience || 0,
      achievements: Array.isArray(u.lawyerProfile?.achievements) ? u.lawyerProfile.achievements.join(', ') : '',
      reputation_score: 4.0,
    }));

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const baseDir = path.resolve(__dirname, '../utills/lawyerRecommender');
    const scriptPath = path.join(baseDir, 'lawyerRecommend.py');

    const pythonExe = process.env.PYTHON || 'python';
    const child = spawn(pythonExe, [
      '-c',
      `import json,sys; from lawyerRecommend import create_or_load_lawyer_vector_db; data=json.load(sys.stdin); create_or_load_lawyer_vector_db(data)`
    ], { cwd: baseDir, shell: process.platform === 'win32' });

    let stderr = '';
    child.stderr.on('data', d => { stderr += d.toString(); });

    child.stdin.write(JSON.stringify(lawyers));
    child.stdin.end();

    child.on('close', (code) => {
      if (code === 0) return res.json({ success: true, count: lawyers.length });
      return res.status(500).json({ success: false, error: stderr || 'Failed to build vector DB' });
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Recommend lawyers for a user story / question
router.post('/recommend', async (req, res) => {
  try {
    const { story } = req.body || {};
    if (!story || typeof story !== 'string' || story.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'story is required' });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const baseDir = path.resolve(__dirname, '../utills/lawyerRecommender');

    const pythonExe = process.env.PYTHON || 'python';
    const code = `from lawyerRecommend import recommend_lawyers; import json; import sys; print(json.dumps(recommend_lawyers(${JSON.stringify(story)})))`;
    const child = spawn(pythonExe, ['-c', code], { cwd: baseDir, shell: process.platform === 'win32' });

    let out = '';
    let err = '';
    child.stdout.on('data', d => { out += d.toString(); });
    child.stderr.on('data', d => { err += d.toString(); });
    child.on('close', (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(out.trim().split('\n').slice(-1)[0] || '[]');
          return res.json({ success: true, recommendations: parsed });
        } catch (_) {
          return res.json({ success: true, raw: out });
        }
      }
      return res.status(500).json({ success: false, error: err || 'Failed to recommend' });
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

export default router;


