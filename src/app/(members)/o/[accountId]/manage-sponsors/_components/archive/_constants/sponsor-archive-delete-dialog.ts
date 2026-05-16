export const SPONSOR_ARCHIVE_DELETE_DIALOG_DEFAULT_CONTENT = {
  title: "Delete archived sponsor?",
  description:
    "This permanently removes the sponsor record and its allocation data. Restore the sponsor instead if you may need it later.",
  confirmLabel: "Delete sponsor",
} as const;

export const SPONSOR_ARCHIVE_DELETE_DIALOG_DELETING_CONTENT = {
  title: "Deleting sponsor",
  description: "Please wait while the sponsor is deleted.",
  confirmLabel: "Deleting",
} as const;

export const SPONSOR_ARCHIVE_DELETE_DIALOG_ARCHIVED_LABEL = "Archived sponsor";
