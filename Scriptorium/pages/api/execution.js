import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';

const ep = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language , stdin } = req.body;

  const validLang = ['python', 'javascript', 'java', 'c', 'cpp'];
  if (!validLang.includes(language)) {
    return res.status(400).json({ error: 'Language not supported' });
  }

  const tempDir = path.join(process.cwd(), 'temp');
  await fs.ensureDir(tempDir); // ensure temp exists

  const codefp = path.join(tempDir, `code${getExt(language)}`);
  const infp = path.join(tempDir, 'input.txt');

  await fs.writeFile(codefp, code);
  await fs.writeFile(infp, stdin || '');

  try {
    const command = getComm(language, codefp, infp);

    const { stdout, stderr } = await ep(command, { timeout: 5000, maxBuffer: 1024 * 1024 }); //time+mem limit

    if (stderr) {
      return res.status(200).json({ output: '', error: stderr });
    }

    res.status(200).json({ output: stdout, error: '' });
  } 
  
  catch (error) {
    if (error.killed || error.signal === 'SIGTERM') {
      return res.status(500).json({ error: 'Execution timed out' });
    }

    res.status(500).json({ error: 'Error', details: error.message });

  } 
  
  finally {
    try {
      await fs.remove(tempDir);
    } 
    catch (cleanErr) {
      console.error('Failed cleanup', cleanErr);
    }
  }
}

// get file extension
function getExt(lang) {
  const ext = {
    'python': '.py',
    'javascript': '.js',
    'java': '.java',
    'c': '.c',
    'cpp': '.cpp'
  };
  
  return ext[lang];
}

// define the command 
function getComm(lang, codefp, infp) {
  const out = path.join(path.dirname(codefp), 'program');
  
  switch (lang) {
    case 'python':
      return `python3 ${codefp} < ${infp}`;
    
    case 'javascript':
      return `node ${codefp} < ${infp}`;
    
    case 'java':
      return `javac ${codefp} && java -cp ${path.dirname(codefp)} Main < ${infp}`;
    
    case 'c':
      return `gcc ${codefp} -o ${out} && ${out} < ${infp}`;
    
    case 'cpp':
      return `g++ ${codefp} -o ${out} && ${out} < ${infp}`;
    
    default:
      throw new Error(`${lang} is not supported.`);
  }
}
