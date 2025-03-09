// pages/api/code/run/index.js

import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let tempDir;
    try {
      const { language, codeContent, stdin } = req.body;

      // Validate input
      if (!language || !codeContent) {
        return res.status(400).json({ error: 'Language and code content are required' });
      }

      const jobId = uuidv4();
      const codeFileName = `Main.${getFileExtension(language)}`;
      tempDir = path.join('/tmp', jobId);
      fs.mkdirSync(tempDir, { recursive: true });

      // Write code to file
      fs.writeFileSync(path.join(tempDir, codeFileName), codeContent);

      // Write stdin to file if provided
      if (stdin) {
        fs.writeFileSync(path.join(tempDir, 'input.txt'), stdin);
      }

      // Build Docker command
      const dockerImage = getDockerImage(language);
      if (!dockerImage) {
        cleanupTempDir(tempDir);
        return res.status(400).json({ error: `Unsupported language: ${language}` });
      }

      const command = buildDockerCommand({
        image: dockerImage,
        codeFileName,
        tempDir,
        stdin: stdin ? true : false,
      });

      // Execute the command
      const { stdout, stderr } = await execPromise(command, { timeout: 10000 });

      cleanupTempDir(tempDir);
      return res.status(200).json({ output: stdout, error: stderr || null });
    } catch (error) {
      console.error('Error executing code:', error);
      if (tempDir) cleanupTempDir(tempDir);
      if (error.killed || error.signal === 'SIGTERM') {
        return res.status(408).json({ error: 'Code execution timed out.' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

function getFileExtension(language) {
  const extensions = {
    python: 'py',
    javascript: 'js',
    java: 'java',
    c: 'c',
    'c++': 'cpp',
    ruby: 'rb',
    go: 'go',
    php: 'php',
    rust: 'rs',
    swift: 'swift',
    kotlin: 'kt',
    csharp: 'cs',
    'c#': 'cs',
    perl: 'pl',
    haskell: 'hs',
    r: 'R',
  };
  return extensions[language.toLowerCase()];
}

function getDockerImage(language) {
  const images = {
    python: 'code-runner-python',
    javascript: 'code-runner-javascript',
    java: 'code-runner-java',
    c: 'code-runner-c',
    'c++': 'code-runner-cpp',
    ruby: 'code-runner-ruby',
    go: 'code-runner-go',
    php: 'code-runner-php',
    rust: 'code-runner-rust',
    swift: 'code-runner-swift',
    kotlin: 'code-runner-kotlin',
    csharp: 'code-runner-csharp',
    'c#': 'code-runner-csharp',
    perl: 'code-runner-perl',
    haskell: 'code-runner-haskell',
    r: 'code-runner-r',
  };
  return images[language.toLowerCase()];
}

function buildDockerCommand({ image, codeFileName, tempDir, stdin }) {
  const volumeMapping = `-v ${tempDir}:/home/runner`;
  const workDir = '-w /home/runner';
  const user = '--user 1000:1000'; // Non-root user
  const limits = '--cpus="0.5" --memory="256m" --pids-limit=64';
  const network = '--network none'; // Disable networking
  const readOnly = '--read-only'; // Read-only filesystem
  const securityOptions = '--cap-drop ALL';

  let stdinRedirection = '';
  if (stdin) {
    stdinRedirection = '< input.txt';
  }

  const dockerRunCommand = [
    'docker run',
    '--rm',
    limits,
    network,
    readOnly,
    securityOptions,
    user,
    volumeMapping,
    workDir,
    image,
    'sh',
    '-c',
    `"${getRunCommand(codeFileName, stdinRedirection)}"`,
  ].join(' ');

  return dockerRunCommand;
}

function getRunCommand(codeFileName, stdinRedirection) {
  const fileExtension = path.extname(codeFileName).toLowerCase();
  switch (fileExtension) {
    case '.py':
      return `python ${codeFileName} ${stdinRedirection}`;
    case '.js':
      return `node ${codeFileName} ${stdinRedirection}`;
    case '.java':
      return `javac ${codeFileName} && java Main ${stdinRedirection}`;
    case '.c':
      return `gcc ${codeFileName} -o Main && ./Main ${stdinRedirection}`;
    case '.cpp':
      return `g++ ${codeFileName} -o Main && ./Main ${stdinRedirection}`;
    case '.rb':
      return `ruby ${codeFileName} ${stdinRedirection}`;
    case '.go':
      return `go run ${codeFileName} ${stdinRedirection}`;
    case '.php':
      return `php ${codeFileName} ${stdinRedirection}`;
    case '.rs':
      return `rustc ${codeFileName} -o Main && ./Main ${stdinRedirection}`;
    case '.swift':
      return `swiftc ${codeFileName} -o Main && ./Main ${stdinRedirection}`;
    case '.kt':
      return `kotlinc ${codeFileName} -include-runtime -d Main.jar && java -jar Main.jar ${stdinRedirection}`;
    case '.cs':
      return `mcs ${codeFileName} && mono Main.exe ${stdinRedirection}`;
    case '.pl':
      return `perl ${codeFileName} ${stdinRedirection}`;
    case '.hs':
      return `ghc -o Main ${codeFileName} && ./Main ${stdinRedirection}`;
    case '.r':
      return `Rscript ${codeFileName} ${stdinRedirection}`;
    default:
      return '';
  }
}

function cleanupTempDir(tempDir) {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to clean up temporary directory: ${error.message}`);
  }
}
