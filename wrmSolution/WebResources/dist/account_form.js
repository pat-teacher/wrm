/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!**************************************************!*\
  !*** ./WebResources/src/account/account.form.ts ***!
  \**************************************************/

/// <reference types="xrm" />
var WMR;
(function (WMR) {
    var AccountForm;
    (function (AccountForm) {
        /**
         * Wird beim Laden des Account-Formulars ausgef�hrt
         */
        function onLoad(ctx) {
            var formContext = ctx.getFormContext();
            formContext.ui.setFormNotification("Hallo vom Account-Formular!", "INFO", "pcs_acc_hello");
        }
        AccountForm.onLoad = onLoad;
        /**
         * Beispiel f�r OnChange des Namensfelds
         */
        function onChange_Name(ctx) {
            var _a;
            var formContext = ctx.getFormContext();
            var name = ((_a = formContext.getAttribute("name")) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
            if (!name) {
                formContext.ui.setFormNotification("Name ist sehr lang!", "WARNING", "pcs_acc_name");
            }
            else {
                formContext.ui.clearFormNotification("pcs_acc_name");
            }
        }
        AccountForm.onChange_Name = onChange_Name;
    })(AccountForm = WMR.AccountForm || (WMR.AccountForm = {}));
})(WMR || (WMR = {}));

(window.WRM = window.WRM || {}).account_form = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudF9mb3JtLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSw2QkFBNkI7QUFFN0IsSUFBVSxHQUFHLENBcUJaO0FBckJELFdBQVUsR0FBRztJQUFDLGVBQVcsQ0FxQnhCO0lBckJhLHNCQUFXO1FBQ3JCOztXQUVHO1FBQ0gsU0FBZ0IsTUFBTSxDQUFDLEdBQTRCO1lBQy9DLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN6QyxXQUFXLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLDZCQUE2QixFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztRQUMvRixDQUFDO1FBSGUsa0JBQU0sU0FHckI7UUFFRDs7V0FFRztRQUNILFNBQWdCLGFBQWEsQ0FBQyxHQUE0Qjs7WUFDdEQsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3pDLElBQU0sSUFBSSxHQUFHLGtCQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQywwQ0FBRSxRQUFRLEVBQUUsS0FBSSxFQUFFLENBQUM7WUFDaEUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNSLFdBQVcsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMscUJBQXFCLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3pGLENBQUM7aUJBQU0sQ0FBQztnQkFDSixXQUFXLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3pELENBQUM7UUFDTCxDQUFDO1FBUmUseUJBQWEsZ0JBUTVCO0lBQ0wsQ0FBQyxFQXJCYSxXQUFXLEdBQVgsZUFBVyxLQUFYLGVBQVcsUUFxQnhCO0FBQUQsQ0FBQyxFQXJCUyxHQUFHLEtBQUgsR0FBRyxRQXFCWiIsInNvdXJjZXMiOlsiQzovUHJvamVrdC9NYXJxdWFyZC93cm1Tb2x1dGlvbi9XZWJSZXNvdXJjZXMvc3JjL2FjY291bnQvYWNjb3VudC5mb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwieHJtXCIgLz5cclxuXHJcbm5hbWVzcGFjZSBXTVIuQWNjb3VudEZvcm0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBXaXJkIGJlaW0gTGFkZW4gZGVzIEFjY291bnQtRm9ybXVsYXJzIGF1c2dlZu+/vWhydFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb25Mb2FkKGN0eDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmb3JtQ29udGV4dCA9IGN0eC5nZXRGb3JtQ29udGV4dCgpO1xyXG4gICAgICAgIGZvcm1Db250ZXh0LnVpLnNldEZvcm1Ob3RpZmljYXRpb24oXCJIYWxsbyB2b20gQWNjb3VudC1Gb3JtdWxhciFcIiwgXCJJTkZPXCIsIFwicGNzX2FjY19oZWxsb1wiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJlaXNwaWVsIGbvv71yIE9uQ2hhbmdlIGRlcyBOYW1lbnNmZWxkc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gb25DaGFuZ2VfTmFtZShjdHg6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZm9ybUNvbnRleHQgPSBjdHguZ2V0Rm9ybUNvbnRleHQoKTtcclxuICAgICAgICBjb25zdCBuYW1lID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKFwibmFtZVwiKT8uZ2V0VmFsdWUoKSB8fCBcIlwiO1xyXG4gICAgICAgIGlmICghbmFtZSkge1xyXG4gICAgICAgICAgICBmb3JtQ29udGV4dC51aS5zZXRGb3JtTm90aWZpY2F0aW9uKFwiTmFtZSBpc3Qgc2VociBsYW5nIVwiLCBcIldBUk5JTkdcIiwgXCJwY3NfYWNjX25hbWVcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9ybUNvbnRleHQudWkuY2xlYXJGb3JtTm90aWZpY2F0aW9uKFwicGNzX2FjY19uYW1lXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=