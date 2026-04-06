import { useCallback, useEffect, useRef, useState } from 'react';
import { api_base } from '@/external/bot-skeleton';

/**
 * Hook for fetching proposal data from Deriv API
 * Returns proposal details without executing the buy
 */
export interface ProposalParams {
    symbol: string;
    contractType: string;
    amount: number;
    currency: string;
    duration?: number;
    durationUnit?: string;
    barrier?: string;
    selectedDigit?: number;
}

export interface ProposalData {
    id: string;
    askPrice: number;
    payout: number;
    longcode: string;
    spot: string;
    spotTime: number;
    startDate: string;
    expiryDate: string;
}

export interface ProposalState {
    isLoading: boolean;
    error: string | null;
    proposal: ProposalData | null;
}

export const useProposal = () => {
    const [state, setState] = useState<ProposalState>({
        isLoading: false,
        error: null,
        proposal: null,
    });

    const isMountedRef = useRef(true);
    const requestCounterRef = useRef(0);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Request proposal from Deriv API
     */
    const requestProposal = useCallback(async (params: ProposalParams): Promise<ProposalData | null> => {
        if (!api_base.api) {
            const error = 'API not initialized';
            setState(prev => ({ ...prev, error }));
            throw new Error(error);
        }

        const requestId = ++requestCounterRef.current;

        setState(prev => ({ ...prev, isLoading: true, error: null, proposal: null }));

        try {
            const proposalRequest: any = {
                proposal: 1,
                amount: params.amount,
                basis: 'stake',
                contract_type: params.contractType,
                currency: params.currency,
                symbol: params.symbol,
                ...(params.duration && { duration: params.duration }),
                ...(params.durationUnit && { duration_unit: params.durationUnit }),
                ...(params.barrier && { barrier: params.barrier }),
                ...(params.selectedDigit !== undefined && { selected_tick: params.selectedDigit }),
            };

            const response = await api_base.api!.send(proposalRequest);

            // Check if this is still the latest request
            if (requestId !== requestCounterRef.current) {
                return null;
            }

            if (response.error) {
                throw new Error(response.error.message || 'Proposal failed');
            }

            const proposalData: ProposalData = {
                id: response.proposal.id,
                askPrice: response.proposal.ask_price,
                payout: response.proposal.payout,
                longcode: response.proposal.longcode,
                spot: response.proposal.spot,
                spotTime: response.proposal.spot_time,
                startDate: response.proposal.date_start,
                expiryDate: response.proposal.expiry_date,
            };

            if (isMountedRef.current) {
                setState({
                    isLoading: false,
                    error: null,
                    proposal: proposalData,
                });
            }

            return proposalData;
        } catch (error: any) {
            if (requestId !== requestCounterRef.current) {
                return null;
            }

            const errorMessage = error?.message || error?.code || 'Failed to get proposal';

            if (isMountedRef.current) {
                setState({
                    isLoading: false,
                    error: errorMessage,
                    proposal: null,
                });
            }

            throw error;
        }
    }, []);

    /**
     * Clear proposal state
     */
    const clearProposal = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            proposal: null,
        });
    }, []);

    return {
        ...state,
        requestProposal,
        clearProposal,
        isAuthorized: api_base.is_authorized,
        apiInitialized: !!api_base.api,
    };
};
