import React, { useRef, useEffect, useState, useMemo } from 'react';
import { MetroZone } from '../types/telemetry';
import { GridNodePoint } from '../services/fleetSimulator';
import { Crosshair, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MetroGridMapProps {
  nodes: GridNodePoint[];
  selectedZone: MetroZone | 'ALL';
  onSelectZone: (zone: MetroZone | 'ALL') => void;
  onSelectNode: (node: GridNodePoint) => void;
  selectedNode: GridNodePoint | null;
}

export const MetroGridMap: React.FC<MetroGridMapProps> = ({
  nodes,
  selectedZone,
  onSelectZone,
  onSelectNode,
  selectedNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [hoveredNode, setHoveredNode] = useState<GridNodePoint | null>(null);

  // Dynamically compute zone statistics from current node state
  const zoneStats = useMemo(() => {
    const zones: MetroZone[] = ['Downtown', 'North Hills', 'Industrial Park', 'East Suburbs', 'South Basin'];
    const result: Record<MetroZone, {
      tamperCount: number;
      batteryCount: number;
      rfCount: number;
      totalCount: number;
      healthPercent: string;
      primaryColor: string;
    }> = {} as any;

    zones.forEach((z) => {
      const zoneNodes = nodes.filter((n) => n.zone === z);
      const tampers = zoneNodes.filter((n) => n.status === 'TAMPER').length;
      const batteries = zoneNodes.filter((n) => n.status === 'BATTERY_DECAY').length;
      const rfs = zoneNodes.filter((n) => n.status === 'RF_JAM').length;
      const nominal = zoneNodes.length - tampers - batteries - rfs;
      const health = zoneNodes.length > 0 ? ((nominal / zoneNodes.length) * 100).toFixed(1) : '99.5';

      let primaryColor = '#10B981';
      if (tampers > 0) primaryColor = '#EF4444';
      else if (batteries > 0) primaryColor = '#F59E0B';

      result[z] = {
        tamperCount: tampers,
        batteryCount: batteries,
        rfCount: rfs,
        totalCount: zoneNodes.length,
        healthPercent: health,
        primaryColor,
      };
    });

    return result;
  }, [nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (selectedZone === 'ALL') return nodes;
    return nodes.filter((n) => n.zone === selectedZone);
  }, [nodes, selectedZone]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      ctx.fillStyle = '#070B16';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw 2.5D Isometric Grid & Sector Lines
      ctx.save();
      ctx.strokeStyle = '#0E172A';
      ctx.lineWidth = 1;

      // Perspective Grid Lines
      const gridSpacing = 40 * zoom;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw Zone Outline Boundaries (faint cyan polygonal sector loops)
      const zonePolygons: Record<MetroZone, [number, number][]> = {
        'North Hills': [[20, 10], [52, 8], [55, 34], [18, 36]],
        'Downtown': [[36, 36], [68, 34], [70, 64], [34, 66]],
        'Industrial Park': [[64, 20], [92, 18], [94, 52], [66, 54]],
        'East Suburbs': [[66, 58], [95, 56], [96, 92], [64, 94]],
        'South Basin': [[12, 58], [42, 56], [44, 92], [14, 94]],
      };

      Object.entries(zonePolygons).forEach(([zoneName, points]) => {
        const isCurrentZone = selectedZone === 'ALL' || selectedZone === zoneName;
        ctx.beginPath();
        points.forEach(([px, py], idx) => {
          const sx = (px / 100) * width;
          const sy = (py / 100) * height;
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.strokeStyle = isCurrentZone 
          ? (zoneName === 'North Hills' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(0, 240, 255, 0.35)') 
          : 'rgba(30, 41, 59, 0.2)';
        ctx.lineWidth = isCurrentZone ? 1.5 : 1;
        ctx.stroke();

        if (isCurrentZone) {
          ctx.fillStyle = zoneName === 'North Hills' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(0, 240, 255, 0.03)';
          ctx.fill();

          // Zone Title text
          const [firstX, firstY] = points[0];
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = zoneName === 'North Hills' ? '#F87171' : '#38BDF8';
          ctx.fillText(`SECTOR: ${zoneName.toUpperCase()}`, (firstX / 100) * width + 8, (firstY / 100) * height + 14);
        }
      });

      // 3. Draw Micro-Nodes (1500+ endpoints)
      filteredNodes.forEach((node) => {
        const nx = (node.x / 100) * width;
        const ny = (node.y / 100) * height;

        // Dynamic pulsing brightness
        const pulse = 0.5 + Math.sin(t * 2 + node.x * 0.1) * 0.5;

        if (node.isStrobeBeacon || node.status === 'TAMPER') {
          // Strobe warning rings (North Hills physical tampers)
          const ringRadius1 = 12 + ((t * 25) % 35);
          const ringRadius2 = 12 + (((t * 25) + 18) % 35);
          const ringAlpha1 = Math.max(0, 1 - ringRadius1 / 35);
          const ringAlpha2 = Math.max(0, 1 - ringRadius2 / 35);

          // Outer beacon rings
          ctx.beginPath();
          ctx.arc(nx, ny, ringRadius1, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${ringAlpha1 * 0.8})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(nx, ny, ringRadius2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${ringAlpha2 * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Core node
          ctx.beginPath();
          ctx.arc(nx, ny, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FF2222';
          ctx.shadowColor = '#FF0000';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Callout pin label
          ctx.fillStyle = '#FEF2F2';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillText('TAMPER DETECTED', nx + 8, ny - 6);
          ctx.fillStyle = '#F87171';
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillText(node.id, nx + 8, ny + 4);
        } else if (node.status === 'BATTERY_DECAY') {
          // Amber cluster dot
          ctx.beginPath();
          ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${0.6 + pulse * 0.4})`;
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Nominal cyan-green micro-dot
          ctx.beginPath();
          ctx.arc(nx, ny, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + pulse * 0.5})`;
          ctx.fill();
        }

        // Selected node indicator
        if (selectedNode && selectedNode.id === node.id) {
          ctx.beginPath();
          ctx.arc(nx, ny, 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [filteredNodes, selectedZone, selectedNode, zoom]);

  // Handle Canvas Click to select closest node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Find closest node within 4% distance
    let closestNode: GridNodePoint | null = null;
    let minDist = 4.0;

    filteredNodes.forEach((node) => {
      const dist = Math.hypot(node.x - clickX, node.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        closestNode = node;
      }
    });

    if (closestNode) {
      onSelectNode(closestNode);
    }
  };

  // Handle Mouse Move for hover inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const hoverX = ((e.clientX - rect.left) / rect.width) * 100;
    const hoverY = ((e.clientY - rect.top) / rect.height) * 100;

    let closestNode: GridNodePoint | null = null;
    let minDist = 3.0;

    filteredNodes.forEach((node) => {
      const dist = Math.hypot(node.x - hoverX, node.y - hoverY);
      if (dist < minDist) {
        minDist = dist;
        closestNode = node;
      }
    });

    setHoveredNode(closestNode);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#070A12] border-r border-[#1E293B] overflow-hidden">
      {/* Top Map Control Bar */}
      <div className="px-4 py-2 bg-[#0B0F19]/90 border-b border-[#1E293B] flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Interactive 2.5D City Map: Metro Austin Fleet
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            {filteredNodes.length.toLocaleString()} Active Nodes
          </span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
            className="p-1 rounded bg-[#121A2D] hover:bg-[#1C2844] text-slate-300 border border-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
            className="p-1 rounded bg-[#121A2D] hover:bg-[#1C2844] text-slate-300 border border-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              onSelectZone('ALL');
            }}
            className="p-1 rounded bg-[#121A2D] hover:bg-[#1C2844] text-slate-300 border border-slate-700"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone Health Quick Selector Pill Bar */}
      <div className="px-3 py-1.5 bg-[#090D1A] border-b border-[#151D2E] flex flex-wrap items-center gap-1.5 text-[11px] font-mono z-10">
        <button
          onClick={() => onSelectZone('ALL')}
          className={`px-2 py-0.5 rounded transition ${
            selectedZone === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ALL ZONES
        </button>

        {(Object.keys(zoneStats) as MetroZone[]).map((zoneName) => {
          const stat = zoneStats[zoneName];
          const isSelected = selectedZone === zoneName;

          return (
            <button
              key={zoneName}
              onClick={() => onSelectZone(zoneName)}
              className={`px-2 py-0.5 rounded transition flex items-center space-x-1 border ${
                isSelected
                  ? 'bg-[#152037] border-cyan-400/60 text-cyan-200 shadow-sm'
                  : 'bg-[#0E1526]/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span style={{ color: stat.primaryColor }}>
                {stat.tamperCount > 0 ? '▲' : stat.batteryCount > 0 ? '■' : '●'}
              </span>
              <span>{zoneName}</span>
              <div className="flex items-center space-x-1 text-[9px]">
                {stat.tamperCount > 0 && (
                  <span className="bg-rose-950/70 text-rose-300 font-semibold px-1 rounded border border-rose-800/60">
                    {stat.tamperCount} Crit
                  </span>
                )}
                {stat.batteryCount > 0 && (
                  <span className="bg-amber-950/70 text-amber-300 font-semibold px-1 rounded border border-amber-800/60">
                    {stat.batteryCount} Major
                  </span>
                )}
                {stat.tamperCount === 0 && stat.batteryCount === 0 && (
                  <span className="text-emerald-400 font-semibold">
                    {stat.healthPercent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1000}
          height={650}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredNode(null)}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#0B0F19]/90 border border-slate-800 backdrop-blur-md rounded px-3 py-2 text-[10px] font-mono space-y-1 pointer-events-none">
          <div className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-1">
            Map Grid Legend
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Nominal Meter (Delta = 0, V &gt; 3.0V)</span>
          </div>
          <div className="flex items-center space-x-2 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Battery Decay Cluster (East Suburbs)</span>
          </div>
          <div className="flex items-center space-x-2 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Critical Physical/Magnetic Tamper Beacon</span>
          </div>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredNode && (
          <div
            className="absolute bg-[#0D1424] border border-cyan-500/40 shadow-xl rounded px-2.5 py-1.5 text-[11px] font-mono text-slate-200 pointer-events-none z-20"
            style={{
              left: `${Math.min(80, hoveredNode.x)}%`,
              top: `${Math.max(5, hoveredNode.y - 12)}%`,
            }}
          >
            <div className="font-bold text-cyan-300">{hoveredNode.id}</div>
            <div className="text-slate-400 text-[10px]">Zone: {hoveredNode.zone}</div>
            <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
              <span className="text-slate-300">V_batt: {hoveredNode.batteryVolts.toFixed(2)}V</span>
              <span
                className={`font-semibold ${
                  hoveredNode.status === 'TAMPER'
                    ? 'text-rose-400'
                    : hoveredNode.status === 'BATTERY_DECAY'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {hoveredNode.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
