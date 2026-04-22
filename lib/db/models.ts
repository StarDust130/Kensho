/**
 * 📄 What this file does:
 * 🏗️ Defines the blueprints (schemas) for the data we save in our database.
 * 📦 Repository: Saves info about the code repositories we analyze.
 * 📄 Node: Saves info about individual files in a repository.
 * 🔗 Edge: Saves connections (how files import/export each other).
 * � Issue: Saves bad code smells and bugs we find during analysis.
 * �🚀 Uses strict types and keeps hot-reloading safe.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// 📦 Repository Types & Schema
export interface IRepository extends Document {
  repoId: string;
  status: "pending" | "analyzing" | "completed" | "failed";
  analyzedAt?: Date;
  infrastructure?: {
    auth: string[];
    database: string[];
    styling: string[];
    frameworks: string[];
    tools: string[];
  };
}

const repositorySchema = new Schema<IRepository>(
  {
    repoId: { type: String, required: true, unique: true }, // Format: 'owner/repo'
    status: {
      type: String,
      enum: ["pending", "analyzing", "completed", "failed"],
      default: "pending",
    },
    analyzedAt: { type: Date },
    infrastructure: {
      auth: [String],
      database: [String],
      styling: [String],
      frameworks: [String],
      tools: [String],
    },
  },
  { timestamps: true },
);

// 📄 Node (File) Types & Schema
export interface INode extends Document {
  repoId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  complexityScore: number;
}

const nodeSchema = new Schema<INode>(
  {
    repoId: { type: String, required: true, index: true }, // Indexed for fast lookups per repo
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String }, // e.g., '.ts', '.js'
    complexityScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// 🔗 Edge (Import/Export Connection) Types & Schema
export interface IEdge extends Document {
  repoId: string;
  source: string;
  target: string;
}

const edgeSchema = new Schema<IEdge>(
  {
    repoId: { type: String, required: true, index: true }, // Indexed for fast lookups per repo
    source: { type: String, required: true }, // Matches a Node's filePath
    target: { type: String, required: true }, // Matches a Node's filePath
  },
  { timestamps: true },
);

// � Issue (Code Smells & Bugs) Types & Schema
export interface IIssue extends Document {
  repoId: string;
  filePath: string;
  issueType: string;
  message: string;
  severity: "low" | "medium" | "high";
  lineNumber?: number;
}

const issueSchema = new mongoose.Schema<IIssue>({
  repoId: String,
  filePath: String,
  issueType: String,
  message: String,
  severity: String,
  lineNumber: Number,
});

// 🚀 Export Models (Conditionally compiled for Next.js hot-reloads to prevent OverwriteModelError)

export const Repository: Model<IRepository> =
  mongoose.models.Repository ||
  mongoose.model<IRepository>("Repository", repositorySchema);

export const Node: Model<INode> =
  mongoose.models.Node || mongoose.model<INode>("Node", nodeSchema);

export const Edge: Model<IEdge> =
  mongoose.models.Edge || mongoose.model<IEdge>("Edge", edgeSchema);

export const Issue =
  mongoose.models.Issue || mongoose.model("Issue", issueSchema);
