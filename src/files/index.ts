import {
  fileExtension,
  isImageFileObject,
} from "#58rj84wj84p8";

function fileObjectExtension(file: unknown, options: { withDot?: boolean } = {}) {
  return fileExtension(file instanceof File ? file : null, options);
}

export {
  fileObjectExtension,
  isImageFileObject,
};
