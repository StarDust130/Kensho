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

const FIT_VIEW_OPTIONS = { padding: 0.2 };

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
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "12px 16px",
        color: "#f8fafc",
        fontWeight: 600,
        fontSize: "13px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
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
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        minZoom={0.1}
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
