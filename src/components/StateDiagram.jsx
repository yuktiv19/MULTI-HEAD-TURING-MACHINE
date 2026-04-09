import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './StateDiagram.css';

/**
 * StateDiagram — Renders a force-directed state transition diagram using D3.js.
 * Nodes = states, edges = transitions with labels.
 * Current state is highlighted with a pulsing effect.
 */
export default function StateDiagram({ transitions, states, startState, acceptState, rejectState, currentState }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !states || states.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current?.clientWidth || 600;
    const height = 350;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Get computed CSS variable colors
    const computedStyle = getComputedStyle(document.documentElement);
    const textColor = computedStyle.getPropertyValue('--text-primary').trim() || '#e8ecf4';
    const textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || '#9ca3b8';
    const accentColor = computedStyle.getPropertyValue('--accent').trim() || '#6366f1';
    const successColor = computedStyle.getPropertyValue('--success').trim() || '#10b981';
    const dangerColor = computedStyle.getPropertyValue('--danger').trim() || '#ef4444';
    const bgSurface = computedStyle.getPropertyValue('--bg-surface').trim() || '#181b28';

    // Build nodes
    const nodeMap = {};
    const nodes = states.map((s, i) => {
      const node = { id: s, index: i };
      nodeMap[s] = node;
      return node;
    });

    // Build links: aggregate transitions between same state pairs
    const linkMap = {};
    for (const t of transitions) {
      const key = `${t.currentState}→${t.nextState}`;
      if (!linkMap[key]) {
        linkMap[key] = {
          source: t.currentState,
          target: t.nextState,
          labels: [],
          isSelfLoop: t.currentState === t.nextState
        };
      }
      const read = t.readSymbols.join(',');
      const write = t.writeSymbols.join(',');
      const move = t.moves.join(',');
      linkMap[key].labels.push(`(${read})→(${write}),(${move})`);
    }
    const links = Object.values(linkMap);

    // Arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', textSecondary);

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Container group
    const g = svg.append('g');

    // Links
    const link = g.selectAll('.link-group')
      .data(links)
      .join('g')
      .attr('class', 'link-group');

    const linkPath = link.append('path')
      .attr('class', 'link')
      .attr('stroke', textSecondary)
      .attr('marker-end', 'url(#arrowhead)')
      .attr('opacity', 0.6);

    // Link labels
    const linkLabel = link.append('text')
      .attr('class', 'link-label')
      .attr('fill', accentColor)
      .attr('text-anchor', 'middle')
      .attr('dy', -6)
      .text(d => d.labels.length <= 2 ? d.labels.join(' | ') : d.labels[0] + ` (+${d.labels.length - 1})`);

    // Nodes
    const node = g.selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Node circles
    node.append('circle')
      .attr('r', d => d.id === acceptState ? 18 : 16)
      .attr('fill', d => {
        if (d.id === currentState) return accentColor;
        return bgSurface;
      })
      .attr('stroke', d => {
        if (d.id === acceptState) return successColor;
        if (d.id === rejectState) return dangerColor;
        if (d.id === currentState) return accentColor;
        return textSecondary;
      })
      .attr('stroke-width', d => (d.id === currentState || d.id === acceptState) ? 3 : 2);

    // Double circle for accept state
    node.filter(d => d.id === acceptState)
      .append('circle')
      .attr('r', 22)
      .attr('fill', 'none')
      .attr('stroke', successColor)
      .attr('stroke-width', 2);

    // Node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', d => d.id === currentState ? '#fff' : textColor)
      .attr('font-size', '11px')
      .text(d => d.id);

    // Start state arrow
    const startNode = nodes.find(n => n.id === startState);
    if (startNode) {
      g.append('line')
        .attr('class', 'start-arrow')
        .attr('stroke', accentColor)
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', 0);
    }

    // Tick function
    simulation.on('tick', () => {
      // Constrain nodes within bounds
      nodes.forEach(d => {
        d.x = Math.max(30, Math.min(width - 30, d.x));
        d.y = Math.max(30, Math.min(height - 30, d.y));
      });

      linkPath.attr('d', d => {
        if (d.isSelfLoop) {
          const x = d.source.x;
          const y = d.source.y;
          return `M${x},${y - 16} C${x - 40},${y - 70} ${x + 40},${y - 70} ${x},${y - 16}`;
        }
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

      linkLabel.attr('x', d => {
        if (d.isSelfLoop) return d.source.x;
        return (d.source.x + d.target.x) / 2;
      }).attr('y', d => {
        if (d.isSelfLoop) return d.source.y - 55;
        return (d.source.y + d.target.y) / 2;
      });

      node.attr('transform', d => `translate(${d.x},${d.y})`);

      // Update start arrow
      if (startNode) {
        g.select('.start-arrow')
          .attr('x1', startNode.x - 50)
          .attr('y1', startNode.y)
          .attr('x2', startNode.x - 22)
          .attr('y2', startNode.y);
      }
    });

    return () => simulation.stop();
  }, [transitions, states, startState, acceptState, rejectState, currentState]);

  if (!states || states.length === 0) {
    return (
      <div className="card state-diagram" id="state-diagram">
        <div className="card-title">
          <span className="icon">🔗</span> State Diagram
        </div>
        <div className="state-diagram-empty">
          Define states and transitions to generate the diagram.
        </div>
      </div>
    );
  }

  return (
    <div className="card state-diagram" id="state-diagram" ref={containerRef}>
      <div className="card-title">
        <span className="icon">🔗</span> State Diagram
      </div>
      <svg ref={svgRef} />
    </div>
  );
}
