// PortfolioRelationshipType.entity.ts
export const PORTFOLIORELATIONSHIPTYPE = {
    entity: "wrmb_portfoliorelationshiptype",
    fields: {
        pk: "wrmb_portfoliorelationshiptypeid",
        name: "wrmb_name",
    },
    options: {
        NAME_PRINCIPAL: "Principal",
    },
} as const;
