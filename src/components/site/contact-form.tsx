"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/lib/actions/contact";
import { SiteButton } from "./site-button";

const inputClass =
  "w-full rounded-[10px] border border-site-line bg-site-surface px-4 py-3 text-[15px] text-site-text placeholder:text-site-muted focus:border-metal-500 focus:outline-none";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    submitContact,
    null,
  );

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <input
        name="name"
        placeholder="Nome e cognome"
        autoComplete="name"
        className={inputClass}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        className={inputClass}
      />
      <textarea
        name="message"
        placeholder="Raccontaci la tua attività e cosa ti serve"
        rows={5}
        className={inputClass}
      />
      <div className="flex flex-wrap items-center gap-4">
        <SiteButton type="submit" disabled={pending} variant="primary">
          {pending ? "Invio…" : "Invia richiesta"}
        </SiteButton>
        {state ? (
          <span
            className={
              state.ok
                ? "text-[15px] text-metal-200"
                : "text-[15px] text-[#e5836f]"
            }
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
