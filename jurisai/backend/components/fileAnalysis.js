

export const fileAnalysis = (req, res) => {
  const { filePath } = req.body;
  console.log('File path:', filePath);


  res.json({ message: 'File analysis completed successfully' });
}