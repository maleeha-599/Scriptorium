// pages/api/code/run/index.js

import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

/**
 * Handles code execution requests.
 * @param {Object} req - The incoming request object.
 * @param {Object} res - The outgoing response object.
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const { language, codeContent, stdin } = req.body;

  // Validate input
  if (!language || !codeContent) {
    res.status(400).json({ error: 'Language and code content are required.' });
    return;
  }

  const jobId = uuidv4();
  const codeFileName = `Main.${getFileExtension(language)}`;
  const tempDir = path.join('/tmp', jobId);

  try {
    // Create temporary directory asynchronously
    await fs.mkdir(tempDir, { recursive: true });
    console.log(`Job ID: ${jobId} - Created temporary directory at ${tempDir}`);

    // Write code to file asynchronously
    await fs.writeFile(path.join(tempDir, codeFileName), codeContent, 'utf-8');
    console.log(`Job ID: ${jobId} - Written code to ${codeFileName}`);

    // Write stdin to file if provided
    if (stdin) {
      await fs.writeFile(path.join(tempDir, 'input.txt'), stdin, 'utf-8');
      console.log(`Job ID: ${jobId} - Written stdin to input.txt`);
    }

    // Get Docker image
    const dockerImage = getDockerImage(language);
    if (!dockerImage) {
      await cleanupTempDir(tempDir);
      res.status(400).json({ error: `Unsupported language: ${language}` });
      return;
    }

    // Build run command
    const runCommand = getRunCommand(codeFileName, stdin);
    if (!runCommand) {
      await cleanupTempDir(tempDir);
      res.status(400).json({ error: `Unsupported file extension for language: ${language}` });
      return;
    }

    // Construct Docker arguments
    const dockerArgs = [
      'run',
      '--rm',
      '--cpus=0.5',
      '--memory=256m',
      '--pids-limit=64',
      '--network', 'none',
      '--read-only',
      '--cap-drop', 'ALL',
      '--user', '1000:1000', // Non-root user
      '-v', `${tempDir}:/home/runner`,
      '-w', '/home/runner',
      dockerImage,
      'sh',
      '-c',
      runCommand,
    ];

    console.log(`Job ID: ${jobId} - Spawning Docker process: docker ${dockerArgs.join(' ')}`);

    // Spawn Docker process
    const dockerProcess = spawn('docker', dockerArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    // Collect stdout
    dockerProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Collect stderr
    dockerProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Create a Promise to handle process completion
    const executionPromise = new Promise((resolve) => {
      // Handle process close
      dockerProcess.on('close', (code, signal) => {
        console.log(`Job ID: ${jobId} - Docker process closed. Code: ${code}, Signal: ${signal}`);
        cleanupTempDir(tempDir).catch(err => console.error(`Job ID: ${jobId} - Failed to clean up temp dir: ${err.message}`));

        if (signal === 'SIGTERM') {
          resolve({ status: 408, body: { error: 'Code execution timed out.' } });
        } else if (code !== 0) {
          resolve({ status: 400, body: { error: stderr || 'Error during code execution.' } });
        } else {
          resolve({ status: 200, body: { output: stdout, error: stderr || null } });
        }
      });

      // Handle process errors
      dockerProcess.on('error', (err) => {
        console.error(`Job ID: ${jobId} - Docker process error: ${err.message}`);
        cleanupTempDir(tempDir).catch(err => console.error(`Job ID: ${jobId} - Failed to clean up temp dir: ${err.message}`));
        resolve({ status: 500, body: { error: 'Failed to start code execution.' } });
      });
    });

    // Implement timeout using Promise.race
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Job ID: ${jobId} - Execution timed out. Killing Docker process.`);
        dockerProcess.kill('SIGTERM');
        resolve({ status: 408, body: { error: 'Code execution timed out.' } });
      }, 10000); // 10 seconds
    });

    // Wait for either execution to complete or timeout
    const result = await Promise.race([executionPromise, timeoutPromise]);

    // Send the response
    res.status(result.status).json(result.body);

  } catch (error) {
    console.error(`Job ID: ${jobId} - Error executing code: ${error.message}`);
    if (tempDir) {
      try {
        await cleanupTempDir(tempDir);
      } catch (cleanupError) {
        console.error(`Job ID: ${jobId} - Failed to clean up temp dir: ${cleanupError.message}`);
      }
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Retrieves the file extension based on the programming language.
 * @param {string} language - The programming language.
 * @returns {string} - The corresponding file extension.
 */
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
  return extensions[language.toLowerCase()] || '';
}

/**
 * Retrieves the Docker image based on the programming language.
 * @param {string} language - The programming language.
 * @returns {string|null} - The Docker image name or null if unsupported.
 */
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
  return images[language.toLowerCase()] || null;
}

/**
 * Constructs the command to run inside the Docker container.
 * @param {string} codeFileName - The name of the code file.
 * @param {boolean} stdin - Whether to provide stdin.
 * @returns {string} - The command to execute.
 */
function getRunCommand(codeFileName, stdin) {
  let command = '';

  switch (path.extname(codeFileName).toLowerCase()) {
    case '.py':
      command = `python ${codeFileName}`;
      break;
    case '.js':
      command = `node ${codeFileName}`;
      break;
    case '.java':
      command = `javac ${codeFileName} && java Main`;
      break;
    case '.c':
      command = `gcc ${codeFileName} -o Main && ./Main`;
      break;
    case '.cpp':
      command = `g++ ${codeFileName} -o Main && ./Main`;
      break;
    case '.rb':
      command = `ruby ${codeFileName}`;
      break;
    case '.go':
      command = `go run ${codeFileName}`;
      break;
    case '.php':
      command = `php ${codeFileName}`;
      break;
    case '.rs':
      command = `rustc ${codeFileName} -o Main && ./Main`;
      break;
    case '.swift':
      command = `swiftc ${codeFileName} -o Main && ./Main`;
      break;
    case '.kt':
      command = `kotlinc ${codeFileName} -include-runtime -d Main.jar && java -jar Main.jar`;
      break;
    case '.cs':
      command = `mcs ${codeFileName} && mono Main.exe`;
      break;
    case '.pl':
      command = `perl ${codeFileName}`;
      break;
    case '.hs':
      command = `ghc -o Main ${codeFileName} && ./Main`;
      break;
    case '.r':
      command = `Rscript ${codeFileName}`;
      break;
    default:
      command = '';
  }

  if (stdin) {
    command += ' < input.txt';
  }

  return command;
}

/**
 * Cleans up the temporary directory.
 * @param {string} tempDir - The path to the temporary directory.
 */
async function cleanupTempDir(tempDir) {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`Cleaned up temporary directory: ${tempDir}`);
  } catch (error) {
    console.error(`Failed to clean up temporary directory: ${error.message}`);
  }
}
