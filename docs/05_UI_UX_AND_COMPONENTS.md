# UI, accessibility and export

The release keeps the existing slate/emerald billing-tool visual direction, with clear amounts and explicit uncertainty rather than unsupported statistical/legal promises.

Routes: `/`, `/scan`, `/results/[id]`, `/dispute/[id]`, `/history`, `/about`, `/privacy`. Shared reports use `/results/share_<token>`; the hook resolves the exact identifier.

Reusable components: semantic example-card buttons, labelled audit-table checkboxes and expandable detail buttons, native modal billing coach, vault-storage error notice, navbar and footer. Form fields have visible or accessible labels. Focus indicators are global; reduced-motion rules suppress nonessential motion. Tables scroll inside their container.

Intake communicates provider transmission before consent, accepted file types, 2.5 MB size limit, text limit and cancellation. Waiting state describes an actual pending extraction; it does not simulate completed backend agents. Errors permit correction/retry or explicit sample mode.

Report UI distinguishes gross charges, patient balance and selected review amount. Unknown codes have no invented reference and do not receive a fair-price badge. Review packages show matching selected figures. A shared-link failure never claims a local URL is a public share.

Print styling uses A4 margins, text wrapping and hides navbar/footer/dialog/controls. The review letter can span pages; verify the final browser print preview for the chosen paper size. Browser testing and screenshot evidence are recorded in the release report.
