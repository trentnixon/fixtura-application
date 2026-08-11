import {
  SPONSOR_ARCHIVE_DELETE_DIALOG_DEFAULT_CONTENT,
  SPONSOR_ARCHIVE_DELETE_DIALOG_DELETING_CONTENT,
} from "../_constants/sponsor-archive-delete-dialog";

export function getSponsorArchiveDeleteDialogContent(isDeleting: boolean) {
  return isDeleting
    ? SPONSOR_ARCHIVE_DELETE_DIALOG_DELETING_CONTENT
    : SPONSOR_ARCHIVE_DELETE_DIALOG_DEFAULT_CONTENT;
}
