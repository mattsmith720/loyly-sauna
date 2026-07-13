import { method } from "@/lib/copy";

function PillarIcon({ type }: { type: (typeof method.pillars)[number]["icon"] }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (type) {
    case "flask":
      return (
        <svg {...props}>
          <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
          <path d="M7 15h10" />
        </svg>
      );
    case "sanitise":
      return (
        <svg {...props}>
          <path d="M12 2c3 3.5 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5.5 5-9z" />
          <path d="M12 20v2" />
        </svg>
      );
    case "restore":
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 1 1 3 6.7" />
          <path d="M3 21v-4h4" />
        </svg>
      );
    case "camera":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M8 4l1.5-2h5L16 4" />
        </svg>
      );
  }
}

export function Method() {
  return (
    <section className="method" id="method" aria-labelledby="method-title">
      <div className="wrap">
        <div className="sec-head reveal-up">
          <p className="eyebrow">{method.eyebrow}</p>
          <h2 id="method-title">{method.title}</h2>
          <p className="lead mx-auto">{method.lead}</p>
        </div>
        <div className="feature-grid stagger-up">
          {method.pillars.map((pillar) => (
            <div key={pillar.id} className="feature">
              <span className="ficon" aria-hidden="true">
                <PillarIcon type={pillar.icon} />
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
