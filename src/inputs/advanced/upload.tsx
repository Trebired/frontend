import { createLocalTranslator, icon, button } from "./_shared.js";
import { bindUploads, uploadManager } from "#36iuc8ncbccq";
import {
  UploadField,
  type UploadFieldProps,
} from "#768t9nvx4aio";

type UploadProps = Omit<UploadFieldProps, "name"> & {
  lang?: string;
  name?: string;
};
type UploadButtonProps = {
  button_attrs?: Record<string, unknown>;
  className?: string;
  disabled?: boolean;
  form?: string;
  id?: string;
  lang?: string;
  label?: string;
  type?: "button" | "submit";
};

function uploadFieldLabels(props: UploadProps) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  return {
    cropFailedMessage:
    props.cropFailedMessage || localT("feedback.fileFormatNotAllowed"),
    cropImageOnlyDescription:
    props.cropImageOnlyDescription ||
      localT("feedback.chooseAcceptedFileFormat"),
    cropImageOnlyMessage:
    props.cropImageOnlyMessage ||
      localT("feedback.onlyImageFilesCanBeCropped"),
    modalDescription:
    props.modalDescription ||
      (props.crop === true ? localT("files.cropBeforeSaving") : undefined),
    modalTitle:
    props.modalTitle ||
      (props.crop === true ? localT("files.cropImage") : undefined),
  };
}

function upload(props: UploadProps) {
  const { lang: _lang, name = "", ...rest } = props;
  return (
    <UploadField
    {...rest}
    {...uploadFieldLabels(props)}
    data-upload-root=""
    name={name}
    />
  );
}

function upload_button(props: UploadButtonProps) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  return button({
      type: props.type || "submit",
      className: props.className,
      ...(props.disabled ? { disabled: true } : {}),
      ...(props.form ? { form: props.form } : {}),
      ...(props.id ? { id: props.id } : {}),
      ...(props.button_attrs && typeof props.button_attrs === "object"
        ? props.button_attrs
        : {}),
      children: (
        <>
        {icon({ spec: "remixicon upload-line" })}{" "}
        <span data-upload-button-label="">
        {props.label || localT("files.upload")}
        </span>
        </>
      ),
  });
}

export { bindUploads, upload, upload_button, uploadManager };
export type { UploadButtonProps, UploadProps };
