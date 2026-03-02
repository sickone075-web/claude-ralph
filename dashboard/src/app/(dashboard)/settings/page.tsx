"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SettingsConfig {
  prdPath: string;
  progressPath: string;
  ralphScriptPath: string;
  defaultTool: "claude" | "amp";
  defaultMaxIterations: number;
  terminalFontSize: number;
}

const DEFAULTS: SettingsConfig = {
  prdPath: "../scripts/ralph/prd.json",
  progressPath: "../scripts/ralph/progress.txt",
  ralphScriptPath: "../scripts/ralph/ralph.sh",
  defaultTool: "claude",
  defaultMaxIterations: 10,
  terminalFontSize: 14,
};

export default function SettingsPage() {
  const [config, setConfig] = useState<SettingsConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config");
      const json = await res.json();
      if (json.data) {
        setConfig(json.data);
      }
    } catch {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.error) {
        toast.error("Failed to save settings", { description: json.error });
      } else {
        setConfig(json.data);
        toast.success("Settings saved successfully");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/config", { method: "DELETE" });
      const json = await res.json();
      if (json.data) {
        setConfig(json.data);
        toast.success("Settings reset to defaults");
      }
    } catch {
      toast.error("Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-zinc-400" />
          <h2 className="text-xl font-semibold">Settings</h2>
        </div>
        <p className="text-zinc-400">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-zinc-400" />
          <h2 className="text-xl font-semibold">Settings</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Path Configuration */}
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Path Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ralphScriptPath">Ralph Script Path</Label>
              <Input
                id="ralphScriptPath"
                value={config.ralphScriptPath}
                onChange={(e) => setConfig({ ...config, ralphScriptPath: e.target.value })}
                placeholder="../scripts/ralph/ralph.sh"
                className="bg-zinc-950 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">Path to the ralph.sh script</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prdPath">PRD File Path</Label>
              <Input
                id="prdPath"
                value={config.prdPath}
                onChange={(e) => setConfig({ ...config, prdPath: e.target.value })}
                placeholder="../scripts/ralph/prd.json"
                className="bg-zinc-950 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">Path to the prd.json file</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="progressPath">Progress File Path</Label>
              <Input
                id="progressPath"
                value={config.progressPath}
                onChange={(e) => setConfig({ ...config, progressPath: e.target.value })}
                placeholder="../scripts/ralph/progress.txt"
                className="bg-zinc-950 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">Path to the progress.txt file</p>
            </div>
          </div>
        </Card>

        <Separator className="bg-zinc-800" />

        {/* Default Parameters */}
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Default Parameters</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultTool">Default AI Tool</Label>
              <Select
                value={config.defaultTool}
                onValueChange={(value: "claude" | "amp") => setConfig({ ...config, defaultTool: value })}
              >
                <SelectTrigger id="defaultTool" className="bg-zinc-950 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="amp">Amp</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">AI tool used when starting Ralph</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMaxIterations">Default Max Iterations</Label>
              <Input
                id="defaultMaxIterations"
                type="number"
                min={1}
                max={100}
                value={config.defaultMaxIterations}
                onChange={(e) => setConfig({ ...config, defaultMaxIterations: parseInt(e.target.value) || 10 })}
                className="bg-zinc-950 border-zinc-700 w-32"
              />
              <p className="text-xs text-zinc-500">Maximum iterations per Ralph run (default: 10)</p>
            </div>
          </div>
        </Card>

        <Separator className="bg-zinc-800" />

        {/* Interface */}
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Interface</h3>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="terminalFontSize">Terminal Font Size</Label>
                <span className="text-sm text-zinc-400 font-mono">{config.terminalFontSize}px</span>
              </div>
              <Slider
                id="terminalFontSize"
                min={12}
                max={24}
                step={1}
                value={[config.terminalFontSize]}
                onValueChange={([value]) => setConfig({ ...config, terminalFontSize: value })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>12px</span>
                <span>24px</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
