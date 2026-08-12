import React from 'react';

interface Skill {
  name: string;
  value: number;
  icon: any;
  color: string;
}

interface SevenSkillsRadarProps {
  skills: Skill[];
  size?: number;
}

const SevenSkillsRadar = ({ skills, size = 420 }: SevenSkillsRadarProps) => {
  const center = size / 2;
  const radius = 110;
  const numSkills = skills.length;

  const getPoint = (index: number, percent: number) => {
    const angle = (index * 2 * Math.PI) / numSkills - Math.PI / 2;
    const r = (percent / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = skills.map((skill, index) => getPoint(index, skill.value));
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {[...Array(5)].map((_, i) => {
          const r = (radius / 5) * (i + 1);
          const gridPoints = skills.map((_, index) => {
            const angle = (index * 2 * Math.PI) / numSkills - Math.PI / 2;
            return {
              x: center + r * Math.cos(angle),
              y: center + r * Math.sin(angle),
            };
          });
          const gridPath = gridPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          return <path key={i} d={gridPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />;
        })}

        {skills.map((_, index) => {
          const p = getPoint(index, 100);
          return <line key={index} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />;
        })}

        <path d={pathData} fill="rgba(234, 179, 8, 0.35)" stroke="#EAB308" strokeWidth="2" />

        {points.map((p, index) => (
          <circle key={index} cx={p.x} cy={p.y} r="4" fill="#EAB308" />
        ))}
      </svg>

      {skills.map((skill, index) => {
        const angle = (index * 2 * Math.PI) / numSkills - Math.PI / 2;
        const labelRadius = radius + 45;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);

        return (
          <div
            key={skill.name}
            className="absolute text-[11px] font-bold uppercase tracking-wider text-gray-300 text-center whitespace-nowrap px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm pointer-events-none"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {skill.name}
          </div>
        );
      })}
    </div>
  );
};

export default SevenSkillsRadar;