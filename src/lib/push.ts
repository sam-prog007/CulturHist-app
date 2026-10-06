import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export type PushStatus =
  | "unconfigured" // no VAPID key in .env
  | "unsupported" // browser without Push API
  | "ios-not-installed" // iPhone/iPad: only works from the home screen app
  | "denied"
  | "off"
  | "on";

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function getPushStatus(): Promise<PushStatus> {
  if (!VAPID_PUBLIC_KEY) return "unconfigured";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return isIOS() && !isStandalone() ? "ios-not-installed" : "unsupported";
  }
  if (Notification.permission === "denied") return "denied";
  return (await currentSubscription()) ? "on" : "off";
}

/** Asks for permission (must follow a tap) and registers this device. */
export async function enablePush(): Promise<PushStatus> {
  if (!VAPID_PUBLIC_KEY) return "unconfigured";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const json = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    { endpoint: json.endpoint!, p256dh: json.keys!.p256dh, auth: json.keys!.auth, user_agent: navigator.userAgent },
    { onConflict: "endpoint" }
  );
  if (error) throw error;
  return "on";
}

/** Stops notifications on this device. */
export async function disablePush(): Promise<PushStatus> {
  const subscription = await currentSubscription();
  if (subscription) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
    await subscription.unsubscribe();
  }
  return "off";
}
