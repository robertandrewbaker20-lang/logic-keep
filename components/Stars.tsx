type Props = {
  value: number;
  max?: number;
  size?: number;
};

export function Stars({ value, max = 3, size = 22 }: Props) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const on = i < value;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={on ? "star" : "opacity-35"}
            aria-hidden
          >
            <path
              d="M12 2.4l2.7 6.2 6.8.6-5.2 4.5 1.6 6.6L12 16.8 6.1 20.3l1.6-6.6L2.5 9.2l6.8-.6L12 2.4z"
              fill={on ? "#F4C95D" : "#d9c9b0"}
              stroke={on ? "#C4922A" : "#c8b79a"}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}
