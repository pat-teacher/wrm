/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!**************************************************!*\
  !*** ./WebResources/src/contact/contact.form.ts ***!
  \**************************************************/

/// <reference types="xrm" />
var WMR;
(function (WMR) {
    var ContactForm;
    (function (ContactForm) {
        /**
         * Wird beim Laden des Contact-Formulars ausgef�hrt
         */
        function onLoad(ctx) {
            var formContext = ctx.getFormContext();
            formContext.ui.setFormNotification("Hallo vom Contact-Formular!", "INFO", "pcs_con_hello");
        }
        ContactForm.onLoad = onLoad;
        /**
         * Beispiel: pr�ft, ob Email gesetzt ist
         */
        function onChange_Email(ctx) {
            var _a;
            var formContext = ctx.getFormContext();
            var email = ((_a = formContext.getAttribute("emailaddress1")) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
            if (!email) {
                formContext.ui.setFormNotification("Bitte eine E-Mail-Adresse eingeben!", "ERROR", "pcs_con_email");
            }
            else {
                formContext.ui.clearFormNotification("pcs_con_email");
            }
        }
        ContactForm.onChange_Email = onChange_Email;
    })(ContactForm = WMR.ContactForm || (WMR.ContactForm = {}));
})(WMR || (WMR = {}));

(window.WRM = window.WRM || {}).contact_form = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFjdF9mb3JtLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSw2QkFBNkI7QUFFN0IsSUFBVSxHQUFHLENBcUJaO0FBckJELFdBQVUsR0FBRztJQUFDLGVBQVcsQ0FxQnhCO0lBckJhLHNCQUFXO1FBQ3JCOztXQUVHO1FBQ0gsU0FBZ0IsTUFBTSxDQUFDLEdBQTRCO1lBQy9DLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN6QyxXQUFXLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLDZCQUE2QixFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztRQUMvRixDQUFDO1FBSGUsa0JBQU0sU0FHckI7UUFFRDs7V0FFRztRQUNILFNBQWdCLGNBQWMsQ0FBQyxHQUE0Qjs7WUFDdkQsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3pDLElBQU0sS0FBSyxHQUFHLGtCQUFXLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQywwQ0FBRSxRQUFRLEVBQUUsS0FBSSxFQUFFLENBQUM7WUFDMUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNULFdBQVcsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMscUNBQXFDLEVBQUUsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3hHLENBQUM7aUJBQU0sQ0FBQztnQkFDSixXQUFXLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzFELENBQUM7UUFDTCxDQUFDO1FBUmUsMEJBQWMsaUJBUTdCO0lBQ0wsQ0FBQyxFQXJCYSxXQUFXLEdBQVgsZUFBVyxLQUFYLGVBQVcsUUFxQnhCO0FBQUQsQ0FBQyxFQXJCUyxHQUFHLEtBQUgsR0FBRyxRQXFCWiIsInNvdXJjZXMiOlsiQzovUHJvamVrdC9NYXJxdWFyZC93cm1Tb2x1dGlvbi9XZWJSZXNvdXJjZXMvc3JjL2NvbnRhY3QvY29udGFjdC5mb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwieHJtXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBXTVIuQ29udGFjdEZvcm0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBXaXJkIGJlaW0gTGFkZW4gZGVzIENvbnRhY3QtRm9ybXVsYXJzIGF1c2dlZu+/vWhydFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb25Mb2FkKGN0eDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmb3JtQ29udGV4dCA9IGN0eC5nZXRGb3JtQ29udGV4dCgpO1xyXG4gICAgICAgIGZvcm1Db250ZXh0LnVpLnNldEZvcm1Ob3RpZmljYXRpb24oXCJIYWxsbyB2b20gQ29udGFjdC1Gb3JtdWxhciFcIiwgXCJJTkZPXCIsIFwicGNzX2Nvbl9oZWxsb1wiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJlaXNwaWVsOiBwcu+/vWZ0LCBvYiBFbWFpbCBnZXNldHp0IGlzdFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb25DaGFuZ2VfRW1haWwoY3R4OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZvcm1Db250ZXh0ID0gY3R4LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICAgICAgY29uc3QgZW1haWwgPSBmb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUoXCJlbWFpbGFkZHJlc3MxXCIpPy5nZXRWYWx1ZSgpIHx8IFwiXCI7XHJcbiAgICAgICAgaWYgKCFlbWFpbCkge1xyXG4gICAgICAgICAgICBmb3JtQ29udGV4dC51aS5zZXRGb3JtTm90aWZpY2F0aW9uKFwiQml0dGUgZWluZSBFLU1haWwtQWRyZXNzZSBlaW5nZWJlbiFcIiwgXCJFUlJPUlwiLCBcInBjc19jb25fZW1haWxcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9ybUNvbnRleHQudWkuY2xlYXJGb3JtTm90aWZpY2F0aW9uKFwicGNzX2Nvbl9lbWFpbFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9