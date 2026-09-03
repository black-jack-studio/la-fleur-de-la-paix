type RoseMarkProps = {
  className?: string;
  strokeWidth?: number;
};

/**
 * Hand-authored engraving-style rose bloom, built as a symmetric rosette of
 * layered petal strokes (rotated copies of one drawn petal), in the manner
 * of a botanical specimen plate. Renders in `currentColor`.
 */
export function RoseMark({ className, strokeWidth = 1.1 }: RoseMarkProps) {
  const innerPetals = Array.from({ length: 5 }, (_, i) => i * 72 + 10);
  const outerPetals = Array.from({ length: 7 }, (_, i) => i * (360 / 7));

  return (
    <svg
      viewBox="-100 -110 200 210"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* stem */}
      <path
        d="M2,60 C -6,90 4,120 -3,150 C -8,168 2,182 -2,196"
        strokeWidth={strokeWidth * 1.1}
      />
      {/* thorn */}
      <path d="M-2,120 C -14,116 -20,108 -22,98" strokeWidth={strokeWidth * 0.9} />
      {/* leaves */}
      <path
        d="M-3,140 C -30,132 -48,142 -60,166 C -40,166 -18,162 -3,140 Z"
        strokeWidth={strokeWidth * 0.9}
      />
      <path d="M-30,148 C -32,156 -34,162 -38,166" strokeWidth={strokeWidth * 0.6} />
      <path
        d="M0,168 C 22,164 42,176 50,198 C 30,196 10,190 0,168 Z"
        strokeWidth={strokeWidth * 0.9}
      />
      <path d="M22,176 C 26,184 28,190 32,196" strokeWidth={strokeWidth * 0.6} />

      {/* outer, looser ring of petals */}
      {outerPetals.map((deg) => (
        <path
          key={`outer-${deg}`}
          d="M0,0 C -26,-14 -30,-48 -8,-72 C 0,-80 10,-76 8,-64 C 26,-52 30,-20 0,0 Z"
          transform={`rotate(${deg})`}
        />
      ))}

      {/* inner, tighter ring of petals */}
      {innerPetals.map((deg) => (
        <path
          key={`inner-${deg}`}
          d="M0,0 C -14,-8 -17,-28 -4,-42 C 0,-46 6,-44 5,-37 C 15,-30 17,-11 0,0 Z"
          transform={`rotate(${deg}) scale(0.72)`}
        />
      ))}

      {/* center swirl */}
      <path d="M-6,-2 C -9,-9 -3,-15 4,-13 C 10,-11 10,-3 4,0 C -1,2 -8,0 -9,-6" strokeWidth={strokeWidth * 0.85} />
    </svg>
  );
}
