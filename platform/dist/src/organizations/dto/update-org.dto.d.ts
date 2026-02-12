declare enum OrgStatus {
    ACTIVE = "ACTIVE",
    PROVISIONING = "PROVISIONING",
    SUSPENDED = "SUSPENDED",
    ARCHIVED = "ARCHIVED"
}
export declare class UpdateOrgDto {
    name?: string;
    apiUrl?: string;
    frontendUrl?: string;
    adminEmail?: string;
    adminName?: string;
    allowedEmailDomains?: string[];
    authProviders?: string[];
    colorPrimary?: string;
    logoUrl?: string;
    notes?: string;
}
export declare class UpdateOrgStatusDto {
    status: OrgStatus;
}
export {};
