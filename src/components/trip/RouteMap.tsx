import { useEffect, useState, type ComponentType } from "react";
import type { Place, PlanStop } from "@/lib/engine/types";

type Props = {
  origin: Place;
  destination: Place;
  waypoints: Place[];
  stops: PlanStop[];
};

export function RouteMap(props: Props) {
  const [Comp, setComp] = useState<ComponentType<Props> | null>(null);
  useEffect(() => {
    let live = true;
    void import("./LeafletMap").then((m) => {
      if (live) setComp(() => m.LeafletMap);
    });
    return () => {
      live = false;
    };
  }, []);
  if (!Comp) {
    return (
      <div className="flex h-full min-h-72 items-center justify-center rounded-[22px] bg-surface-2 text-sm text-muted">
        กำลังเปิดแผนที่เส้นทาง
      </div>
    );
  }
  return <Comp {...props} />;
}
