export declare class CreateOrgDto {
    name: string;
    slug: string;
    apiUrl?: string;
    frontendUrl?: string;
    adminEmail: string;
    adminName?: string;
    allowedEmailDomains?: string[];
    authProviders?: string[];
    colorPrimary?: string;
    logoUrl?: string;
    notes?: string;
}
