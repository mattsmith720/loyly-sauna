import { Fragment } from "react";
import { siteConfig } from "@/lib/site-config";

type ContactEmailsProps = {
  className?: string;
  linkClassName?: string;
  separator?: string;
  showNames?: boolean;
};

export function ContactEmails({
  className,
  linkClassName,
  separator = " · ",
  showNames = true,
}: ContactEmailsProps) {
  const items = showNames ? siteConfig.contacts : siteConfig.emails.map((email) => ({ name: email, email }));

  return (
    <span className={className}>
      {items.map((contact, index) => (
        <Fragment key={contact.email}>
          {index > 0 && separator}
          <a href={`mailto:${contact.email}`} className={linkClassName} title={contact.email}>
            {showNames ? contact.name : contact.email}
          </a>
        </Fragment>
      ))}
    </span>
  );
}

export function contactEmailList(separator = ", ") {
  return siteConfig.emails.join(separator);
}
