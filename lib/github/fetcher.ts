/**
 * 📄 What this file does:
 * 🐙 Connects to GitHub to download code from a repository.
 * 🔍 Finds all the TypeScript and JavaScript files.
 * 🛑 Ignores junk folders like node_modules or build.
 * ⚡ Downloads all the files super fast at the same time!
 * 🔑 Needs a GITHUB_TOKEN to work securely.
 */

// 🔑 Check if we have the secret GitHub token in our environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  // 🛑 Stop everything if there is no token!
  throw new Error(
    "🚨 CRITICAL ERROR: GITHUB_TOKEN is missing in your .env file! \n" +
      "We need it to talk to GitHub securely.",
  );
}

// 📦 The shape of the data we will return
export interface RepoFile {
  path: string;
  content: string;
}

/**
 * 📥 Main function to download repo files
 * @param repoUrl The full GitHub link
 * @returns Array of files with their paths and code content
 */
export async function fetchRepoFiles(repoUrl: string): Promise<RepoFile[]> {
  // 1️⃣ Extract owner and repo name from the URL using a regular expression
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

  // ❌ Crash if the URL looks wrong
  if (!match) {
    throw new Error(
      "❌ Invalid GitHub URL! Must be like: https://github.com/owner/repo",
    );
  }

  const owner = match[1];
  // 🧹 Clean up the repo name in case it ends with .git
  const repo = match[2].replace(".git", "");

  let treeData;
  let branchUsed = "main"; // 🌿 We start by guessing the branch is 'main'

  // 2️⃣ Try to get the file list (tree) from the 'main' branch first
  try {
    treeData = await getTree(owner, repo, "main");
  } catch (error) {
    console.log("⚠️ Failed to fetch 'main' branch. Trying 'master' branch...");
    // 🔄 Fallback to 'master' if 'main' fails!
    try {
      treeData = await getTree(owner, repo, "master");
      branchUsed = "master"; // Update the branch we are actually using
    } catch (masterError) {
      // 💥 Crash if both branches totally failed
      throw new Error(
        `🚨 Failed to fetch tree from both main and master branches!`,
      );
    }
  }

  // 3️⃣ Filter the files we actually want to read
  const validExtensions = [".ts", ".tsx", ".js", ".jsx"];
  const badFolders = ["node_modules", "dist", ".next", "build"];

  const filesToFetch = treeData.tree.filter((file: any) => {
    // 🛑 We only want actual files ("blob"), not folders ("tree")
    if (file.type !== "blob") return false;

    const path = file.path;

    // 🛑 Skip junk folders (if path starts with or has the folder inside it)
    for (const bad of badFolders) {
      if (path.includes(`/${bad}/`) || path.startsWith(`${bad}/`)) {
        return false;
      }
    }

    // ✅ Keep it only if it ends with one of our allowed file types (TS/JS)
    const isValidExt = validExtensions.some((ext) => path.endsWith(ext));
    return isValidExt;
  });

  // 4️⃣ Download the real code for all chosen files at the exact same time
  try {
    const filePromises = filesToFetch.map(async (file: any) => {
      // 🔗 Build the raw URL to download the actual text of the file
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchUsed}/${file.path}`;

      // 📥 Fetch the text using our token!
      const response = await fetch(rawUrl, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`, // 🔑 Pass token to auth limit
        },
      });

      // ❌ Crash if this specific file failed to download
      if (!response.ok) {
        throw new Error(`Failed to fetch raw content for ${file.path}`);
      }

      // 📖 Read the response as flat text
      const content = await response.text();

      // 🎁 Return the neat package
      return {
        path: file.path,
        content: content,
      };
    });

    // ⏳ Wait for ALL downloads to finish at the same time (Concurrent)
    const results = await Promise.all(filePromises);
    return results;
  } catch (error) {
    // 💥 Crash if the raw fetch steps failed
    throw new Error(
      `🚨 Failed to fetch raw content: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 🌳 Helper function to call GitHub's Tree API and get the flat list of files
 */
async function getTree(owner: string, repo: string, branch: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`, // 🔑 Passing our secret key
      Accept: "application/vnd.github.v3+json",
    },
  });

  // ❌ Throw error so our fallback logic can catch it
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return await res.json();
}
