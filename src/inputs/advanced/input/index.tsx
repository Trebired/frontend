import { joinClassNames } from "#dqy2d22qyujv";
import { icon } from "#dqy2d22qyujv";

type InputProps = {
  className?: string;
  [key: string]: unknown;
};

function input(props: InputProps) {
  const { className, ...rest } = props;
  const search = String(rest.type || "").toLowerCase() === "search";
  const classes = splitInputClasses(className);
  const node = (
    <input
    className={joinClassNames(
        [
          "input classic",
          search ? classes.input : className,
        ],
    )}
    {...rest}
    />
  );

  if (!search) return node;
  return (
    <span className={joinClassNames(["input-search-wrap", classes.wrapper])}>
    {node}
    {icon({
          className: "input-search-icon",
          spec: "remixicon search-line",
    })}
    </span>
  );
}

function splitInputClasses(className: unknown) {
  const inputClasses: string[] = [];
  const wrapperClasses: string[] = [];
  String(className || "")
  .split(/\s+/)
  .filter(Boolean)
  .forEach((name) => {
      if (/^width-/.test(name) || name === "grow") wrapperClasses.push(name);
      else inputClasses.push(name);
  });
  return {
    input: inputClasses.join(" "),
    wrapper: wrapperClasses.join(" "),
  };
}

export type { InputProps };
export default input;
