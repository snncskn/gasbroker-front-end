export interface Proposal
{
    id: string;
    company_id?: string;
    name?: string;
    type?:string;
    registered_date?: string | null;
}

export interface ProposalOffer{
    id:string;
    proposal_id:string;
    offer_date:string;
    payment_type:string;
    price:string;
    deal_status:string;
}
