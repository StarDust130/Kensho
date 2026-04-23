"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeProps,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

interface CodeNode {
  filePath: string;
  fileName: string;
}

interface CodeEdge {
  source: string;
  target: string;
}

interface CodeGraphProps {
  nodes: CodeNode[];
  edges: CodeEdge[];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 50;

const FIT_VIEW_OPTIONS = { padding: 0.2 };

function GlassNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="min-w-[180px] rounded-xl border border-cyan-400/20 bg-slate-900/95 px-3 py-2 shadow-[0_0_20px_rgba(34,211,238,0.12)] backdrop-blur-md">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-300 !w-2.5 !h-2.5"
      />
      <p className="text-[12px] font-semibold text-slate-100 truncate">
        {data.label}
      </p>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-300 !w-2.5 !h-2.5"
      />
    </div>
  );
}

const NODE_TYPES = {
  glass: GlassNode,
};

const getLayoutedElements = (initialNodes: any[], initialEdges: any[]) => {
  dagreGraph.setGraph({ rankdir: "LR" });

  initialNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  initialEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = initialNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // We are shifting the dagre node position (anchor=center center)
    // to the top left so it matches React Flow's coordinate system
    return {
      ...node,
      targetPosition: "left",
      sourcePosition: "right",
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges: initialEdges };
};

export default function CodeGraph({ nodes, edges }: CodeGraphProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    // Map backend nodes
    const initialNodes = nodes.map((node) => ({
      id: node.filePath,
      type: "glass",
      data: { label: node.fileName },
      position: { x: 0, y: 0 },
      style: {
        background: "transparent",
        border: "none",
        borderRadius: "12px",
        padding: 0,
        color: "#f8fafc",
        fontWeight: 600,
        fontSize: "13px",
        boxShadow: "none",
      },
    }));

    // Map backend edges
    const initialEdges = edges.map((edge) => ({
      id: `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: "#334155", strokeWidth: 2 },
    }));

    return getLayoutedElements(initialNodes, initialEdges);
  }, [nodes, edges]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden bg-[#020617] relative border border-white/5">
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        minZoom={0.1}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        className="w-full h-full"
      >
        <Background color="#1e293b" gap={16} />
        <Controls className="fill-white bg-slate-900 border-white/10" />
        <MiniMap
          nodeColor="#1e293b"
          maskColor="rgba(2, 6, 23, 0.8)"
          className="border border-white/10 rounded-[12px] bg-[#0f172a]"
        />
      </ReactFlow>
    </div>
  );
}
