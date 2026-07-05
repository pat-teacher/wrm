var Ambit = Ambit || {};
var frmOnload = false;
var objInternalTasksRef = [];

Ambit.MAH = Ambit.MAH || {};
Ambit.MAH.WRM2013 = Ambit.MAH.WRM2013 || {};
Ambit.MAH.WRM2013.JS = Ambit.MAH.WRM2013.JS || {};

Ambit.MAH.WRM2013.JS.InternalTasksFunctions = {

	formContext: null,

	OnLoad: function (executionContext)
	{
		formContext = executionContext.getFormContext();
		frmOnload = true;

		if (formContext.ui.getFormType() == 1) //create
		{
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setOnCreateStatus();
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.addOnChangeFunctions_onCreate();

			flow1 = new Ambit.MAH.WRM2013.JS.InternalTasksFunctions.IntTaskFlow("default");

			flow1.setTaskFlowFormState(flow1.userConfrm.section.Name);
			flow1.setTaskFlowFormState(flow1.complConfrm.section.Name);
			flow1.setTaskFlowFormState(flow1.mgmtConfrm.section.Name);
			flow1.setTaskFlowFormState("generalAttributes");666
			flow1.initFlowStatusReason();

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setCurrentUserAndDateForAttributes("nev_taskowner", "nev_taskdate" );
			
		}
		else if (formContext.ui.getFormType() == 2) //Update
		{
			//Xrm.Page.Ambit.MAH.WRM2013.JS.InternalTasksFunctions.onChangeUserConfrmStatus = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.onChangeUserConfrmStatus;
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.addOnChangeFunctions();

			flow1 = new Ambit.MAH.WRM2013.JS.InternalTasksFunctions.IntTaskFlow("default");

			flow1.setSelectedFlowType();
			flow1.setSelectedFlowStep();

			flow1.setTaskFlowFormState(flow1.userConfrm.section.Name);
			flow1.setTaskFlowFormState(flow1.complConfrm.section.Name);
			flow1.setTaskFlowFormState(flow1.mgmtConfrm.section.Name);
			flow1.setTaskFlowFormState("generalAttributes");
		}
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.HideAndShowSectionsOnChangeInternalTaskType(null)		
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.SetOneOfThreeFieldsMandatory(null);
		frmOnload = false;
	},
	addOnChangeFunctions: function ()
	{
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.AddOnChangeFunctionToAttribute("nev_taskconfirmitionstatus", Ambit.MAH.WRM2013.JS.InternalTasksFunctions.onChangeUserConfrmStatus);
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.AddOnChangeFunctionToAttribute("nev_complianceapprovalstatus", Ambit.MAH.WRM2013.JS.InternalTasksFunctions.onChangeComplApprovalStatus);
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.AddOnChangeFunctionToAttribute("nev_managementapprovalstatus", Ambit.MAH.WRM2013.JS.InternalTasksFunctions.onChangMgmtApprovalStatus);

		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.AddOnChangeFunctionToAttribute("nev_approvalflowtype", Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setOnChangeFlowType);
	},

	addOnChangeFunctions_onCreate: function ()
	{
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.AddOnChangeFunctionToAttribute("nev_internaltasktype", Ambit.MAH.WRM2013.JS.InternalTasksFunctions.onChangeInternalTaskType);
	},

	AddOnChangeFunctionToAttribute: function (fieldname, functionname)
	{
		if (fieldname != null && functionname != null)
		{
			if (formContext.getAttribute(fieldname))
			{
				formContext.getAttribute(fieldname).addOnChange(functionname);
			}
		}
	},
	HideAndShowSectionsOnChangeInternalTaskType:  function(executionContext)
	{
		if(executionContext !== null)
			formContext = executionContext.getFormContext();
		var taskType = formContext.getAttribute("nev_internaltasktype").getValue();
		if(taskType !== null && taskType !== undefined){
			var taskTypeId = taskType[0].id.replace("{","").replace("}","");
			Xrm.WebApi.retrieveRecord("nev_internaltasktype", taskTypeId, "?$select=nev_internaltasktypecodename").then(
			function success (result){
			if(result.nev_internaltasktypecodename ===  "WF_TRVL_REQ_01"){
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_visitDetails").setVisible(true);
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_button").setVisible(true);				
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_usr_confirmation").setVisible(false);
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_comment").setVisible(false);
				formContext.getControl("mhwrmb_startdate").setVisible(true);
				formContext.getControl("mhwrmb_enddate").setVisible(true);
				
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_instruction").setLabel("Travel Request Instruction");
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_visitDetails").setLabel("Travel Details");
				
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_contactid", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_companyid", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_portfolioid", true);
				
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_travelprocess_initiatedby", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_targetcountry", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_startdate", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_travelprocess_purposeofvisit", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_taskcomment", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_channelofinitiation", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_enddate", true);
				
				
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.SetCountryFromContactOrCompany(executionContext);
			}
			else{
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_visitDetails").setVisible(false);
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_button").setVisible(false);
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_usr_confirmation").setVisible(true);
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_comment").setVisible(true);
				formContext.getControl("mhwrmb_startdate").setVisible(false);
				formContext.getControl("mhwrmb_enddate").setVisible(false);
				
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_instruction").setLabel("Task Instruction");
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_visitDetails").setLabel("Visit Details");
				
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_contactid", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_companyid", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_portfolioid", false);
				
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_travelprocess_initiatedby", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_targetcountry", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_startdate", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_travelprocess_purposeofvisit", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_taskcomment", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_channelofinitiation", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_enddate", false);
			}
			},
			function (error){
				console.log(error.message);
			});
		}
		else
		{
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_visitDetails").setVisible(false);
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_button").setVisible(false);
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_usr_confirmation").setVisible(true);
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_comment").setVisible(true);
				formContext.getControl("mhwrmb_startdate").setVisible(false);
				formContext.getControl("mhwrmb_enddate").setVisible(false);
				
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_inttask_task_instruction").setLabel("Task Instruction");
				formContext.ui.tabs.get("tab_inttask_general").sections.get("tab_general_section_visitDetails").setLabel("Visit Details");
				
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_contactid", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_companyid", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_portfolioid", false);
				
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_travelprocess_initiatedby", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_targetcountry", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_startdate", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_travelprocess_purposeofvisit", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("nev_taskcomment", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_channelofinitiation", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRequired("mhwrmb_enddate", false);
		}
	},
	SetCountryFromContactOrCompany: function (executionContext)
	{
		formContext = executionContext.getFormContext();
		var country = formContext.getAttribute("mhwrmb_targetcountry").getValue();
		var contact = formContext.getAttribute("nev_contactid").getValue();
		var company = formContext.getAttribute("nev_companyid").getValue();
		if((country !== null && country !== undefined) && ((contact !== null && contact !== undefined) || (company !== null && company !== undefined))){
			var confirmStrings = { text:"Do you want to overwrite the existing value of Target Country ?", title:"Confirm Overwrite" };
			var confirmOptions = { height: 200, width: 450 };
			Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
			function (success) {    
				if (success.confirmed)
				{
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.GetCountryFromContactOrCompany(formContext, contact, company);
				}
				else
					console.log("User declined to overwrite the existing value.");
			},
			function (error){
				console.log("An error occured while displaying the confirmation dialog: " + error.message);
			});
		}
		else{
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.GetCountryFromContactOrCompany(formContext, contact, company);
		}
	},
	GetCountryFromContactOrCompany: function(formContext, contact, company)
	{
		var bool = false;
		var entityLogicalName = new String();
		var recordId = new String();
		if(contact !== null && contact !== undefined){
			entityLogicalName = "contact";
			recordId = contact[0].id.replace("{","").replace("}","");
			bool = true
        }
		if(company !== null && company !== undefined){
			entityLogicalName = "account";
			recordId = company[0].id.replace("{","").replace("}","");
			bool = true;
		}
		if(bool === true){
			Xrm.WebApi.retrieveRecord(entityLogicalName, recordId, "?$select=_wrmb_address1_countryid_value").then(
				function success(result) {
					var countryLookupValue = new Array();
					countryLookupValue[0] = new Object();
					countryLookupValue[0].id = result._wrmb_address1_countryid_value;
					countryLookupValue[0].name = result["_wrmb_address1_countryid_value@OData.Community.Display.V1.FormattedValue"];
					countryLookupValue[0].entityType = result["_wrmb_address1_countryid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
					formContext.getAttribute("mhwrmb_targetcountry").setValue(countryLookupValue);
				},
				function (error) {
					console.log(error.message);
			});
		}
	},
	SetOneOfThreeFieldsMandatory: function (executionContext)
	{
		if(executionContext !== null)
			formContext = executionContext.getFormContext();
		
		var value1 = formContext.getAttribute("nev_contactid").getValue();
		var value2 = formContext.getAttribute("nev_companyid").getValue();
		var value3 = formContext.getAttribute("nev_portfolioid").getValue();
			if (value1 !== null && (value2 === null || value2 === undefined) && (value3 === null || value3 === undefined))
			{
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_contactid", false);
				formContext.getAttribute("nev_contactid").setRequiredLevel("required");
				
				formContext.getAttribute("nev_companyid").setRequiredLevel("none");
				formContext.getAttribute("nev_portfolioid").setRequiredLevel("none");
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_companyid", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_portfolioid", true);
			}
			else if (value2 !== null && (value1 === null || value1 === undefined) && (value3 === null || value3 === undefined))
			{
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_companyid", false);
				formContext.getAttribute("nev_companyid").setRequiredLevel("required");
				
				formContext.getAttribute("nev_contactid").setRequiredLevel("none");
				formContext.getAttribute("nev_portfolioid").setRequiredLevel("none");
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_contactid", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_portfolioid", true);
			}
			else if (value3 !== null && (value1 === null || value1 === undefined) && (value2 === null || value2 === undefined))
			{
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_portfolioid", false);
				formContext.getAttribute("nev_portfolioid").setRequiredLevel("required");
								
				formContext.getAttribute("nev_contactid").setRequiredLevel("none");
				formContext.getAttribute("nev_companyid").setRequiredLevel("none");
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_contactid", true);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_companyid", true);
			}
			else if ((value1 === null || value1 === undefined) && (value2 === null || value2 === undefined) && (value3 === null || value3 === undefined))
			{				
				formContext.getAttribute("nev_portfolioid").setRequiredLevel("none");				
				formContext.getAttribute("nev_contactid").setRequiredLevel("none");
				formContext.getAttribute("nev_companyid").setRequiredLevel("none");
				
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_contactid", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_companyid", false);
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_portfolioid", false);
			}
	},
	findControl: function (fieldname, checkonlybody)
	{
		if (formContext.getControl(fieldname) != null)
		{
			return formContext.getControl(fieldname);
		}
		if (checkonlybody == false)
		{
			if (formContext.getControl("header_" + fieldname) != null)
			{
				return formContext.getControl("header_" + fieldname);
			}
			if (formContext.getControl("footer_" + fieldname) != null)
			{
				return formContext.getControl("footer_" + fieldname);
			}
		}
		return null;
	},

	setControlDisabled: function (fieldname, SetDisabled)
	{
		var control = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.findControl(fieldname, false);
		if (control != null)
		{
			control.setDisabled(SetDisabled);
		}
	},

	setControlHidden: function (fieldname, SetVisible)
	{
		var control = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.findControl(fieldname, false);
		if (control != null)
		{
			if(SetVisible){
				control.setVisible(false);
			}else 
			{
				control.setVisible(true);
			}

			
		}
	},

	setControlBlank: function (fieldname)
	{
		if (formContext.getAttribute(fieldname) !=null)
		{
			if (formContext.getAttribute(fieldname).getValue() != null)
			{
					formContext.getAttribute(fieldname).setValue(null);
			}
		}
	},

	setAttributeRequired: function (fieldname, SetRequired)
	{
		var attr = formContext.getAttribute(fieldname);
		if (attr != null)
		{
			if (SetRequired == true)
			{
				attr.setRequiredLevel("required");
			}
			if (SetRequired == false)
			{
				attr.setRequiredLevel("none");
			}
		}
	},
		setAttributeRecommended: function (fieldname, SetRequired)
	{
		var attr = formContext.getAttribute(fieldname);
		if (attr != null)
		{
			if (SetRequired == true)
			{
				attr.setRequiredLevel("recommended");
			}
			if (SetRequired == false)
			{
				attr.setRequiredLevel("none");
			}
		}
	},

	setOnChangeFlowType: function ()
	{
		flow1.updateProcessStepByFlowType("");
	},

	onChangeUserConfrmStatus: function ()
	{
		flow1.updateProcessStepByFlowType(flow1.userConfrm.attr.TaskConfirmStatus);
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setCurrentUserAndDateForAttributes(flow1.userConfrm.attr.TaskConfirmUser, flow1.userConfrm.attr.TaskConfirmDate );
	},

	onChangeComplApprovalStatus: function ()
	{
		flow1.updateProcessStepByFlowType(flow1.complConfrm.attr.TaskConfirmStatus);
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setCurrentUserAndDateForAttributes(flow1.complConfrm.attr.TaskConfirmUser, flow1.complConfrm.attr.TaskConfirmDate );
	},

	onChangMgmtApprovalStatus: function ()
	{
		flow1.updateProcessStepByFlowType(flow1.mgmtConfrm.attr.TaskConfirmStatus);
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setCurrentUserAndDateForAttributes(flow1.mgmtConfrm.attr.TaskConfirmUser, flow1.mgmtConfrm.attr.TaskConfirmDate );
	},

	setCurrentUserAndDateForAttributes: function (userFieldName, dateFieldName) {

        if (formContext.getAttribute(userFieldName) != null && formContext.getAttribute(userFieldName).getValue() == null) {
            var lookupReference = [];
            lookupReference[0] = {};
            lookupReference[0].id = formContext.context.getUserId();
            lookupReference[0].entityType = "systemuser";
            lookupReference[0].name = formContext.context.getUserName();
            formContext.getAttribute(userFieldName).setValue(lookupReference);
            formContext.getAttribute(userFieldName).setSubmitMode("always");
        }

        if (formContext.getAttribute(dateFieldName) != null && formContext.getAttribute(dateFieldName).getValue() == null)
        { 
        	formContext.getAttribute(dateFieldName).setValue(new Date()); 
        	formContext.getAttribute(dateFieldName).setSubmitMode("always");
        	
        }
    },

	setFlowStepValue: function (statusReasonFieldName, newValue) {
		var headerAttr = "";
        if (formContext.getAttribute(statusReasonFieldName) != null && formContext.getAttribute(statusReasonFieldName).getValue() != newValue) {
        	formContext.getAttribute(statusReasonFieldName).setValue(newValue); 
        	formContext.getAttribute(statusReasonFieldName).setSubmitMode("always");
			Xrm.Utility.alertDialog("Flow Status changed to: " + formContext.getAttribute(statusReasonFieldName).getText());
			headerAttr = "header_" + statusReasonFieldName
		}
    },

	setApprovalValue: function (statusReasonFieldName, newValue) {

        if (formContext.getAttribute(statusReasonFieldName) != null && formContext.getAttribute(statusReasonFieldName).getValue() != newValue) {
        	formContext.getAttribute(statusReasonFieldName).setValue(newValue); 
        	formContext.getAttribute(statusReasonFieldName).setSubmitMode("always");
			Xrm.Utility.alertDialog("Approval value changed to: " + formContext.getAttribute(statusReasonFieldName).getText());
        }
    },

	//Code for Task Flow Process
	IntTaskFlow: function (flowType){
		this.flowType = flowType;
		this.flowStepSelected = {};
		this.flowStepSelected.CodeValue = null;
		this.flowStepSelected.NameValue = null;

		this.flowTypeSelected = {}
		this.flowTypeSelected.CodeValue = null;
		this.flowTypeSelected.NameValue = null;

		//this.flowStepAttrName = "nev_flowstep";//new 2024-07-17

		this.cnsFlowStep = {};

		/*******/
		//attribute nev_taskconfirmitionstatus (on ui task confirmation Status under user confirmation)
		this.cnsUsrComfrmStatus = {};
		this.cnsUsrComfrmStatus.NA = {};
		this.cnsUsrComfrmStatus.NA.CodeValue = 279650002; //N/A
		this.cnsUsrComfrmStatus.NA.NameValue = "NA";

		this.cnsUsrComfrmStatus.Yes = {};
		this.cnsUsrComfrmStatus.Yes.CodeValue = 279650000; //Yes - Confirmed
		this.cnsUsrComfrmStatus.Yes.NameValue = "Yes";

		this.cnsUsrComfrmStatus.No = {};
		this.cnsUsrComfrmStatus.No.CodeValue = 279650001; //No - Not Confirmed
		this.cnsUsrComfrmStatus.No.NameValue = "No";

		this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance = {};
		this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance.CodeValue = 279650003;
		this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance.NameValue = "Rejected by Compliance";

		//2024-07-17 NEW Task Confirmation Status
		this.cnsUsrComfrmStatus.ConfrmRejectedByManager = {};
		this.cnsUsrComfrmStatus.ConfrmRejectedByManager.CodeValue = 279650004;
		this.cnsUsrComfrmStatus.ConfrmRejectedByManager.NameValue = "Rejected by Manager";

		//New: 2024-07-17: New User Confirmation Status for ManagerOnly Flow
		/*this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance = {};
		this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance.CodeValue = 279650004;
		this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance.NameValue = "Rejected by Manager";*/

		/*******/
		//attribute nev_taskconfirmitionstatus (on ui task confirmation Status under user confirmation)
		this.cnsApprStatus = {};
		this.cnsApprStatus.Approved = {};
		this.cnsApprStatus.Approved.CodeValue = 279650001;
		this.cnsApprStatus.Approved.NameValue = "No";
		
		this.cnsApprStatus.Rejected = {};
		this.cnsApprStatus.Rejected.CodeValue = 279650002;
		this.cnsApprStatus.Rejected.NameValue = "Rejected";

		this.cnsApprStatus.NA = {};
		this.cnsApprStatus.NA.CodeValue = 279650000;
		this.cnsApprStatus.NA.NameValue = "NA";

		this.cnsApprStatus.ComplApprvlRejectedByMgmt = {};
		this.cnsApprStatus.ComplApprvlRejectedByMgmt.CodeValue = 279650003;
		this.cnsApprStatus.ComplApprvlRejectedByMgmt.NameValue = "9_Compl Approval Rejected by Mgmt";

		/**********/
		//attribute MH-InteralTaskFlowType (on ui Approval Flow Type)
		this.cnsflowTypes = {};
		this.cnsflowTypes.NotRequired = {};
		this.cnsflowTypes.NotRequired.CodeValue = 279650002;
		this.cnsflowTypes.NotRequired.NameValue = "Not-Required";

		this.cnsflowTypes.UsrComplMgmt = {};
		this.cnsflowTypes.UsrComplMgmt.CodeValue = 279650000;
		this.cnsflowTypes.UsrComplMgmt.NameValue = "UsrComplMgmt";
		
		this.cnsflowTypes.UsrCompl = {};
		this.cnsflowTypes.UsrCompl.CodeValue = 279650001;
		this.cnsflowTypes.UsrCompl.NameValue = "UsrCompl";

		//New Flow Type added 2024-06-20 
		this.cnsflowTypes.AdvisorOnly = {};
		this.cnsflowTypes.AdvisorOnly.CodeValue = 279650005;
		this.cnsflowTypes.AdvisorOnly.NameValue = "UsrOnly"; //Advisor Only

		//New Flow Type added 2024-07-17 
		this.cnsflowTypes.ManagerOnly = {};
		this.cnsflowTypes.ManagerOnly.CodeValue = 279650006;
		this.cnsflowTypes.ManagerOnly.NameValue = "ManagerOnly"; //Manager Only

		//New Flow Type added 2024-08-29 
		//Adviosor Draft -> Compliance
		this.cnsflowTypes.AdvDraftCompl = {};
		this.cnsflowTypes.AdvDraftCompl.CodeValue = 279650007;
		this.cnsflowTypes.AdvDraftCompl.NameValue = "Adv_Draft-Compliance"; //Manager Only
		
		this.flowTypeAttrName = "nev_approvalflowtype";

		this.ConfrmRequiredYesValue = 279650001;
		this.ConfrmRequiredNoValue = 279650002;
		
		this.userConfrm = {}
		this.userConfrm.section = {}
		this.userConfrm.section.Name = "usr-confirm-section";
		this.userConfrm.section.IsUsrAllowedToEdit = false;
		this.userConfrm.section.IsMandatory = false;
		this.userConfrm.section.ReadOnly = false;

		this.userConfrm.sectionName = "usr-confirm-section";
		this.userConfrm.isRequired = false; 
		this.userConfrm.attr = {}
		this.userConfrm.attr.TaskConfirmRequiredFlag = "nev_userconfirmationrequired"; //279650001 = Yes
        this.userConfrm.attr.TaskConfirmStatus = "nev_taskconfirmitionstatus";
		this.userConfrm.attr.TaskConfirmDate = "nev_taskconfirmationdate";
		this.userConfrm.attr.TaskConfirmUser = "nev_taskconfirmedbyid";
		this.userConfrm.attr.TaskConfirmMsg = null;

		this.complConfrm = {}
		this.complConfrm.section = {}
		this.complConfrm.section.Name = "compl-confirm-section";
		this.complConfrm.section.IsUsrAllowedToEdit = false;
		this.complConfrm.section.IsMandatory = false;
		this.complConfrm.section.ReadOnly = false;

		this.complConfrm.sectionName = "compl-confirm-section";
		this.complConfrm.isRequired = false; 
		this.complConfrm.attr = {}
		this.complConfrm.attr.TaskConfirmRequiredFlag = "nev_complianceapprovalrequired"; //279650001 = Yes
        this.complConfrm.attr.TaskConfirmStatus = "nev_complianceapprovalstatus";
		this.complConfrm.attr.TaskConfirmDate = "nev_compliancereviewdate";
		this.complConfrm.attr.TaskConfirmUser = "nev_compliancereviewedbyid";
		this.complConfrm.attr.TaskConfirmMsg = "nev_compliancecomment";

		this.mgmtConfrm = {}
		this.mgmtConfrm.section = {}
		this.mgmtConfrm.section.Name = "mgmt-confirm-section";
		this.mgmtConfrm.section.IsUsrAllowedToEdit = false;
		this.mgmtConfrm.section.IsMandatory = false;
		this.mgmtConfrm.section.ReadOnly = false;

		this.mgmtConfrm.sectionName = "mgmt-confirm-section";
		this.mgmtConfrm.isRequired = false; 
		this.mgmtConfrm.isRequiredOptionalByCompl = false; 
		this.mgmtConfrm.attr = {}
		this.mgmtConfrm.attr.TaskConfirmRequiredFlag = "nev_managementapprovalrequired"; //279650001 = Yes
        this.mgmtConfrm.attr.TaskConfirmStatus = "nev_managementapprovalstatus";
		this.mgmtConfrm.attr.TaskConfirmDate = "nev_managementreviewdate";
		this.mgmtConfrm.attr.TaskConfirmUser = "nev_managementreviewedbyid";
		this.mgmtConfrm.attr.TaskConfirmMsg = "nev_managementcomment";
		
		//link functions
		this.showMsg = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.showMsg;
		
		this.setTaskFlowFormState = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setTaskFlowFormState;
		this.setApprovalRequiredValue = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalRequiredValue;
		this.setSelectedFlowType =  Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setSelectedFlowType;
		this.initFlowStatusReason = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.initFlowStatusReason;
		this.setSelectedFlowStep = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setSelectedFlowStep;
		this.updateProcessStepByFlowType = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.updateProcessStepByFlowType;
		this.setApprovalValue = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalValue;
		this.setOnChangeInternalTaskType = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setOnChangeInternalTaskType;
		
		this.isComplianceApproved = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.isComplianceApproved;
		this.isComplianceRejected = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.isComplianceRejected;
		this.isMgmtApproved = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.isMgmtApproved;
		this.isMgmtRejected = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.isMgmtRejected;
		this.isUsrConfirmed = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.isUsrConfirmed;
		this.isUsrManagerRejected = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.isUsrManagerRejected;
		this.isInFlowStepDraft = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.isInFlowStepDraft;
		
		
		//fetch user entitlement
		this.userConfrm.section.IsUsrAllowedToEdit = true;
		this.complConfrm.section.IsUsrAllowedToEdit = XrmServiceToolkit.Soap.IsCurrentUserRole("WRM Compliance Officer");
		this.mgmtConfrm.section.IsUsrAllowedToEdit = XrmServiceToolkit.Soap.IsCurrentUserRole("WRM KYC Approval Manager");

		this.initFlowStatusReason();
	},

	showMsg: function() {
		var msg;
		msg = "FLow Type " + this.flowType  + "\n" + "More";
		msg = "FLow Type " + this.flowTypeSelected.NameValue + " " + this.flowTypeSelected.CodeValue  + "\n" + 
							" User Apprval Required: " + (this.userConfrm.isRequired  ? "Yes" : "No") + "." + "\n" +
							" Compl Apprval Required: " + (this.complConfrm.isRequired  ? "Yes" : "No") + "." + "\n" +
							" Mgmt Apprval Required: " + (this.mgmtConfrm.isRequired  ? "Yes" : "No") + "." + "\n" +
							" Mgmt Apprval Required (Optional): " + (this.mgmtConfrm.isRequiredOptionalByCompl  ? "Yes" : "No") + "." + "\n" ;
		alert(msg);
		console.log(msg);
	},

	setTaskFlowFormState: function(stateMessage) {
		var bolDisableState;
		var bolAttrbuteRequired = false;

		console.log("In Form State" + stateMessage);
		
		/// User Section
		if (stateMessage == this.userConfrm.section.Name){
			if(this.userConfrm.isRequired) {
				if (this.userConfrm.section.IsUsrAllowedToEdit){
					bolDisableState = false;
				}
				else{ bolDisableState = true; }
			}
			else { bolDisableState = true; }

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.userConfrm.attr.TaskConfirmStatus, bolDisableState);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.userConfrm.attr.TaskConfirmDate, bolDisableState);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.userConfrm.attr.TaskConfirmUser, bolDisableState);

			bolAttrbuteRequired = !bolDisableState

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.userConfrm.attr.TaskConfirmStatus, bolAttrbuteRequired);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.userConfrm.attr.TaskConfirmDate, bolAttrbuteRequired);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.userConfrm.attr.TaskConfirmUser, bolAttrbuteRequired);
		}

		/// Compliance Section
		if (stateMessage == this.complConfrm.section.Name){
			if(this.complConfrm.isRequired){
				if (this.complConfrm.section.IsUsrAllowedToEdit){
					bolDisableState = false;	
				}
				else { bolDisableState = true; }
			}
			else { bolDisableState = true; }

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.complConfrm.attr.TaskConfirmStatus , bolDisableState);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.complConfrm.attr.TaskConfirmDate, bolDisableState);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.complConfrm.attr.TaskConfirmUser, bolDisableState);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.complConfrm.attr.TaskConfirmMsg, bolDisableState);

			bolAttrbuteRequired = !bolDisableState

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.complConfrm.attr.TaskConfirmStatus , bolAttrbuteRequired);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.complConfrm.attr.TaskConfirmDate, bolAttrbuteRequired);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.complConfrm.attr.TaskConfirmUser, bolAttrbuteRequired);
		}
		
		/// Mgmt Section
		console.log(this.mgmtConfrm.section.Name);
		if (stateMessage == this.mgmtConfrm.section.Name){
			if(this.mgmtConfrm.isRequired){
				if (this.mgmtConfrm.section.IsUsrAllowedToEdit){
					bolDisableState = false;	
				}
				else { bolDisableState = true; }
			}
			else { bolDisableState = true; }

			//Disable confirmation atrributes for User
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.mgmtConfrm.attr.TaskConfirmStatus , bolDisableState);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.mgmtConfrm.attr.TaskConfirmDate, bolDisableState);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.mgmtConfrm.attr.TaskConfirmUser, bolDisableState);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled(this.mgmtConfrm.attr.TaskConfirmMsg, bolDisableState);

			bolAttrbuteRequired = !bolDisableState

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.mgmtConfrm.attr.TaskConfirmStatus , bolAttrbuteRequired);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.mgmtConfrm.attr.TaskConfirmDate, bolAttrbuteRequired);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setAttributeRecommended(this.mgmtConfrm.attr.TaskConfirmUser, bolAttrbuteRequired);
		}


		//Check for other Attributes
		if (stateMessage == "generalAttributes"){
			//if there is an external id perform as below
			//TODO; At the moment all fields turn to read-write if there is no external ID which can be an issue for manually created tasks
			//an idea could be to fetch information from the Task Type and to decide if attribute should be readonly or not
			//could be dependent on if there is an instruction text available or not in the config
			if (formContext.getAttribute("nev_externalid") != null){
				bolDisableState = true;

				if (formContext.getAttribute("nev_extiscreatedfromexternal").getValue().toString() == "true"){
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_externalid" , bolDisableState);
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_approvalflowtype" , bolDisableState);
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_flowstep", bolDisableState);
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_internaltasktype", bolDisableState);
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_subject", bolDisableState);
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_instructedby", bolDisableState);
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskinstruction", bolDisableState);

					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_externalid", bolDisableState);
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_externalid2", bolDisableState);

					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmation", bolDisableState);

					//check entitlement
					if (this.complConfrm.section.IsUsrAllowedToEdit){
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_approvalflowtype" , false);	
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_flowstep", false);
					}
					else
					{
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_approvalflowtype" , true);	
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_flowstep", true);
					}
				}
				else
				{
					if (formContext.ui.getFormType() == 1) //create
					{
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_internaltasktype", false);
					}
					else
					{
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskcomment", false);

						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmationdateofcontact", false);
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmationcontactedby", false);
					}
				}
			}
		}
	},

	setApprovalRequiredValue: function (fieldname, bolApprovalReq)
	{ var dropDownValue;

		if (bolApprovalReq) { dropDownValue = this.ConfrmRequiredYesValue; }
		else { dropDownValue = this.ConfrmRequiredNoValue; }

		if (formContext.getAttribute(fieldname) !=null)
		{
			if (formContext.getAttribute(fieldname).getValue() != null && formContext.getAttribute(fieldname).getValue() !=dropDownValue)
			{
				formContext.getAttribute(fieldname).setValue(dropDownValue);
			}
		}
	},

	//UPDATE HERE THE WORKFLOW LOGIC - PART2
	setSelectedFlowType: function ()
	{ 		
		//set form value if required
		if (formContext.getAttribute(this.flowTypeAttrName) !=null)
		{
			this.flowTypeSelected.CodeValue = formContext.getAttribute(this.flowTypeAttrName).getValue();
			this.flowStepSelected.CodeValue = formContext.getAttribute(this.cnsFlowStep.attrName).getValue();

				//Set Name value
				//Not Required
				if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.NotRequired.CodeValue){
					this.flowTypeSelected.NameValue = this.cnsflowTypes.NotRequired.NameValue;
					//Set default values
					this.userConfrm.isRequired = false; 
					this.complConfrm.isRequired = false; 
					this.mgmtConfrm.isRequired = false; 
				}
				//Advisor-Compl-Mgmt
				else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.UsrComplMgmt.CodeValue){
					this.flowTypeSelected.NameValue = this.cnsflowTypes.UsrComplMgmt.NameValue;
					//Set default values
					this.userConfrm.isRequired = true; 
					this.complConfrm.isRequired = true; 
					this.mgmtConfrm.isRequired = true;
				}
				//Advisor-Compl
				else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.UsrCompl.CodeValue){
					this.flowTypeSelected.NameValue = this.cnsflowTypes.UsrCompl.NameValue;
					//Set default values
					this.userConfrm.isRequired = true; 
					this.complConfrm.isRequired = true; 
					this.mgmtConfrm.isRequired = false;
				}

				//Advisor Only
				else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.AdvisorOnly.CodeValue){
					this.flowTypeSelected.NameValue = this.cnsflowTypes.AdvisorOnly.NameValue;
					//Set default values
					this.userConfrm.isRequired = true; 
					this.complConfrm.isRequired = false; 
					this.mgmtConfrm.isRequired = false;
				}

				//Manager Only
				else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.ManagerOnly.CodeValue){
					this.flowTypeSelected.NameValue = this.cnsflowTypes.ManagerOnly.NameValue;
					//Set default values
					
					//IF USER confirmation status has a value of RejectedByManager make it editable
					if(this.flowStepSelected.CodeValue == this.cnsFlowStep.RejectedByAdvManager.CodeValue)
					{
						this.userConfrm.isRequired = true; 
					}
					else
					{
						this.userConfrm.isRequired = false; 
					}


					this.complConfrm.isRequired = false; 
					this.mgmtConfrm.isRequired = true;
				}

				//Adv_Draft-Compliance
				//1.Draft by Advisor / 2. Pending Compliance
				else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.AdvDraftCompl.CodeValue){
					this.flowTypeSelected.NameValue = this.cnsflowTypes.AdvDraftCompl.NameValue;
					
					//Xrm.Utility.alertDialog("TEST Flow Step changed to: " + this.isInFlowStepDraft()).getText());
					//alert(this.isInFlowStepDraft());
					
					//check if flowstep is in Draft Mode
					//Allow user to edit the User Confrm Status as it's in Draft State or not yet set to confirmed'
					if(this.isInFlowStepDraft() || !this.isUsrConfirmed())
					{
						this.userConfrm.isRequired = true; 
						this.userConfrm.section.IsUsrAllowedToEdit = true;
						this.complConfrm.isRequired = false; 
						this.mgmtConfrm.isRequired = false;

					}
					else{
						//IF USER confirmation status has a value of RejectedByCompliance make it editable
						if(this.flowStepSelected.CodeValue == this.cnsFlowStep.RejectedByCompliance.CodeValue)
						{
							this.userConfrm.isRequired = true; 
							this.complConfrm.isRequired = true; 
							this.mgmtConfrm.isRequired = false;
						}
						else
						{
							this.userConfrm.isRequired = false; 
							this.complConfrm.isRequired = true; 
							this.mgmtConfrm.isRequired = false;
						}
					}



				}
		}
	},

setSelectedFlowStep: function ()
	{ 		
		//set form value if required
		if (formContext.getAttribute(this.cnsFlowStep.attrName) !=null)
		{
			this.flowStepSelected.CodeValue = formContext.getAttribute(this.cnsFlowStep.attrName).getValue();
				//Set Name valueOn
				if(this.flowStepSelected.CodeValue == this.cnsFlowStep.NotApplicable.CodeValue){
					this.flowStepSelected.NameValue = this.cnsFlowStep.NotApplicable.NameValue;
				}
				else if(this.flowStepSelected.CodeValue == this.cnsFlowStep.PendingAdvisor.CodeValue){
					this.flowStepSelected.NameValue = this.cnsFlowStep.PendingAdvisor.NameValue;					
				}
				else if(this.flowStepSelected.CodeValue == this.cnsFlowStep.PendingCompliance.CodeValue){
					this.flowStepSelected.NameValue = this.cnsFlowStep.PendingCompliance.NameValue;
				}
				else if(this.flowStepSelected.CodeValue == this.cnsFlowStep.PendingMgmt.CodeValue){
					this.flowStepSelected.NameValue = this.cnsFlowStep.PendingMgmt.NameValue;
				}
				else if(this.flowStepSelected.CodeValue == this.cnsFlowStep.RejectedByCompliance.CodeValue){
					this.flowStepSelected.NameValue = this.cnsFlowStep.RejectedByCompliance.NameValue;
				}
				else if(this.flowStepSelected.CodeValue == this.cnsFlowStep.RejectedByMgmt.CodeValue){
					this.flowStepSelected.NameValue = this.cnsFlowStep.RejectedByMgmt.NameValue;
				}
				else if(this.flowStepSelected.CodeValue == this.cnsFlowStep.Completed.CodeValue){
					this.flowStepSelected.NameValue = this.cnsFlowStep.Completed.NameValue;
				}
				console.log("Status Reason selected:" + this.flowStepSelected.NameValue);
		}
	},

/// Method to update status reason based on values defined
//UPDATE HERE THE WORKFLOW LOGIC - PART1
updateProcessStepByFlowType: function (srcOfChange)
	{ 	var tskConfirmationCode;
		var complConfirmationCode;
		var mgmtConfirmationCode;
	
		this.setSelectedFlowType();
		this.setSelectedFlowStep();

		//Set Task Confirm values
		tskConfirmationCode =  formContext.getAttribute(this.userConfrm.attr.TaskConfirmStatus).getValue();
		complConfirmationCode =  formContext.getAttribute(this.complConfrm.attr.TaskConfirmStatus).getValue();
		mgmtConfirmationCode = formContext.getAttribute(this.mgmtConfrm.attr.TaskConfirmStatus).getValue();
			
		//Default
		this.userConfrm.section.ReadOnly = false;
		this.complConfrm.section.ReadOnly = false;

		//Flow Step: Not Required
		if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.NotRequired.CodeValue){
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.NotApplicable.CodeValue);
		}

		//Flow Step: Adv-Compl-Mgmt
		else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.UsrComplMgmt.CodeValue)
		{
			if(this.isUsrConfirmed())
			{	
				 if(this.isComplianceApproved () && this.isMgmtApproved()){
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.Completed.CodeValue);
				}
				else
				{
					if (this.isComplianceApproved ()){
						if (this.isMgmtRejected ()){
							if (srcOfChange == this.mgmtConfrm.attr.TaskConfirmStatus){
								Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.RejectedByMgmt.CodeValue);
								Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalValue(this.complConfrm.attr.TaskConfirmStatus, this.cnsApprStatus.ComplApprvlRejectedByMgmt.CodeValue);
							}
							else if (srcOfChange == this.complConfrm.attr.TaskConfirmStatus){
								Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingMgmt.CodeValue);					
							}
						}
						else { Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingMgmt.CodeValue); }
					}
					else
					{
						if (this.isComplianceRejected ()){
							if (srcOfChange == this.complConfrm.attr.TaskConfirmStatus){
								Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.RejectedByCompliance.CodeValue);
								Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalValue(this.userConfrm.attr.TaskConfirmStatus, this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance.CodeValue);
							}
							else if (srcOfChange == this.userConfrm.attr.TaskConfirmStatus){
								Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingCompliance.CodeValue);					
							}
						}
						else { Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingCompliance.CodeValue); }
					}			
				}
			}
			else { Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingAdvisor.CodeValue); }
		}
		
		//Flow Step: Adv-Compl
		else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.UsrCompl.CodeValue){
			//Chck for completed
			if(this.isUsrConfirmed() && this.isComplianceApproved () )
			{	
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.Completed.CodeValue);
			}
			else if(this.isUsrConfirmed() && !this.isComplianceApproved () )
			{
				if (this.isComplianceRejected ())
				{
						if (srcOfChange == this.complConfrm.attr.TaskConfirmStatus){
							Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.RejectedByCompliance.CodeValue);
							Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalValue(this.userConfrm.attr.TaskConfirmStatus, this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance.CodeValue);
						}
						else if (srcOfChange == this.userConfrm.attr.TaskConfirmStatus){
							Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingCompliance.CodeValue);					
						}
				}
				else
				{
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingCompliance.CodeValue);
				}
			}
			else
			{
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingAdvisor.CodeValue);
			}
		}

		//Flow Step: AdvOnly
		else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.AdvisorOnly.CodeValue){
			//Chck for completed
			if(this.isUsrConfirmed())
			{	
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.Completed.CodeValue);
			}
			else
			{
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingAdvisor.CodeValue);
			}
		}

		//Flow Step: ManagerOnly 2024-07-17
		else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.ManagerOnly.CodeValue){
			
			//Chck for completed
			if(this.isMgmtApproved())
			{
					//check if user confirmation was required at a given point in time
					if (this.isUsrManagerRejected())
					{
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.RejectedByAdvManager.CodeValue);
					}
					else
					{
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.Completed.CodeValue);
					}
					
					
			}
			else if (this.isMgmtRejected () && !this.isUsrConfirmed())
			{
					//changes somes from Mgmt Drop Down
					if (srcOfChange == this.mgmtConfrm.attr.TaskConfirmStatus){
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.RejectedByAdvManager.CodeValue);
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalValue(this.userConfrm.attr.TaskConfirmStatus, this.cnsUsrComfrmStatus.ConfrmRejectedByManager.CodeValue);
					}

					//changes comes from user drop down
					else if (srcOfChange == this.userConfrm.attr.TaskConfirmStatus){
							Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.RejectedByAdvManager.CodeValue);					
					}
					else
					{
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingMgmt.CodeValue);
					}

			}

			else if (this.isMgmtRejected () && this.isUsrConfirmed())
			{
					if (srcOfChange == this.userConfrm.attr.TaskConfirmStatus){
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingMgmt.CodeValue);
						//Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalValue(this.userConfrm.attr.TaskConfirmStatus, this.cnsUsrComfrmStatus.ConfrmRejectedByManager.CodeValue);
					}
					else if (srcOfChange == this.mgmtConfrm.attr.TaskConfirmStatus){
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.RejectedByAdvManager.CodeValue);
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalValue(this.userConfrm.attr.TaskConfirmStatus, this.cnsUsrComfrmStatus.ConfrmRejectedByManager.CodeValue);
					}
					else
					{
						Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingMgmt.CodeValue);
					}
			}



			else if (1==2)
			{
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingMgmt.CodeValue);
			}
			else 
			{
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.Draft.CodeValue);
			}
		}
		
		//Flow Step: Adv Draft - Compliance
		else if(this.flowTypeSelected.CodeValue == this.cnsflowTypes.AdvDraftCompl.CodeValue){
			
			//Chck for completed
			if(this.isUsrConfirmed() && this.isComplianceApproved () )
			{	
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.Completed.CodeValue);
			}
			
			else if(this.isUsrConfirmed() && !this.isComplianceApproved () )
			{
				if (this.isComplianceRejected ())
				{
						if (srcOfChange == this.complConfrm.attr.TaskConfirmStatus){
							Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.RejectedByCompliance.CodeValue);
							Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setApprovalValue(this.userConfrm.attr.TaskConfirmStatus, this.cnsUsrComfrmStatus.ConfrmRejectedByCompliance.CodeValue);
						}
						else if (srcOfChange == this.userConfrm.attr.TaskConfirmStatus){
							Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingCompliance.CodeValue);					
						}
				}
				else
				{
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.PendingCompliance.CodeValue);
				}
			}
			else
			{
				Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(this.cnsFlowStep.attrName, this.cnsFlowStep.Draft.CodeValue);
			}
		}

			console.log("Status Reason selected:" + this.flowStepSelected.NameValue);

			this.setTaskFlowFormState(this.userConfrm.section.Name);
			this.setTaskFlowFormState(this.complConfrm.section.Name);
			this.setTaskFlowFormState(this.mgmtConfrm.section.Name);

	},

	isComplianceApproved: function(){
			var bolIsApproved = false;
			var codeValue =  formContext.getAttribute(this.complConfrm.attr.TaskConfirmStatus).getValue();
			if(codeValue == this.cnsApprStatus.Approved.CodeValue){
				bolIsApproved = true;
			}
			return bolIsApproved;
	},

	isComplianceRejected: function(){
			var bolIsApproved = false;
			var codeValue =  formContext.getAttribute(this.complConfrm.attr.TaskConfirmStatus).getValue();
			if (codeValue !=null){
				if(codeValue == this.cnsApprStatus.Rejected.CodeValue){
					bolIsApproved = true;
				}
			}
			return bolIsApproved;
	},

	isMgmtApproved: function(){
			var bolIsApproved = false;
			var codeValue =  formContext.getAttribute(this.mgmtConfrm.attr.TaskConfirmStatus).getValue();

			if(codeValue == this.cnsApprStatus.Approved.CodeValue){
				bolIsApproved = true;
			}

			return bolIsApproved;
	},


	isMgmtRejected: function(){
			var bolIsApproved = false;
			var codeValue =  formContext.getAttribute(this.mgmtConfrm.attr.TaskConfirmStatus).getValue();

			if(codeValue == this.cnsApprStatus.Rejected.CodeValue){
				bolIsApproved = true;
			}

			return bolIsApproved;
	},

	isUsrConfirmed: function(){
			var bolIsApproved = false;
			var codeValue =  formContext.getAttribute(this.userConfrm.attr.TaskConfirmStatus).getValue();

			if(codeValue == this.cnsUsrComfrmStatus.Yes.CodeValue){
				bolIsApproved = true;
			}

			return bolIsApproved;
	},

	isUsrManagerRejected: function(){
			var bolIsApproved = false;
			var codeValue =  formContext.getAttribute(this.userConfrm.attr.TaskConfirmStatus).getValue();

			if(codeValue == this.cnsUsrComfrmStatus.ConfrmRejectedByManager.CodeValue){
				bolIsApproved = true;
			}

			return bolIsApproved;
	},

	isInFlowStepDraft: function(){
			var bolIsInDraftState = false;
			var codeValue =  formContext.getAttribute(this.cnsFlowStep.attrName).getValue();
			
			if(codeValue == this.cnsFlowStep.Draft.CodeValue){
				bolIsInDraftState = true;
			}

			return bolIsInDraftState;
	},


	//Update HERE IF NEW FLOW STEP
	initFlowStatusReason: function (){
		this.cnsFlowStep = {}
		this.cnsFlowStep.attrName = "nev_flowstep";

		//NEW 2024-08-21 MM:
		this.cnsFlowStep.Draft = {};
		this.cnsFlowStep.Draft.CodeValue = 279650010;
		this.cnsFlowStep.Draft.NameValue = "0_Draft";
		
		this.cnsFlowStep.PendingAdvisor = {};
		this.cnsFlowStep.PendingAdvisor.CodeValue = 279650000;
		this.cnsFlowStep.PendingAdvisor.NameValue = "1_Pending by Advisor";

		this.cnsFlowStep.PendingCompliance = {};
		this.cnsFlowStep.PendingCompliance.CodeValue = 279650001;
		this.cnsFlowStep.PendingCompliance.NameValue = "1_Pending by Compliance";

		this.cnsFlowStep.PendingMgmt = {};
		this.cnsFlowStep.PendingMgmt.CodeValue = 279650002;
		this.cnsFlowStep.PendingMgmt.NameValue = "1_Pending by Mgmt";

		this.cnsFlowStep.NotApplicable = {};
		this.cnsFlowStep.NotApplicable.CodeValue = 279650006;
		this.cnsFlowStep.NotApplicable.NameValue = "0_NA";

		this.cnsFlowStep.RejectedByCompliance = {};
		this.cnsFlowStep.RejectedByCompliance.CodeValue = 279650003;
		this.cnsFlowStep.RejectedByCompliance.NameValue = "1_Pending by Advisor (Compl. Rejected)";

		this.cnsFlowStep.RejectedByMgmt = {};
		this.cnsFlowStep.RejectedByMgmt.CodeValue = 279650004;
		this.cnsFlowStep.RejectedByMgmt.NameValue = "1_Pending by Compliance (Mgmt. Rejected)";


		//NEW 2024-07-17 MM: 
		this.cnsFlowStep.RejectedByAdvManager = {};
		this.cnsFlowStep.RejectedByAdvManager.CodeValue = 279650007;
		this.cnsFlowStep.RejectedByAdvManager.NameValue = "1_Pending by Advisor (Manager Rejected)";

		this.cnsFlowStep.Completed = {};
		this.cnsFlowStep.Completed.CodeValue = 279650005;
		this.cnsFlowStep.Completed.NameValue = "4_Completed";
	},
		setOnCreateStatus: function () {
		Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setDefaultControlState("ON_CREATE");
    }

	,setDefaultControlState: function (mode) {
		
		var bolSetHidden; 
		var bolSetDisabled;

		bolSetHidden = false;
		bolSetDisabled = false;

		if (mode == "ON_CREATE"){
			bolSetHidden = true;
			bolSetDisabled = true;

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_approvalflowtype", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_flowstep", bolSetDisabled);

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskinstruction", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskcomment", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmation", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmationdateofcontact", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmationcontactedby", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmitionstatus", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmedbyid", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_taskconfirmationdate", bolSetDisabled);

			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_complianceapprovalstatus", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_compliancereviewedbyid", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_compliancereviewdate", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_compliancecomment", bolSetDisabled);


			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_managementapprovalstatus", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_managementreviewedbyid", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_managementreviewdate", bolSetDisabled);
			Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setControlDisabled("nev_managementcomment", bolSetDisabled);
		}
		else if (mode == "ON_UPDATE"){
			//done via task init
		}
	},

	getInternalTaskTypeDetails: function(eid) {
		var lookupField = "";			
		var fetchActive =
			"<fetch mapping='logical'>" +
			"  <entity name='nev_internaltasktype'>" +
			"   <attribute name='nev_internaltasktypeid' />" +
			"	<attribute name='createdon' />" +
			"	<attribute name='nev_name' />" +
			"	<attribute name='nev_taskinstruction' />" +
			"	<attribute name='nev_taskconfirmation' />" +
			"	<attribute name='nev_taskcomment' />" +
			"	<attribute name='nev_rmconfirmationrequired' />" +
			"	<attribute name='nev_managementapprovalrequired' />" +
			"	<attribute name='nev_internaltasktypecodename' />" +
			"	<attribute name='nev_complianceapprovalrequired' />" +
			"	<attribute name='nev_approvalflowtype' />" +
			"	<filter type='and'>" +
			"	  <condition attribute='statecode' operator='eq' value='0' />" +
			"	  <condition attribute='nev_internaltasktypeid' operator='eq' value='" + eid + "' />" +
			"   </filter>" +
			"  </entity>" +
			"</fetch>";
		var retrievedInternalTaskTypeDetails = XrmServiceToolkit.Soap.Fetch(fetchActive);
		return retrievedInternalTaskTypeDetails;
	},


	onChangeInternalTaskType: function ()
	{
		var eid = '{687CBB46-DD7D-ED11-8157-005056010617}';
		if (formContext.getAttribute("nev_internaltasktype").getValue() !==null){
			var lkpInternalTaskType = formContext.getAttribute("nev_internaltasktype").getValue()[0];		
			eid = lkpInternalTaskType.id;
		    Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setOnChangeInternalTaskType(eid);
		}
	},

	setOnChangeInternalTaskType:  function(eid) {
		var valueToSet = null;
		var retrievedKycApprovals = Ambit.MAH.WRM2013.JS.InternalTasksFunctions.getInternalTaskTypeDetails(eid);
		if(retrievedKycApprovals != null){

			if(formContext.getAttribute("nev_taskcomment")!=null){
				valueToSet = null;
				if(retrievedKycApprovals[0].attributes["nev_taskcomment"] != null){
					valueToSet = retrievedKycApprovals[0].attributes["nev_taskcomment"].value;
					formContext.getAttribute("nev_taskcomment").setValue(valueToSet);
				}
				formContext.getAttribute("nev_taskcomment").setValue(valueToSet);	
			}

			if(formContext.getAttribute("nev_taskinstruction")!=null){

				//check to see if there was a result for the attribute
				valueToSet = null;
				if(retrievedKycApprovals[0].attributes["nev_taskinstruction"] != null){
					valueToSet = retrievedKycApprovals[0].attributes["nev_taskinstruction"].value;
				}
				formContext.getAttribute("nev_taskinstruction").setValue(valueToSet);	
			}


			if(formContext.getAttribute("nev_taskconfirmation")!=null){
				
				//check to see if there was a result for the attribute
				valueToSet = null;
				if(retrievedKycApprovals[0].attributes["nev_taskconfirmation"] != null){
					valueToSet = retrievedKycApprovals[0].attributes["nev_taskconfirmation"].value;
				}
				formContext.getAttribute("nev_taskconfirmation").setValue(valueToSet);	
			}

			//check for approval flow type
			if(formContext.getAttribute("nev_approvalflowtype")!=null){
				valueToSet = null;
				if(retrievedKycApprovals[0].attributes["nev_approvalflowtype"] != null){
					valueToSet = retrievedKycApprovals[0].attributes["nev_approvalflowtype"].value;
					 formContext.getAttribute("nev_approvalflowtype").setValue(valueToSet);	
					
					//TODO: Check why this doesnt work here
					//Set to pending advisor
					//Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(flow1.cnsFlowStep.attrName, flow1.cnsFlowStep.PendingAdvisor.CodeValue);
					flow1.updateProcessStepByFlowType("");
				}
				else{
					formContext.getAttribute("nev_approvalflowtype").setValue(valueToSet);
					
					//TODO: Check why this doesnt work here
					//set to NA
					Ambit.MAH.WRM2013.JS.InternalTasksFunctions.setFlowStepValue(flow1.cnsFlowStep.attrName, flow1.cnsFlowStep.NotApplicable.CodeValue);
					formContext.getAttribute(flow1.flowTypeAttrName).setValue(flow1.cnsflowTypes.NotRequired.CodeValue); 
				}
			}
		}
	},
};