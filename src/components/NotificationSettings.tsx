import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Share } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { disablePush, enablePush, getPushStatus, type PushStatus } from "@/lib/push";

type Settings = {
  notify_on_this_day: boolean | null;
  notify_on_this_day_time: string | null;
  notify_daily_facts: boolean | null;
  notify_daily_facts_time: string | null;
};

const hhmm = (time: string | null | undefined, fallback: string) => (time ?? fallback).slice(0, 5);

/** Device subscription plus which notifications to send, and when. */
const NotificationSettings = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [working, setWorking] = useState(false);
  const queryKey = ["notification-settings", userId];

  useEffect(() => {
    getPushStatus().then(setStatus).catch(() => setStatus("unsupported"));
  }, []);

  const { data: settings } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("notify_on_this_day, notify_on_this_day_time, notify_daily_facts, notify_daily_facts_time")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data as Settings;
    },
  });

  const update = async (patch: Partial<Settings>) => {
    queryClient.setQueryData<Settings>(queryKey, (old) => old && { ...old, ...patch });
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { error } = await supabase.from("profiles").update({ ...patch, timezone }).eq("id", userId);
    if (error) {
      queryClient.invalidateQueries({ queryKey });
      toast.error("Réglage non enregistré");
    }
  };

  const toggleDevice = async () => {
    setWorking(true);
    try {
      const next = status === "on" ? await disablePush() : await enablePush();
      setStatus(next);
      if (next === "on") toast.success("Notifications activées sur cet appareil");
      if (next === "denied") toast.error("Notifications refusées : autorisez-les dans les réglages de votre appareil.");
    } catch (e) {
      toast.error("Impossible d'activer les notifications : " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setWorking(false);
    }
  };

  if (status === null || !settings) return <p className="text-sm text-muted-foreground">Chargement…</p>;

  if (status === "unconfigured") {
    return <p className="text-sm text-muted-foreground">Les notifications ne sont pas encore configurées pour cette app.</p>;
  }
  if (status === "ios-not-installed") {
    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Sur iPhone, les notifications fonctionnent quand CulturHist est installée sur l'écran d'accueil :</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Dans Safari, touchez <Share className="inline h-4 w-4 align-text-bottom" /> <strong>Partager</strong>.
          </li>
          <li>Choisissez <strong>Sur l'écran d'accueil</strong>.</li>
          <li>Ouvrez CulturHist depuis son icône, puis revenez ici.</li>
        </ol>
      </div>
    );
  }
  if (status === "unsupported") {
    return <p className="text-sm text-muted-foreground">Ce navigateur ne permet pas les notifications.</p>;
  }

  const rows = [
    { key: "notify_on_this_day", timeKey: "notify_on_this_day_time", label: "Ce jour-là", hint: "Un événement historique survenu à cette date", fallback: "08:00" },
    { key: "notify_daily_facts", timeKey: "notify_daily_facts_time", label: "Vos 5 faits du jour", hint: "Un rappel si vous ne les avez pas encore validés", fallback: "18:00" },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-3">
        <p className="text-sm">
          {status === "on"
            ? "Activées sur cet appareil."
            : status === "denied"
              ? "Bloquées dans les réglages de cet appareil."
              : "Désactivées sur cet appareil."}
        </p>
        {status !== "denied" && (
          <Button size="sm" variant={status === "on" ? "outline" : "default"} disabled={working} onClick={toggleDevice}>
            {status === "on" ? "Désactiver" : "Activer"}
          </Button>
        )}
      </div>

      {rows.map((row) => (
        <div key={row.key} className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Label htmlFor={row.key} className="font-medium">{row.label}</Label>
              <p className="text-xs text-muted-foreground">{row.hint}</p>
            </div>
            <Switch
              id={row.key}
              checked={!!settings[row.key]}
              onCheckedChange={(checked) => update({ [row.key]: checked })}
            />
          </div>
          {settings[row.key] && (
            <div className="flex items-center gap-2">
              <Label htmlFor={row.timeKey} className="text-sm text-muted-foreground">Heure</Label>
              <Input
                id={row.timeKey}
                type="time"
                step={900}
                className="w-32"
                value={hhmm(settings[row.timeKey], row.fallback)}
                onChange={(e) => e.target.value && update({ [row.timeKey]: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Envoyées à l'heure choisie, à 15 minutes près.</p>
    </div>
  );
};

export default NotificationSettings;
