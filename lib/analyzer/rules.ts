/**
 * 📄 What this file does:
 * 🕵️‍♂️ Acts as a detective to find bad code patterns (Static Analysis).
 * 🐢 Finds slow N+1 database queries inside loops.
 * 🛑 Spots missing error handling for databases/API calls.
 * 🍔 Warns you if a file is way too huge (over 300 lines).
 * 🧹 Catches leftover console.log statements before they go to production.
 */

// 📦 Shape of the files going into the analyzer
export interface InputFile {
  path: string;
  content: string;
}

// 🚩 Shape of the issues we report back
export interface AnalysisIssue {
  filePath: string;
  issueType: string;
  message: string;
  severity: "low" | "medium" | "high";
  lineNumber: number;
}

/**
 * 🔍 Main function to scan files and find code smells
 * @param files Array of files to check
 * @returns A list of found issues
 */
export function runStaticAnalysis(files: InputFile[]): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  for (const file of files) {
    const lines = file.content.split("\n");

    // 🍔 Rule 3: Bloated File (Low) -> Over 300 lines
    if (lines.length > 300) {
      issues.push({
        filePath: file.path,
        issueType: "Bloated File",
        message: `File is very large (${lines.length} lines). Consider splitting it up to reduce coupling.`,
        severity: "low",
        lineNumber: 1, // 📍 Put it at the top of the file
      });
    }

    // 🛑 Rule 2: Missing Error Handling (Medium)
    // Does it talk to a DB or API?
    const hasDbOrApi = /(mongoose|prisma|fetch\()/i.test(file.content);
    // Does it handle errors?
    const hasCatch = /\bcatch\b/.test(file.content);

    if (hasDbOrApi && !hasCatch) {
      issues.push({
        filePath: file.path,
        issueType: "Missing Error Handling",
        message:
          "File makes database or API calls but does not contain a 'catch' block.",
        severity: "medium",
        lineNumber: 1, // 📍 Put it at the top since it's a file-wide issue
      });
    }

    // 🧠 Keep track of if we are currently inside a loop block for Rule 1
    let insideLoop = false;
    let loopBraceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const currentLineNumber = i + 1; // 📍 Line numbers start at 1, not 0!

      // 🧹 Rule 4: Leftover Debugging (Low) -> console.log
      if (line.includes("console.log")) {
        issues.push({
          filePath: file.path,
          issueType: "Leftover Debugging",
          message:
            "Found a console.log statement. Please remove it before production.",
          severity: "low",
          lineNumber: currentLineNumber,
        });
      }

      // 🐢 Rule 1: N+1 Query Risk (High) -> await inside a loop
      // 🕵️‍♂️ Detect the start of a loop
      if (/\b(for|while)\s*\(/.test(line)) {
        insideLoop = true;
        // 🔄 Count opening braces on the loop line, or assume it starts
        if (line.includes("{")) {
          loopBraceCount += (line.match(/\{/g) || []).length;
        }
      }

      if (insideLoop) {
        // ⚠️ Look for 'await' inside the loop body
        if (/\bawait\b/.test(line)) {
          issues.push({
            filePath: file.path,
            issueType: "N+1 Query Risk",
            message:
              "Found 'await' inside a loop. This can cause massive performance bottlenecks.",
            severity: "high",
            lineNumber: currentLineNumber,
          });
        }

        // 🔄 Track braces to know when the loop ends
        if (line.includes("{") && !/\b(for|while)\s*\(/.test(line)) {
          loopBraceCount += (line.match(/\{/g) || []).length;
        }
        if (line.includes("}")) {
          loopBraceCount -= (line.match(/\}/g) || []).length;
          // 🚪 If braces balance out, we exited the loop
          if (loopBraceCount <= 0) {
            insideLoop = false;
            loopBraceCount = 0;
          }
        }
      }
    }
  }

  // 🎉 Send back all the clues we found!
  return issues;
}
