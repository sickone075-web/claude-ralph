"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Loader2, Radio } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArchiveItem, ArchiveDetail, ApiResponse, Story } from "@/lib/types";

const CURRENT_VALUE = "__current__";

export interface ArchiveSwitcherProps {
  /** Called when switching to an archive; passes the archive stories (read-only) */
  onArchiveSelect: (stories: Story[], archiveLabel: string) => void;
  /** Called when switching back to the current (live) project */
  onCurrentSelect: () => void;
}

export function ArchiveSwitcher({
  onArchiveSelect,
  onCurrentSelect,
}: ArchiveSwitcherProps) {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [selected, setSelected] = useState(CURRENT_VALUE);
  const [loading, setLoading] = useState(false);

  // Fetch archive list on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchArchives() {
      try {
        const res = await fetch("/api/archives");
        const json: ApiResponse<ArchiveItem[]> = await res.json();
        if (!cancelled && json.data) {
          setArchives(json.data);
        }
      } catch {
        // silently ignore – dropdown will just show no archives
      }
    }
    fetchArchives();
    return () => { cancelled = true; };
  }, []);

  const handleChange = useCallback(
    async (value: string) => {
      setSelected(value);

      if (value === CURRENT_VALUE) {
        onCurrentSelect();
        return;
      }

      // Fetch archive detail
      setLoading(true);
      try {
        const res = await fetch(`/api/archives/${value}`);
        const json: ApiResponse<ArchiveDetail> = await res.json();
        if (json.data?.prd?.userStories) {
          const archive = archives.find((a) => a.folder === value);
          const label = archive
            ? `${archive.featureName} (${archive.date})`
            : value;
          onArchiveSelect(json.data.prd.userStories, label);
        }
      } catch {
        // revert on error
        setSelected(CURRENT_VALUE);
        onCurrentSelect();
      } finally {
        setLoading(false);
      }
    },
    [archives, onArchiveSelect, onCurrentSelect]
  );

  const formatPercent = (item: ArchiveItem) => {
    if (item.totalStories === 0) return "0%";
    return `${Math.round((item.completedStories / item.totalStories) * 100)}%`;
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="w-[320px] bg-zinc-900 border-zinc-700 text-zinc-200">
          <SelectValue placeholder="选择项目">
            {loading ? (
              <span className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                加载中...
              </span>
            ) : selected === CURRENT_VALUE ? (
              <span className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-cyan-500" />
                当前任务
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Archive className="h-3.5 w-3.5 text-zinc-400" />
                {archives.find((a) => a.folder === selected)?.featureName ??
                  selected}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          <SelectGroup>
            <SelectLabel className="text-zinc-500">实时</SelectLabel>
            <SelectItem value={CURRENT_VALUE} className="text-zinc-200">
              <span className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-cyan-500" />
                当前任务
              </span>
            </SelectItem>
          </SelectGroup>

          {archives.length > 0 && (
            <>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel className="text-zinc-500">历史存档</SelectLabel>
                {archives.map((archive) => (
                  <SelectItem
                    key={archive.folder}
                    value={archive.folder}
                    className="text-zinc-200"
                  >
                    <span className="flex items-center gap-2 w-full">
                      <Archive className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{archive.featureName}</span>
                      <span className="text-xs text-zinc-500 shrink-0">
                        {archive.date}
                      </span>
                      <span className="text-xs text-zinc-500 shrink-0">
                        {formatPercent(archive)}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
