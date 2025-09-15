// PortfolioRelationship.entity.ts
export const PORTFOLIORELATIONSHIP = {
    entity: "wrmb_portfoliorelationship",
    fields: {
        portfolioId: "wrmb_portfolioid",
        contactId: "wrmb_contactid",
        companyId: "wrmb_companyid",
        typeId: "wrmb_portfoliorelationshiptypeid",
    },
} as const;
