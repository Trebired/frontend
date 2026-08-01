import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { classNames, dataBool, jsonScript } from "#ndsvdqv80epr";
import { uploadConfigPayload } from "#pgcgwrvwwqfj";
import { uploadModel } from "#fb78vhpo6xg5";
import type { UploadFieldOptions } from "#skcj0a9esow0";

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
  "clearLabel",
  "crop",
  "cropFailedMessage",
  "cropImageOnlyDescription",
  "cropImageOnlyMessage",
  "directory",
  "directoryOptionLabel",
  "drop",
  "dropDirectory",
  "emptyLabel",
  "emptyToggle",
  "fileOptionLabel",
  "formatNotAllowedDescription",
  "formatNotAllowedMessage",
  "formats",
  "helperText",
  "id",
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
      className={classNames("tbf-upload", className)}
      data-tbf-upload=""
      data-tbf-upload-drop={dataBool(model.allowDrop)}
      data-tbf-upload-empty={model.emptyLabel}
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
      data-tbf-upload-config=""
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
        className="tbf-upload__input"
        data-tbf-upload-slot="native-file"
        id={`${model.id}_input`}
        type="file"
        name={model.name}
        multiple={model.allowMultiple}
        accept={model.accept || undefined}
      />
      {model.allowDirectory || model.allowMixedPicker ? (
        <input
          className="tbf-upload__input"
          data-tbf-upload-slot="native-directory"
          id={`${model.id}_directory`}
          type="file"
          name={model.name}
          multiple={true}
          {...directoryPickerAttributes}
        />
      ) : null}
      {model.name && model.crop ? (
        <input type="hidden" name={`${model.name}_crop`} value="" data-tbf-upload-slot="crop-field" />
      ) : null}
    </>
  );
}

function UploadSurface(props: { children?: ReactNode; model: ReturnType<typeof uploadModel> }) {
  const { children, model } = props;
  return (
    <div className="tbf-upload__surface" data-tbf-upload-slot="shell">
      <UploadPreview model={model} />
      <div className="tbf-upload__content">
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
      className="tbf-upload__preview"
      data-tbf-upload-preview-shape={model.previewShape}
      data-tbf-upload-slot="preview"
      hidden={!model.previewUrl}
    >
      <img
        className="tbf-upload__preview-image"
        data-tbf-upload-slot="preview-image"
        alt={model.previewAlt}
        src={model.previewUrl || undefined}
        hidden={!model.previewUrl}
      />
      <span
        className="tbf-upload__preview-empty"
        data-tbf-upload-slot="preview-empty"
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
    <div className="tbf-upload__actions">
      {model.allowMixedPicker ? (
        <>
          <UploadButton slot="file-trigger">{model.fileOptionLabel}</UploadButton>
          <UploadButton slot="directory-trigger">{model.directoryOptionLabel}</UploadButton>
        </>
      ) : (
        <UploadButton slot={model.allowDirectory ? "directory-trigger" : "trigger"}>
          {model.triggerLabel}
        </UploadButton>
      )}
      <UploadButton slot="clear" hidden={!model.canClearCurrentPreview}>
        {model.clearLabel}
      </UploadButton>
    </div>
  );
}

function UploadButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { slot: string }) {
  const { children, className, slot, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-upload__button", className)}
      data-tbf-upload-slot={slot}
      type={type}
    >
      {children}
    </button>
  );
}

function UploadMeta(props: { children?: ReactNode; model: ReturnType<typeof uploadModel> }) {
  const { children, model } = props;
  return (
    <div className="tbf-upload__meta">
      <span className="tbf-upload__filename" data-tbf-upload-slot="filename">
        {model.emptyLabel}
      </span>
      {model.dropHint ? <span className="tbf-upload__hint">{model.dropHint}</span> : null}
      {model.helperText ? <span className="tbf-upload__hint">{model.helperText}</span> : null}
      {model.formatsText ? <span className="tbf-upload__hint">{model.formatsText}</span> : null}
      {children}
      <ul className="tbf-upload__list" data-tbf-upload-slot="list" />
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
      data-tbf-upload-slot="empty-toggle"
    />
  );
}

function ClearButton(props: ClearButtonProps) {
  const { children = "Clear", className, controls, type = "button", ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button", className)}
      data-tbf-clear={`#${controls.replace(/^#/u, "")}`}
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
      className={classNames("tbf-button", className)}
      data-tbf-password-toggle=""
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
  return <textarea {...rest} className={classNames("tbf-input", className)} data-tbf-autosize="" />;
}

export { AutosizeTextarea, ClearButton, PasswordToggleButton, UploadField };
export type { ClearButtonProps, PasswordToggleProps, UploadFieldProps };
