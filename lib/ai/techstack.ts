/**
 * 📄 What this file does:
 * 🤖 Uses the Groq AI API to act like a Senior Software Architect.
 * 🚀 Maps a huge array of dependency file formats (like go.mod or requirements.txt).
 * 🧠 Analyzes all dependencies across ANY language to figure out the full tech stack.
 * 🧱 Returns a perfectly formatted JSON result every time!
 */

import Groq from "groq-sdk";

// 🔑 Make sure we have our secret API key!
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GROQ_API_KEY) {
  // 🛑 Stop everything if there is no key!
  throw new Error(
    "🚨 CRITICAL ERROR: GROQ_API_KEY is missing in your .env file! \n" +
      "We need it to talk to the AI.",
  );
}

if (!GITHUB_TOKEN) {
  throw new Error(
    "🚨 CRITICAL ERROR: GITHUB_TOKEN is missing in your .env file! \n" +
      "We need it to dynamically fetch branches.",
  );
}

// 🤖 Ready the official Groq client
const groq = new Groq({ apiKey: GROQ_API_KEY });

// 📏 Shape of the exact response we expect back
export interface TechStack {
  auth: string[];
  database: string[];
  styling: string[];
  frameworks: string[];
  tools: string[];
}

// 🛡️ The default empty fallback if something fails
const DEFAULT_STACK: TechStack = {
  auth: [],
  database: [],
  styling: [],
  frameworks: [],
  tools: [],
};

// 🎯 The exact dependency files we want to hunt down
const TARGET_FILES = [
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml",
  "Gemfile",
  "composer.json",
  "pom.xml",
  "build.gradle",
];

/**
 * 🧠 Main function to extract the tech stack using Groq AI
 * @param owner GitHub username or organization
 * @param repo GitHub repository name
 * @returns The parsed TechStack object
 */
export async function extractTechStack(
  owner: string,
  repo: string,
): Promise<TechStack> {
  let dependencyText = "";
  let foundFileName = "";

  try {
    // 🌍 1️⃣ Get repo info to figure out what the true default branch is!
    const repoInfoRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      },
    );

    if (!repoInfoRes.ok) {
      console.log(
        `❌ Could not fetch repo info to find default branch for ${owner}/${repo}`,
      );
      return DEFAULT_STACK;
    }

    const repoData = await repoInfoRes.json();
    const defaultBranch = repoData.default_branch;

    // 🔎 2️⃣ Loop through every single target file format until we find one that hits
    for (const file of TARGET_FILES) {
      const res = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file}`,
      );

      // ✅ If we hit the file properly we consume it!
      if (res.ok) {
        // 📖 Read the raw text of the found file
        dependencyText = await res.text();
        foundFileName = file;
        console.log(`✅ Successfully found dependency file: ${file}`);

        // 🛑 Break the loop immediately! We found what we need, no more networking.
        break;
      }
    }

    // ❌ If the loop totally finishes and we found absolutely NOTHING!
    if (!dependencyText) {
      console.log(
        `❌ Could not find ANY supported dependency files on ${defaultBranch} for ${owner}/${repo}.`,
      );
      return DEFAULT_STACK;
    }
  } catch (error) {
    // 💥 Log network crashes and fallback
    console.error("🚨 Failed to fetch dependency files from GitHub:", error);
    return DEFAULT_STACK;
  }

  // 🤖 3️⃣ Now let's ask Groq AI to analyze the discovered file!
  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: false, // ⚡ We want it all at once, no streaming
      response_format: { type: "json_object" }, // 🧱 FORCES strict JSON output
      messages: [
        {
          role: "system",
          content: `You are an elite Software Architect analyzing repository dependency files (package.json, requirements.txt, go.mod, etc.).
Your objective is to extract the core technology stack and output it in a STRICT JSON format.

EXPECTED JSON SCHEMA:
{
  "auth": [string],
  "database": [string],
  "styling": [string],
  "frameworks": [string],
  "tools": [string]
}

CRITICAL RULES & EDGE CASES:
1. SMART INFERENCE (Databases): If you see ORMs or DB drivers (e.g., 'mongoose', 'prisma', 'pg', 'sqlalchemy', 'gorm', 'boto3'), infer the actual infrastructure. Output 'MongoDB', 'PostgreSQL', 'AWS', etc.
2. SMART INFERENCE (Auth): Move identity libraries (e.g., '@clerk/nextjs', 'next-auth', 'passport', 'firebase', 'jsonwebtoken', 'pyjwt') strictly to the 'auth' array.
3. TOOL CATEGORIZATION: AI SDKs ('@google/generative-ai', 'openai', 'groq-sdk', 'langchain'), Payment platforms ('stripe'), and Data pipelines ('kafka', 'redis') belong ONLY in 'tools'. Do NOT put them in auth or frameworks.
4. NOISE REDUCTION (CRITICAL): Completely IGNORE minor utilities ('lodash', 'clsx', 'canvas-confetti'), linters/formatters ('eslint', 'prettier', 'black'), and type definitions ('@types/*'). Only extract major, load-bearing architectural dependencies.
5. TRANSLATION: Translate raw registry package names to official marketing names (e.g., '@tailwindcss/postcss' -> 'Tailwind CSS', 'express' -> 'Express.js', 'fastapi' -> 'FastAPI').
6. VERSION FORMATTING: Strip all semantic versioning symbols (^, ~, >, *, =, <=). Append the clean version in parentheses. Example: 'Next.js (16.1.6)'. If no version is specified, output just the name.
7. EMPTY STATE FALLBACK: If the file is empty, invalid, or contains no architectural dependencies, return the JSON structure with empty arrays.

Do NOT include markdown formatting, backticks, or conversational text. Output ONLY the raw JSON object.`,
        },
        {
          role: "user",
          content: `Analyze this ${foundFileName} file and extract the stack according to the strict rules:\n\n${dependencyText}`,
        },
      ],
    });

    // 📥 Get the pure text answer exactly as the AI answered it
    const rawJsonString = chatCompletion.choices[0]?.message?.content;

    if (!rawJsonString) {
      throw new Error("AI returned an empty or invalid response.");
    }

    // 🧩 Parse it into a real JavaScript object!
    const parsedTechStack = JSON.parse(rawJsonString) as TechStack;

    // 🎉 Return our perfectly structured stack!
    return parsedTechStack;
  } catch (error) {
    // 🚨 💥 Catch any weird AI fails or JSON parsing crashes
    console.error("🚨 Groq AI Analysis failed:", error);

    // 🛡️ Always fallback to our safe default so Next.js doesn't burn down
    return DEFAULT_STACK;
  }
}
