"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  CircleAlert,
  Menu,
  Search,
} from "lucide-react";
import { QuickHelpButton } from "@/components/layout/quick-help-drawer";

function notificationTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

export function PageHeader({
  title,
  subtitle,
  userRole = "CITIZEN",
  onOpenMobileNav,
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quickRef, setQuickRef] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to load notifications.");
      }
      setNotifications(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(() => {
        // non-blocking initial badge prefetch
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleNotifications = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      fetchNotifications();
    }
  };

  const markRead = async (notification) => {
    if (notification.isRead || notification.read) return;
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id }),
      });
      if (response.ok) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: true, read: true }
              : item
          )
        );
      }
    } catch {
      // silent fallback
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (response.ok) {
        setNotifications((current) =>
          current.map((item) => ({ ...item, isRead: true, read: true }))
        );
      }
    } catch {
      // silent
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const q = quickRef.trim();
    if (!q) return;
    if (userRole === "CITIZEN") {
      router.push(`/citizen/track?ref=${encodeURIComponent(q)}`);
    } else if (userRole === "GOVERNMENT OFFICER") {
      router.push(`/officer/semantic-search?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/admin/users`);
    }
    setQuickRef("");
  };

  const unreadCount = notifications.filter(
    (item) => !item.isRead && !item.read
  ).length;

  return (
    <header className="no-print surface-3d relative flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-4 py-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {onOpenMobileNav ? (
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open menu"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[#102A43] hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-[#2563EB] uppercase">
              {userRole}
            </span>
            {session?.user?.department ? (
              <span className="hidden text-[11px] font-medium text-slate-400 sm:inline">
                • {session.user.department}
              </span>
            ) : null}
          </div>
          <h1 className="mt-1.5 text-lg font-extrabold tracking-tight text-[#102A43] sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {/* Quick Jump Search */}
        <form onSubmit={handleQuickSearch} className="hidden md:block">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={quickRef}
              onChange={(e) => setQuickRef(e.target.value)}
              placeholder={
                userRole === "CITIZEN"
                  ? "Track Ref No..."
                  : userRole === "GOVERNMENT OFFICER"
                  ? "Quick vector search..."
                  : "Search directory..."
              }
              className="w-44 rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-8 text-xs font-medium text-slate-800 transition placeholder:text-slate-400 focus:w-56 focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>
        </form>

        {/* Role Quick Help & RTI Guide */}
        <QuickHelpButton userRole={userRole} />

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-expanded={open}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB]"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-slate-950 shadow-xs">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {open ? (
            <section className="absolute top-12 right-0 z-50 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                <div>
                  <h2 className="text-sm font-bold text-[#102A43]">
                    Notifications
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                      : "All notifications read"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={markAllRead}
                      title="Mark all as read"
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#2563EB] hover:bg-blue-50"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="flex gap-2 p-4 text-xs text-rose-700"
                >
                  <CircleAlert className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : loading && notifications.length === 0 ? (
                <div className="p-5 text-xs text-slate-500">
                  Loading notifications...
                </div>
              ) : notifications.length ? (
                <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {notifications.map((item) => {
                    const isRead = item.isRead || item.read;
                    return (
                      <li
                        key={item.id}
                        className={`p-4 transition ${
                          isRead ? "bg-white" : "bg-blue-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            {item.link ? (
                              <Link
                                href={item.link}
                                onClick={() => {
                                  markRead(item);
                                  setOpen(false);
                                }}
                                className="text-xs font-bold text-[#102A43] hover:text-[#2563EB] hover:underline"
                              >
                                {item.title || item.type}
                              </Link>
                            ) : (
                              <p className="text-xs font-bold text-[#102A43]">
                                {item.title || item.type}
                              </p>
                            )}
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                              {item.message}
                            </p>
                            <p className="mt-1.5 text-[10px] text-slate-400">
                              {notificationTime(item.createdAt)}
                            </p>
                          </div>
                          {!isRead ? (
                            <button
                              type="button"
                              aria-label={`Mark ${item.title || "notification"} as read`}
                              onClick={() => markRead(item)}
                              className="rounded-lg p-1.5 text-[#2563EB] hover:bg-blue-100"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  You’re all caught up.
                </div>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </header>
  );
}
