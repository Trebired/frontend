import type { HTMLAttributes, InputHTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";

type SearchProps = HTMLAttributes<HTMLDivElement>;

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

type SearchItemProps = HTMLAttributes<HTMLDivElement> & {
  text?: string;
};

function Search(props: SearchProps) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-search", className)} data-tbf-search="">
      {children}
    </div>
  );
}

function SearchInput(props: SearchInputProps) {
  const { className, type = "search", ...rest } = props;
  return (
    <input
      {...rest}
      className={classNames("tbf-input tbf-search__input", className)}
      data-tbf-search-input=""
      type={type}
    />
  );
}

function SearchItem(props: SearchItemProps) {
  const { children, className, text, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-search__item", className)} data-tbf-search-item="" data-tbf-search-text={text}>
      {children}
    </div>
  );
}

function SearchEmpty(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-search__empty", className)} data-tbf-search-empty="">
      {children}
    </div>
  );
}

export { Search, SearchEmpty, SearchInput, SearchItem };
export type { SearchInputProps, SearchItemProps, SearchProps };
