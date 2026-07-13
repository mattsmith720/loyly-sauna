import { guarantee } from "@/lib/copy";
import { Button } from "@/components/ui/Button";

export function Guarantee() {
  return (
    <section className="guarantee" id="guarantee" aria-labelledby="guarantee-title">
      <div className="wrap guar-wrap">
        <div className="reveal-up">
          <p className="eyebrow">{guarantee.eyebrow}</p>
          <h2 id="guarantee-title">{guarantee.title}</h2>
          <p className="guar-promise">{guarantee.promise}</p>
          <p className="lead">{guarantee.lead}</p>
          <p className="muted">{guarantee.note}</p>
          <Button href="#book" variant="primary" size="lg" className="mt-2">
            {guarantee.cta}
          </Button>
        </div>
        <ol className="guar-visual reveal-up">
          {guarantee.rows.map((row, index) => (
            <li key={row.title} className="guar-row">
              <span className="guar-num" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <strong>{row.title}</strong>
                <p>{row.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
