export const SOURCEOFFUNDEVENT = {
    entity: "mhwrmb_sourceoffundevent",
    fields: {
        pk: "mhwrmb_sourceoffundeventid",
        contactid: "mhwrmb_contactid",
        accountid: "mhwrmb_accountid",
        ownerid: "ownerid",
        compliancecomment: "mhwrmb_compliancecomment",
        compliancestatus: "mhwrmb_compliancestatus",
        name: "mhwrmb_name",
        softype: "mhwrmb_softype",
        periodstart: "mhwrmb_periodstart",
        periodend: "mhwrmb_periodend",
        estamount_usd_period: "mhwrmb_estamount_usd_period",
        estamount_usd_pa: "mhwrmb_estamount_usd_pa",
        shortdescription: "mhwrmb_shortdescription",
        supportingdoc: "mhwrmb_supportingdoc",
    },
    options: {        
        compliancestatus: {            
            PENDING: 560850000,            
            APPROVED: 560850002,
            REJECTED: 560850003
        }
    },
    tabs: {
        GENERAL: "general_tab"
    },
    sections: {
        GENERAL_INFORMATION_SECTION: "general_information_section",
        WEALTH_INFORMATION_SECTION: "wealth_information_section",
        COMPLIANCE_SECTION: "compliance_section",
    },
} as const;