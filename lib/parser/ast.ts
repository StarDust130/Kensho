/**
 * 📄 What this file does:
 * 🧠 Uses ts-morph to act like a brain and understand the code.
 * 📂 Creates a fake "in-memory" file system so we don't save junk to disk.
 * 🧮 Calculates how complex a file is (counting classes, functions).
 * 🔗 Finds connections between files (who imports who).
 * 🚀 Super fast, strict types, and Next.js safe!
 */

import { Project, SyntaxKind, SourceFile, StringLiteral } from "ts-morph";
import path from "path";

// 📦 Shape of exactly what a Node (File) looks like
export interface AstNode {
  repoId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  complexityScore: number;
}

// 🔗 Shape of exactly what an Edge (Import Link) looks like
export interface AstEdge {
  repoId: string;
  source: string;
  target: string;
}

// 📥 Input shape for our files
export interface InputFile {
  path: string;
  content: string;
}

/**
 * 🧮 Little helper to count how complex the file is!
 * @param sourceFile The file we are looking at
 * @returns A simple number sum of all classes, interfaces, and functions
 */
function calculateComplexity(sourceFile: SourceFile): number {
  // 🔍 Count standard things
  const classes = sourceFile.getClasses().length;
  const interfaces = sourceFile.getInterfaces().length;
  const functions = sourceFile.getFunctions().length;

  // 🏹 Arrow functions are sneaky, so we find them specifically!
  const arrowFunctions = sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrowFunction,
  ).length;

  // ➕ Add them all up for a total score
  return classes + interfaces + functions + arrowFunctions;
}

/**
 * 🏗️ Main function to build our graph of nodes (files) and edges (imports)
 * @param files Array of downloaded files
 * @param repoId The ID of the repository we are analyzing
 */
export async function buildGraph(
  files: InputFile[],
  repoId: string,
): Promise<{ nodes: AstNode[]; edges: AstEdge[] }> {
  // 🧠 1️⃣ Start a new fake in-memory project! (No disk writing)
  const project = new Project({
    useInMemoryFileSystem: true,
  });

  // 📝 Keep a dictionary of all our real file paths so we can match imports correctly
  // ts-morph often adds a leading slash, so we normalize our incoming files to safely match
  const fileMap = new Map<string, string>();

  // 📂 2️⃣ Load every single file into our fake project
  for (const file of files) {
    // 🔧 Ensure paths start with a slash for posix consistency (Mac/Windows safe)
    const fakePath = file.path.startsWith("/") ? file.path : `/${file.path}`;

    project.createSourceFile(fakePath, file.content);

    // 💾 Save our normalized path to original path mapping!
    fileMap.set(fakePath, file.path);
  }

  const nodes: AstNode[] = [];
  const edges: AstEdge[] = [];

  // 🔄 3️⃣ Read files again to extract Nodes and Edges
  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath(); // Example: "/src/App.ts"
    const originalPath = fileMap.get(filePath) || filePath.replace(/^\//, "");

    // 📝 Get standard file info
    const baseName = sourceFile.getBaseName(); // Example: "App.ts"
    const extension = sourceFile.getExtension(); // Example: ".ts"

    // 🧮 4️⃣ Calculate complexity via our helper
    const complexityScore = calculateComplexity(sourceFile);

    // 📦 Build the actual Node object and save it
    nodes.push({
      repoId,
      filePath: originalPath,
      fileName: baseName,
      fileType: extension,
      complexityScore,
    });

    // 🔗 5️⃣ Dig out all the Import connections (Edges)
    const rawImports: string[] = [];

    // 📦 A: Get standard ES6 Imports (import { x } from './y')
    const importDeclarations = sourceFile.getImportDeclarations();
    for (const importDecl of importDeclarations) {
      rawImports.push(importDecl.getModuleSpecifierValue());
    }

    // 📦 B: Get old-school CommonJS Imports (require('./y'))
    const callExpressions = sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    );
    for (const callExpr of callExpressions) {
      if (callExpr.getExpression().getText() === "require") {
        const args = callExpr.getArguments();

        // 🎯 Ensure it actually has a string argument!
        if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
          const stringArg = args[0] as StringLiteral;
          rawImports.push(stringArg.getLiteralValue());
        }
      }
    }

    // 🔄 Now process all imports and requires
    for (const moduleSpecifier of rawImports) {
      let cleanPath = moduleSpecifier;

      // 🧹 Resolve aliases and clean up
      if (cleanPath.startsWith("@/")) {
        cleanPath = cleanPath.replace("@/", "");
      }
      if (cleanPath.startsWith("src/")) {
        cleanPath = cleanPath.replace("src/", "");
      }

      // 🛠️ Also strip basic relative paths so fuzzy matching doesn't fail
      cleanPath = cleanPath.replace(/^(\.\/|\.\.\/)+/, "");

      // 🛑 External imports generally don't include slashes! Skip them.
      if (!moduleSpecifier.startsWith(".") && !moduleSpecifier.includes("/")) {
        continue;
      }

      // 🎯 Fuzzy match: check if any node's filePath includes the cleanPath! Do not enforce exact string match.
      const targetNode = nodes.find((node) =>
        node.filePath.includes(cleanPath),
      );

      // 🔗 If we successfully found the fuzzy matched local file, hook them together!
      if (targetNode) {
        edges.push({
          repoId,
          source: originalPath,
          target: targetNode.filePath,
        });
      }
    }
  }

  // 🎉 Return the finished brain analysis!
  return { nodes, edges };
}
