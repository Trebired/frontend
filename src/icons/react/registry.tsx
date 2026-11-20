import { frontendDataAttrs } from "#5vbaqj4pirp3";
import { uniqueIconSpecs } from "#yqq4li47ao7b";
import { Icon } from "./index.js";

type IconRegistryProps = {
  specs: readonly unknown[];
};

function IconRegistry(props: IconRegistryProps) {
  const specs = uniqueIconSpecs(Array.isArray(props.specs) ? props.specs : []);
  if (!specs.length) return null;
  return (
    <div hidden {...frontendDataAttrs({ "icon-registry": "" })}>
    {specs.map((spec) => <Icon key={spec} spec={spec} />)}
    </div>
  );
}

export { IconRegistry };
export type { IconRegistryProps };
