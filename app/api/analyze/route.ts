/**
 * 📄 What this file does:
 * 🚪 Acts as the main door (API endpoint) for our code analyzer.
 * 🌍 Takes a GitHub URL from the user.
 * 🗄️ Checks the database first to see if we already did the hard work (Cache).
 * 🏗️ If not, it downloads the code, builds the AST graph, and finds bad code smells!
 * 💾 Saves everything to the database so it's super fast next time.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Repository, Node, Edge, Issue } from "@/lib/db/models";
import { fetchRepoFiles } from "@/lib/github/fetcher";
import { buildGraph } from "@/lib/parser/ast";
import { runStaticAnalysis } from "@/lib/analyzer/rules";
import { extractTechStack } from "@/lib/ai/techstack";

/**
 * 🚀 Handle POST requests to /api/analyze
 * @param request The incoming HTTP request containing the repoUrl
 */
export async function POST(request: Request) {
  let repoId = "";

  try {
    // 📨 1️⃣ Get the URL from the request body
    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "❌ Missing or invalid repoUrl" },
        { status: 400 },
      );
    }

    // 🔍 2️⃣ Check if the URL looks like a real GitHub link
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json(
        {
          error:
            "❌ Invalid GitHub URL! Must be formatted like: https://github.com/owner/repo",
        },
        { status: 400 },
      );
    }

    const owner = match[1];
    const repo = match[2].replace(".git", "");
    repoId = `${owner}/${repo}`; // 🏷️ Make a unique ID out of it!

    // 🔌 3️⃣ Connect to our MongoDB database
    await connectDB();

    // 🗄️ 4️⃣ Check if we already analyzed this exact repo (Caching)
    const existingRepo = await Repository.findOne({ repoId });

    if (existingRepo && existingRepo.status === "completed") {
      console.log(`⚡ Cache Hit! Found existing data for ${repoId}`);

      // 📥 Grab all the saved Nodes (files) and Edges (imports)
      const nodes = await Node.find({ repoId }).lean();
      const edges = await Edge.find({ repoId }).lean();
      const issues = await Issue.find({ repoId }).lean();

      // 🎉 Return the cached data instantly!
      return NextResponse.json(
        {
          repoId,
          nodes,
          edges,
          // 🧱 Retrieve the cached AI tech stack infrastructure
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          infrastructure: (existingRepo as any).infrastructure || {},
          // 🚩 Return the cached bugs!
          issues,
        },
        { status: 200 },
      );
    }

    // 🏗️ 5️⃣ If it's new, tell the database we are working on it right now
    await Repository.findOneAndUpdate(
      { repoId },
      { status: "analyzing" },
      { upsert: true, returnDocument: "after" }, // 🆕 Create it if it doesn't exist yet!
    );

    // 🐙 6️⃣ Download all files AND 🤖 Extract Tech Stack concurrently!
    console.log(`📥 Downloading files & starting AI analysis for ${repoId}...`);
    const [files, infrastructure] = await Promise.all([
      fetchRepoFiles(repoUrl),
      extractTechStack(owner, repo),
    ]);

    // 🧠 7️⃣ Parse the code into an AST and wire up the imports (Edges)
    console.log(`🧠 Building AST Graph for ${repoId}...`);
    const { nodes, edges } = await buildGraph(files, repoId);

    // 🕵️‍♂️ 8️⃣ Scan the files for code smells and bad practices
    console.log(`🕵️‍♂️ Running Static Analysis for ${repoId}...`);
    const issues = runStaticAnalysis(files);

    // � Attach the repoId to all found issues so we know where they belong
    const formattedIssues = issues.map((issue) => ({ ...issue, repoId }));

    // 💾 9️⃣ Clear old data just in case, then save all the new data to the database
    console.log(`💾 Saving graph data to database for ${repoId}...`);
    await Node.deleteMany({ repoId });
    await Edge.deleteMany({ repoId });
    await Issue.deleteMany({ repoId });

    // 🧱 Insert everything in huge chunks (InsertMany is super fast!)
    if (nodes.length > 0) await Node.insertMany(nodes);
    if (edges.length > 0) await Edge.insertMany(edges);
    if (formattedIssues.length > 0) await Issue.insertMany(formattedIssues);

    // ✅ Update the repo status to show we finished successfully, AND save the AI stack!
    await Repository.findOneAndUpdate(
      { repoId },
      { status: "completed", analyzedAt: new Date(), infrastructure },
    );

    // 🎉 🔟 Return all the amazing data back to the user!
    return NextResponse.json(
      { repoId, nodes, edges, issues: formattedIssues, infrastructure },
      { status: 200 },
    );
  } catch (error) {
    // 🚨 💥 Uh oh! Something crashed somewhere in the pipeline.
    console.error("💥 Pipeline Error:", error);

    // 🛑 Update the DB to record the failure so it doesn't get stuck forever
    if (repoId) {
      try {
        await connectDB();
        await Repository.findOneAndUpdate({ repoId }, { status: "failed" });
      } catch (dbError) {
        console.error("🚨 Failed to update Repo status to 'failed':", dbError);
      }
    }

    return NextResponse.json(
      {
        error: "🚨 Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
