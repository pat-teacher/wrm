// Portfolio.entity.ts
export const ACCOUNT = {
    entity: "wrmb_portfolio",
    fields: {
        pk: "wrmb_portfolioid",
        ambcust_locationid: "ambcust_locationid",
        ambcust_accountstatusreason: "ambcust_accountstatusreason",
    },
    options: {
        IN_OPENING: 858090001
    },
} as const;
