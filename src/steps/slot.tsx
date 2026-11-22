import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { frontendDataAttrs } from "#5vbaqj4pirp3";
import { primitiveStackClassName } from "#hzrmwbvgt2ax";
import { number } from "#z1ajnkhjieay";

type StepsGroupContent = { count: number | null; steps: ReactNode };

const StepsGroupSlotContext = createContext<StepsGroupContent>({ count: null, steps: null });

function StepsGroupSlot() {
  const content = useContext(StepsGroupSlotContext);
  return (
    <div className={primitiveStackClassName({ gap: "xs" })} {...frontendDataAttrs({ "steps-group-slot": "" })}>
    {content.steps}
    </div>
  );
}

function StepsGroupCount() {
  const content = useContext(StepsGroupSlotContext);
  return (
    <span {...frontendDataAttrs({ "steps-group-count": "" })} style={{ display: "contents" }}>
    {content.count == null ? null : number({ value: content.count })}
    </span>
  );
}

function steps_group_slot() {
  return <StepsGroupSlot />;
}

function steps_group_count() {
  return <StepsGroupCount />;
}

export type { StepsGroupContent };
export { StepsGroupCount, StepsGroupSlot, StepsGroupSlotContext, steps_group_count, steps_group_slot };
