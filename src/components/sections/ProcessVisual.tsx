import { processSteps } from "@/lib/copy";

function StepIcon({ type }: { type: (typeof processSteps)[number]["icon"] }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (type) {
    case "camera":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );
    case "steam":
      return (
        <svg {...props}>
          <path d="M8 18c0-3 2-4 2-7s-2-3-2-6" />
          <path d="M12 20c0-3.5 2.5-5 2.5-8.5S12 8 12 4" />
          <path d="M16 17c0-2.5 1.8-3.5 1.8-6.2S16 7.5 16 5" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
  }
}

export function ProcessVisual() {
  return (
    <section className="process-visual" aria-label="How we work">
      <div className="wrap">
        <div className="process-track stagger-up">
          {processSteps.map((step, index) => (
            <div key={step.id} className="process-step">
              <div className="process-node">
                <span className="process-icon">
                  <StepIcon type={step.icon} />
                </span>
                <span className="process-label">{step.label}</span>
              </div>
              {index < processSteps.length - 1 && <div className="process-connector" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
