'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'agent' | 'user';
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

interface AgentGraphProps {
  agents: { id: string; name: string }[];
  selectedAgentIds: string[];
  userName: string;
}

export default function AgentGraph({ agents, selectedAgentIds, userName }: AgentGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 400;
    const height = svgRef.current.clientHeight || 300;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes: Node[] = [
      { id: 'user', name: userName, type: 'user' },
      ...agents.map(a => ({ id: a.id, name: a.name, type: 'agent' as const }))
    ];

    const links: Link[] = selectedAgentIds.map(id => ({
      source: 'user',
      target: id
    }));

    // Also link selected agents to each other to form a "group" cluster
    if (selectedAgentIds.length > 1) {
      for (let i = 0; i < selectedAgentIds.length; i++) {
        for (let j = i + 1; j < selectedAgentIds.length; j++) {
          links.push({
            source: selectedAgentIds[i],
            target: selectedAgentIds[j]
          });
        }
      }
    }

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 2)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', d => d.type === 'user' ? 12 : 10)
      .attr('fill', d => {
        if (d.type === 'user') return '#8b5cf6'; // violet-500
        return selectedAgentIds.includes(d.id) ? '#10b981' : '#334155'; // emerald-500 or slate-700
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => d.name)
      .attr('x', 15)
      .attr('y', 5)
      .attr('fill', 'rgba(255,255,255,0.6)')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'sans-serif');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => { simulation.stop(); };
  }, [agents, selectedAgentIds, userName]);

  return (
    <div className="w-full h-full min-h-[200px] bg-black/20 rounded-3xl border border-white/5 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Mapa de Conexões</span>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
