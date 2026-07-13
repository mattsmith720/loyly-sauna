import { faq } from "@/lib/copy";

export function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <div className="sec-head reveal-up">
          <p className="eyebrow">{faq.eyebrow}</p>
          <h2 id="faq-title">{faq.title}</h2>
        </div>
        <div className="faq-list reveal-up">
          {faq.items.map((item, index) => (
            <details key={item.q} name="faq" open={index === 0}>
              <summary>
                <span>{item.q}</span>
                <span className="plus" aria-hidden="true">
                  <span />
                  <span />
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
