import type { HTMLAttributes, InputHTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type SearchProps = HTMLAttributes<HTMLDivElement>;

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

type SearchItemProps = HTMLAttributes<HTMLDivElement> & {
  text?: string;
};

function Search(props: SearchProps) {
  const { children, className, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("search"), className)}
    {...frontendDataAttrs({ "search": "" })}
    >
    {children}
    </div>
  );
}

function SearchInput(props: SearchInputProps) {
  const { className, type = "search", ...rest } = props;
  return (
    <input
    {...rest}
    className={classNames(`${frontendClassName("input")} ${frontendElementClass("search", "input")}`, className)}
    {...frontendDataAttrs({ "search-input": "" })}
    type={type}
    />
  );
}

function SearchItem(props: SearchItemProps) {
  const { children, className, text, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendElementClass("search", "item"), className)}
    {...frontendDataAttrs({ "search-item": "" })}
    {...frontendDataAttrs({ "search-text": text })}
    >
    {children}
    </div>
  );
}

function SearchEmpty(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendElementClass("search", "empty"), className)}
    {...frontendDataAttrs({ "search-empty": "" })}
    >
    {children}
    </div>
  );
}

export { Search, SearchEmpty, SearchInput, SearchItem };
export type { SearchInputProps, SearchItemProps, SearchProps };
