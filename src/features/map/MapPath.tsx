interface MapPathProps {
  pathD: string;
}

export function MapPath({ pathD }: MapPathProps) {
  return (
    <path
      d={pathD}
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="4"
      strokeDasharray="8,6"
    />
  );
}
