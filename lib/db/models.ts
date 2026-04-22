import mongoose, { Schema, Document, Model } from "mongoose";

// 📦 Repository Types & Schema
export interface IRepository extends Document {
  repoId: string;
  status: "pending" | "analyzing" | "completed" | "failed";
  analyzedAt?: Date;
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

// 🚀 Export Models (Conditionally compiled for Next.js hot-reloads to prevent OverwriteModelError)

export const Repository: Model<IRepository> =
  mongoose.models.Repository ||
  mongoose.model<IRepository>("Repository", repositorySchema);

export const Node: Model<INode> =
  mongoose.models.Node || mongoose.model<INode>("Node", nodeSchema);

export const Edge: Model<IEdge> =
  mongoose.models.Edge || mongoose.model<IEdge>("Edge", edgeSchema);
