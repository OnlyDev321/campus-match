# SSU academic catalog

`ssu-catalog.json` is an initial snapshot retrieved from the public college navigation
and department cards at https://ssu.ac.kr/교육-·-연구/대학소개/it대학/ on 2026-11-13.
It contains no student data or credentials. Standalone academic units use their own
name; Baird's general education courses are excluded from the department list.

The backend seeds this snapshot only when the database has no compatible catalog.
It refreshes the entire catalog daily at 04:00 Asia/Seoul, with hourly retries when
more than 24 hours old. Override the schedule with `campusmatch.academic-sync.cron`.
The backend process must be running for scheduled sync to execute.

GET /api/academic-units reads the last successful database snapshot. A failed fetch
or parse never replaces it. The API is public and does not call SAP or need a user
session. Review SsuAcademicSource selectors if SSU changes its page structure.
