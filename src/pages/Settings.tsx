import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSettingsStore } from "@/store/settings";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, Type, Music, ScrollText, Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/store/toast";
import { cn } from "@/utils/cn";
import type { Settings } from "@/types";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-secondary-text">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  useDocumentTitle("Settings");
  useTheme();
  const { settings, updateSettings, setFontSize, toggleAutoScroll, toggleReadingMode, toggleReduceMotion, toggleTheme, resetSettings } = useSettingsStore();

  const fontSizes: { id: Settings["fontSize"]; label: string }[] = [
    { id: "sm", label: "Small" },
    { id: "md", label: "Medium" },
    { id: "lg", label: "Large" },
    { id: "xl", label: "Extra Large" },
  ];

  const handleReset = () => {
    resetSettings();
    toastSuccess("Settings reset to defaults");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
        Settings
      </h1>
      <p className="mb-8 text-secondary-text">
        Customize your lyrics reading and app experience.
      </p>

      {/* Appearance */}
      <section className="mb-8 rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="px-6 py-2">
          <SettingRow
            icon={settings.theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            title="Theme"
            description="Switch between dark and light mode."
          >
            <Toggle checked={settings.theme === "dark"} onChange={toggleTheme} label="Dark mode" />
          </SettingRow>
          <SettingRow
            icon={<Move className="h-5 w-5 text-primary" />}
            title="Reduce motion"
            description="Minimize animations and motion effects."
          >
            <Toggle checked={settings.reduceMotion} onChange={toggleReduceMotion} label="Reduce motion" />
          </SettingRow>
        </div>
      </section>

      {/* Lyrics */}
      <section className="mb-8 rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">Lyrics</h2>
        </div>
        <div className="px-6 py-2">
          <SettingRow
            icon={<Type className="h-5 w-5 text-primary" />}
            title="Font size"
            description="Adjust the lyrics text size."
          >
            <div className="flex gap-1">
              {fontSizes.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontSize(f.id)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    settings.fontSize === f.id
                      ? "bg-primary text-black"
                      : "bg-border/40 text-secondary-text hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow
            icon={<Music className="h-5 w-5 text-primary" />}
            title="Default lyrics source"
            description="Choose which provider to try first."
          >
            <button
              onClick={() =>
                updateSettings({
                  defaultLyricsSource:
                    settings.defaultLyricsSource === "auto"
                      ? "ovh"
                      : settings.defaultLyricsSource === "ovh"
                        ? "lrclib"
                        : "auto",
                })
              }
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium capitalize text-secondary-text hover:text-foreground"
            >
              {settings.defaultLyricsSource}
            </button>
          </SettingRow>
          <SettingRow
            icon={<ScrollText className="h-5 w-5 text-primary" />}
            title="Auto-scroll"
            description="Automatically scroll lyrics while the song plays."
          >
            <Toggle checked={settings.autoScroll} onChange={toggleAutoScroll} label="Auto-scroll lyrics" />
          </SettingRow>
          <SettingRow
            icon={<ScrollText className="h-5 w-5 text-primary" />}
            title="Reading mode"
            description="Focus on lyrics with a distraction-free layout."
          >
            <Toggle checked={settings.readingMode} onChange={toggleReadingMode} label="Reading mode" />
          </SettingRow>
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-8 rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">Privacy</h2>
        </div>
        <div className="px-6 py-2">
          <SettingRow
            icon={<ScrollText className="h-5 w-5 text-primary" />}
            title="Remember history"
            description="Save your browsing history locally."
          >
            <Toggle
              checked={settings.rememberHistory}
              onChange={() => updateSettings({ rememberHistory: !settings.rememberHistory })}
              label="Remember history"
            />
          </SettingRow>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-error/30 bg-error/5">
        <div className="border-b border-error/20 px-6 py-4">
          <h2 className="font-semibold text-error">Reset</h2>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="font-medium text-foreground">Reset all settings</p>
            <p className="text-sm text-secondary-text">
              Restore default preferences and appearance.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </section>
    </div>
  );
}
