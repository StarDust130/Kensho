"use client";

import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
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
      data: { label: node.fileName },
      position: { x: 0, y: 0 },
      style: {
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "10px",
        color: "#0f172a",
        fontWeight: 500,
        fontSize: "14px",
      },
    }));

    // Map backend edges
    const initialEdges = edges.map((edge) => ({
      id: `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: "#94a3b8", strokeWidth: 2 },
    }));

    return getLayoutedElements(initialNodes, initialEdges);
  }, [nodes, edges]);

  return (
    <div className="w-full h-full min-h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative">
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        className="w-full h-full"
      >
        <Background color="#ccc" gap={16} />
        <Controls />
        <MiniMap
          nodeColor="#e2e8f0"
          maskColor="rgba(248, 250, 252, 0.7)"
          className="border border-slate-200 rounded shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
