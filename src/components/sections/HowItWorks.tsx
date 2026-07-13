import { howItWorks } from "@/lib/copy";

export function HowItWorks() {
  return (
    <section className="how" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="sec-head reveal-up">
          <p className="eyebrow">{howItWorks.eyebrow}</p>
          <h2 id="how-title">{howItWorks.title}</h2>
        </div>
        <ol className="steps stagger-up">
          {howItWorks.steps.map((step) => (
            <li key={step.n} className="step">
              <span className="step-n" aria-hidden="true">
                {step.n}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
