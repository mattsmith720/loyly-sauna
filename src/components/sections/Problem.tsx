import { problem } from "@/lib/copy";

export function Problem() {
  return (
    <section className="problem" id="problem" aria-labelledby="problem-title">
      <div className="wrap">
        <div className="sec-head reveal-up">
          <p className="eyebrow">{problem.eyebrow}</p>
          <h2 id="problem-title">{problem.title}</h2>
          <p className="lead mx-auto">{problem.lead}</p>
        </div>
        <div className="cost-cards stagger-up">
          {problem.cards.map((card) => (
            <div key={card.title} className="cost-card">
              <span className="cost-stat">{card.stat}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
