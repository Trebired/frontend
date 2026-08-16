import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { classNames, dataBool, jsonScript } from "#ndsvdqv80epr";
import { Icon } from "#lbkpzw8nphru";
import { uploadConfigPayload } from "#pgcgwrvwwqfj";
import { uploadModel } from "#fb78vhpo6xg5";
import type { UploadFieldOptions } from "#skcj0a9esow0";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type UploadFieldProps = UploadFieldOptions & HTMLAttributes<HTMLDivElement>;
type ClearButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
};
type PasswordToggleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
};

const directoryPickerAttributes = {
  directory: "",
  webkitdirectory: "",
} as Record<string, string>;
const uploadOptionKeys = new Set([
    "accept",
    "aspect",
    "clearIconSpec",
    "crop",
    "cropFailedMessage",
    "cropImageOnlyDescription",
    "cropImageOnlyMessage",
    "directory",
    "directoryOptionIconSpec",
    "directoryOptionLabel",
    "drop",
    "dropDirectory",
    "emptyLabel",
    "emptyToggle",
    "fileOptionIconSpec",
    "fileOptionLabel",
    "formatNotAllowedDescription",
    "formatNotAllowedMessage",
    "formats",
    "helperText",
    "id",
    "lang",
    "mixedPicker",
    "modalDescription",
    "modalTitle",
    "multiple",
    "name",
    "preview",
    "previewAlt",
    "previewShape",
    "previewUrl",
    "skipDirs",
    "triggerIconSpec",
    "triggerLabel",
    "useImageLabel",
]);

function splitUploadFieldProps(props: UploadFieldProps) {
  const options: Record<string, unknown> = {};
  const rootProps: Record<string, unknown> = {};
  Object.entries(props).forEach(([key, value]) => {
      if (uploadOptionKeys.has(key)) options[key] = value;
      else rootProps[key] = value;
  });
  return {
    options: options as UploadFieldOptions,
    rootProps: rootProps as HTMLAttributes<HTMLDivElement>,
  };
}

function UploadField(props: UploadFieldProps) {
  const { options, rootProps } = splitUploadFieldProps(props);
  const { children, className, ...rest } = rootProps;
  const model = uploadModel(options);
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("upload"), className)}
    {...frontendDataAttrs({ "upload": "" })}
    {...frontendDataAttrs({ "upload-drop": dataBool(model.allowDrop) })}
    {...frontendDataAttrs({ "upload-empty": model.emptyLabel })}
    id={model.id}
    >
    <UploadConfigScript model={model} />
    <UploadNativeInputs model={model} />
    <UploadSurface model={model}>{children}</UploadSurface>
    <UploadEmptyToggle model={model} />
    </div>
  );
}

function UploadConfigScript(props: { model: ReturnType<typeof uploadModel> }) {
  return (
    <script
    {...frontendDataAttrs({ "upload-config": "" })}
    hidden
    type="application/json"
    dangerouslySetInnerHTML={{
        __html: jsonScript(uploadConfigPayload(props.model)),
    }}
    />
  );
}

function UploadNativeInputs(props: { model: ReturnType<typeof uploadModel> }) {
  const { model } = props;
  return (
    <>
    <input
    className={frontendElementClass("upload", "input")}
    {...frontendDataAttrs({ "upload-slot": "native-file" })}
    id={`${model.id}_input`}
    type="file"
    name={model.name}
    multiple={model.allowMultiple}
    accept={model.accept || undefined}
    />
    {model.allowDirectory || model.allowMixedPicker ? (
        <input
        className={frontendElementClass("upload", "input")}
        {...frontendDataAttrs({ "upload-slot": "native-directory" })}
        id={`${model.id}_directory`}
        type="file"
        name={model.name}
        multiple={true}
        {...directoryPickerAttributes}
        />
      ) : null}
    {model.name && model.crop ? (
        <input type="hidden" name={`${model.name}_crop`} value="" {...frontendDataAttrs({ "upload-slot": "crop-field" })} />
      ) : null}
    </>
  );
}

function UploadSurface(props: { children?: ReactNode; model: ReturnType<typeof uploadModel> }) {
  const { children, model } = props;
  return (
    <div className={frontendElementClass("upload", "surface")} {...frontendDataAttrs({ "upload-slot": "shell" })}>
    <UploadPreview model={model} />
    <div className={frontendElementClass("upload", "content")}>
    <UploadButtons model={model} />
    <UploadMeta model={model}>{children}</UploadMeta>
    </div>
    </div>
  );
}

function UploadPreview(props: { model: ReturnType<typeof uploadModel> }) {
  const { model } = props;
  if (!model.previewEnabled) return null;
  return (
    <div
    className={frontendElementClass("upload", "preview")}
    {...frontendDataAttrs({ "upload-preview-shape": model.previewShape })}
    {...frontendDataAttrs({ "upload-slot": "preview" })}
    hidden={!model.previewUrl}
    >
    <img
    className={frontendElementClass("upload", "preview-image")}
    {...frontendDataAttrs({ "upload-slot": "preview-image" })}
    alt={model.previewAlt}
    src={model.previewUrl || undefined}
    hidden={!model.previewUrl}
    />
    <span
    className={frontendElementClass("upload", "preview-empty")}
    {...frontendDataAttrs({ "upload-slot": "preview-empty" })}
    hidden={Boolean(model.previewUrl)}
    >
    {model.previewEmptyText}
    </span>
    </div>
  );
}

function UploadButtons(props: { model: ReturnType<typeof uploadModel> }) {
  const { model } = props;
  return (
    <div className={frontendElementClass("upload", "actions")}>
    {model.allowMixedPicker ? (
        <>
        <UploadButton slot="file-trigger" iconSpec={model.fileOptionIconSpec}>
        {model.fileOptionLabel}
        </UploadButton>
        <UploadButton slot="directory-trigger" iconSpec={model.directoryOptionIconSpec}>
        {model.directoryOptionLabel}
        </UploadButton>
        </>
      ) : (
        <UploadButton
        slot={model.allowDirectory ? "directory-trigger" : "trigger"}
        iconSpec={model.triggerIconSpec}
        >
        {model.triggerLabel}
        </UploadButton>
    )}
    <UploadButton slot="clear" hidden={!model.canClearCurrentPreview} iconSpec={model.clearIconSpec}>
    {model.clearLabel}
    </UploadButton>
    </div>
  );
}

function UploadButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { iconSpec?: string; slot: string },
) {
  const { children, className, iconSpec, slot, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    className={classNames("btn", className)}
    {...frontendDataAttrs({ "upload-slot": slot })}
    type={type}
    >
    {iconSpec ? <Icon spec={iconSpec} /> : null}
    <span>{children}</span>
    </button>
  );
}

function UploadMeta(props: { children?: ReactNode; model: ReturnType<typeof uploadModel> }) {
  const { children, model } = props;
  return (
    <div className={frontendElementClass("upload", "meta")}>
    <span className={frontendElementClass("upload", "filename")} {...frontendDataAttrs({ "upload-slot": "filename" })}>
    {model.emptyLabel}
    </span>
    {model.dropHint ? <span className={frontendElementClass("upload", "hint")}>{model.dropHint}</span> : null}
    {model.helperText ? <span className={frontendElementClass("upload", "hint")}>{model.helperText}</span> : null}
    {model.formatsText ? (
        <span className={frontendElementClass("upload", "hint")} {...frontendDataAttrs({ "upload-slot": "formats" })} title={model.formatsText}>
        {model.formatsText}
        </span>
      ) : null}
    {children}
    <ul className={frontendElementClass("upload", "list")} {...frontendDataAttrs({ "upload-slot": "list" })} />
    </div>
  );
}

function UploadEmptyToggle(props: { model: ReturnType<typeof uploadModel> }) {
  const toggle = props.model.emptyToggle;
  if (!toggle?.name) return null;
  return (
    <input
    type="hidden"
    name={toggle.name}
    value={toggle.checked === true ? String(toggle.value || "1") : "0"}
    {...frontendDataAttrs({ "upload-slot": "empty-toggle" })}
    />
  );
}

function ClearButton(props: ClearButtonProps) {
  const { children = "Clear", className, controls, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    className={classNames(frontendClassName("button"), className)}
    {...frontendDataAttrs({ "clear": `#${controls.replace(/^#/u, "")}` })}
    type={type}
    >
    {children}
    </button>
  );
}

function PasswordToggleButton(props: PasswordToggleProps) {
  const { children, className, controls, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    className={classNames(frontendClassName("button"), className)}
    {...frontendDataAttrs({ "password-toggle": "" })}
    aria-controls={controls}
    aria-pressed="false"
    type={type}
    >
    {children}
    </button>
  );
}

function AutosizeTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={classNames(frontendClassName("input"), className)} {...frontendDataAttrs({ "autosize": "" })} />;
}

export { AutosizeTextarea, ClearButton, PasswordToggleButton, UploadField };
export * from "./choice.js";
export * from "./disclosure.js";
export * from "./dropdown.js";
export * from "./search.js";
export * from "./status.js";
export * from "./tabs.js";
export type { ClearButtonProps, PasswordToggleProps, UploadFieldProps };
