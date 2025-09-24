export const SOURCEOFFUNDEVENT = {
    entity: "mhwrmb_sourceoffundevent",
    fields: {
        pk: "mhwrmb_sourceoffundeventid",
        contactid: "mhwrmb_contactid",
        ownerid: "ownerid",
        compliancecomment: "mhwrmb_compliancecomment",
        compliancestatus: "mhwrmb_compliancestatus",
    },
    options: {        
        compliancestatus: {            
            PENDING: 560850000,            
            APPROVED: 560850002,
            REJECTED: 560850003
        }
    },
} as const;