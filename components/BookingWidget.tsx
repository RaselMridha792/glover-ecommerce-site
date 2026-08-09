"use client";

import { useEffect, useMemo, useState } from "react";
import { site } from "@/lib/site";

/**
 * Appointment booking flow.
 *
 * The client has chosen Acuity (gloverboxing.as.me) but the calendar is not
 * published yet, so this is a fully designed front end over the same journey:
 * session -> date -> time -> details -> confirmation. On the WordPress build
 * it is either kept and wired to the Acuity API, or swapped for the Acuity
 * embed code — the steps and the data collected are identical either way.
 */

type Session = {
  slug: string;
  name: string;
  duration: string;
  price: string;
  copy: string;
};

const SESSIONS: Session[] = [
  {
    slug: "trial",
    name: "Free Trial Session",
    duration: "60 min",
    price: "Free",
    copy: "One chance to feel the ring, the sweat, the pace. Gloves and wraps provided.",
  },
  {
    slug: "personal",
    name: "Personal Training",
    duration: "60 min",
    price: "$30",
    copy: "One-on-one with a coach who'll see through your excuses. Full focus, no hiding.",
  },
  {
    slug: "boxercise",
    name: "Boxercise Class",
    duration: "45 min",
    price: "$18",
    copy: "Rounds, ropes and combinations. Conditioning that teaches you how to fight.",
  },
  {
    slug: "strength",
    name: "Strength Training",
    duration: "60 min",
    price: "$18",
    copy: "Barbell and bodyweight work built around the demands of the ring.",
  },
];

const SLOT_TIMES = [
  "06:30",
  "07:30",
  "09:00",
  "12:00",
  "16:30",
  "17:30",
  "18:30",
  "19:30",
  "20:30",
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Stable per-slot availability so the grid does not reshuffle on re-render. */
function slotOpen(dateKey: string, time: string): boolean {
  const seed = `${dateKey}${time}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 10 > 2;
}

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function BookingWidget() {
  const [session, setSession] = useState<Session>(SESSIONS[0]);
  const [today, setToday] = useState<Date | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [details, setDetails] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  // Resolved after mount: reading the clock during render would desync SSR.
  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  const grid = useMemo(() => {
    if (!today) return null;
    const first = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    // Monday-first grid.
    const lead = (first.getDay() + 6) % 7;

    const cells: ({ date: Date; key: string; open: boolean } | null)[] = Array.from(
      { length: lead },
      () => null,
    );
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(first.getFullYear(), first.getMonth(), day);
      const isPast = date < today;
      const isSunday = date.getDay() === 0;
      cells.push({ date, key: iso(date), open: !isPast && !isSunday });
    }
    return { first, cells };
  }, [today, monthOffset]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return SLOT_TIMES.map((time) => ({ time, open: slotOpen(selectedDate, time) }));
  }, [selectedDate]);

  const prettyDate = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return `${DAY_LABELS[(date.getDay() + 6) % 7]} ${d} ${MONTHS[m - 1]}`;
  };

  if (confirmed && selectedDate && selectedTime) {
    return (
      <div className="booking-panel" style={{ textAlign: "center", padding: "56px 28px" }}>
        <span className="eyebrow bracket">Request received</span>
        <h3 className="display h3" style={{ margin: ".3em 0 .4em" }}>
          You&rsquo;re in.
        </h3>
        <p className="body-copy" style={{ maxWidth: "44ch", margin: "0 auto 26px" }}>
          {session.name} on <strong>{prettyDate(selectedDate)}</strong> at{" "}
          <strong>{selectedTime}</strong>. A confirmation lands in your inbox and the coach will call
          if anything needs moving.
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setConfirmed(false);
              setSelectedTime(null);
            }}
          >
            Book another session
          </button>
        </div>
        <p className="field-hint" style={{ marginTop: 22 }}>
          Prototype flow — the live site submits this to {site.booking.replace("https://", "")}
        </p>
      </div>
    );
  }

  return (
    <div className="booking-panel">
      {/* ------------------------------ 1. session ------------------------------ */}
      <div className="booking-step">
        <span className="booking-step-label">01 — Choose a session</span>
        <div className="booking-sessions">
          {SESSIONS.map((item) => (
            <button
              key={item.slug}
              className="booking-session"
              data-on={session.slug === item.slug}
              onClick={() => setSession(item)}
            >
              <span className="booking-session-head">
                <strong>{item.name}</strong>
                <span className="mono">{item.price}</span>
              </span>
              <span className="booking-session-copy">{item.copy}</span>
              <span className="eyebrow">{item.duration}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------- 2. date -------------------------------- */}
      <div className="booking-step">
        <span className="booking-step-label">02 — Pick a date</span>

        {!grid ? (
          <div className="booking-calendar-skeleton" aria-hidden="true" />
        ) : (
          <>
            <div className="booking-month">
              <button
                className="icon-btn"
                onClick={() => setMonthOffset((v) => Math.max(0, v - 1))}
                disabled={monthOffset === 0}
                aria-label="Previous month"
              >
                ‹
              </button>
              <strong>
                {MONTHS[grid.first.getMonth()]} {grid.first.getFullYear()}
              </strong>
              <button
                className="icon-btn"
                onClick={() => setMonthOffset((v) => Math.min(2, v + 1))}
                disabled={monthOffset === 2}
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="booking-grid">
              {DAY_LABELS.map((label) => (
                <span className="booking-dow" key={label}>
                  {label}
                </span>
              ))}
              {grid.cells.map((cell, index) =>
                cell === null ? (
                  <span key={`pad-${index}`} />
                ) : (
                  <button
                    key={cell.key}
                    className="booking-day"
                    disabled={!cell.open}
                    data-on={selectedDate === cell.key}
                    onClick={() => {
                      setSelectedDate(cell.key);
                      setSelectedTime(null);
                    }}
                  >
                    {cell.date.getDate()}
                  </button>
                ),
              )}
            </div>
            <p className="field-hint" style={{ marginTop: 12 }}>
              Closed Sundays · {site.hours}
            </p>
          </>
        )}
      </div>

      {/* ------------------------------- 3. time -------------------------------- */}
      <div className="booking-step">
        <span className="booking-step-label">03 — Pick a time</span>
        {!selectedDate ? (
          <p className="muted" style={{ margin: 0 }}>
            Choose a date to see available times.
          </p>
        ) : (
          <div className="opt-list">
            {slots.map((slot) => (
              <button
                key={slot.time}
                className="opt-pill"
                disabled={!slot.open}
                data-on={selectedTime === slot.time}
                onClick={() => setSelectedTime(slot.time)}
                title={slot.open ? undefined : "Fully booked"}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------ 4. details ------------------------------ */}
      <div className="booking-step">
        <span className="booking-step-label">04 — Your details</span>
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            const missing: string[] = [];
            if (!selectedDate) missing.push("a date");
            if (!selectedTime) missing.push("a time");
            if (!details.name.trim()) missing.push("your name");
            if (!details.email.trim()) missing.push("your email");
            setErrors(missing);
            if (missing.length === 0) setConfirmed(true);
          }}
          noValidate
        >
          <div className="field">
            <label htmlFor="bk-name">Full name *</label>
            <input
              id="bk-name"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div className="field">
            <label htmlFor="bk-email">Email *</label>
            <input
              id="bk-email"
              type="email"
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              placeholder="you@email.com"
            />
          </div>
          <div className="field">
            <label htmlFor="bk-phone">Phone</label>
            <input
              id="bk-phone"
              type="tel"
              value={details.phone}
              onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              placeholder="Your phone"
            />
          </div>
          <div className="field">
            <label htmlFor="bk-notes">Experience level</label>
            <select
              id="bk-notes"
              value={details.notes}
              onChange={(e) => setDetails({ ...details, notes: e.target.value })}
            >
              <option value="">Choose one</option>
              <option>Never boxed</option>
              <option>Some experience</option>
              <option>Train regularly</option>
              <option>Competing</option>
            </select>
          </div>

          <div className="booking-summary">
            <div>
              <span className="eyebrow">Your booking</span>
              <strong style={{ display: "block", marginTop: 6 }}>
                {session.name}
                {selectedDate ? ` · ${prettyDate(selectedDate)}` : ""}
                {selectedTime ? ` · ${selectedTime}` : ""}
              </strong>
            </div>
            <span className="mono" style={{ fontSize: 20 }}>
              {session.price}
            </span>
          </div>

          {errors.length > 0 ? (
            <p className="field-hint" style={{ gridColumn: "1 / -1", color: "var(--crimson)", margin: 0 }} role="alert">
              Please choose {errors.join(", ")}.
            </p>
          ) : null}

          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-solid btn-block">Confirm booking</button>
            <p className="field-hint" style={{ marginTop: 12, textAlign: "center" }}>
              Prototype flow — connects to the client&rsquo;s Acuity calendar on the WordPress build.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
