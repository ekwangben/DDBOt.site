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
    barrier?: number | string;
    barrier2?: number | string;
    selectedDigit?: number;
    multiplier?: number;
    limitOrder?: {
        take_profit?: number;
        stop_loss?: number;
    };
    growth_rate?: number;
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
    maxTicks?: number;
    maxPayout?: number;
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
            return null;
        }

        const requestId = ++requestCounterRef.current;
        const isAccu = params.contractType === 'ACCU';

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const proposalRequest: any = {
                proposal: 1,
                amount: params.amount,
                contract_type: params.contractType,
                currency: params.currency,
                symbol: params.symbol,
                // Basis should not be sent for Accumulators
                ...(!isAccu && { basis: 'stake' }),
                ...(params.duration && { duration: params.duration }),
                ...(params.durationUnit && { duration_unit: params.durationUnit }),
                ...(params.barrier && { barrier: params.barrier.toString() }),
                ...(params.barrier2 && { barrier2: params.barrier2.toString() }),
                ...(params.selectedDigit !== undefined && { barrier: params.selectedDigit.toString() }),
                ...(params.limitOrder && { limit_order: params.limitOrder }),
                ...(params.multiplier && { multiplier: params.multiplier }),
                ...(params.growth_rate && { growth_rate: params.growth_rate }),
            };

            // Debug log to confirm parameters
            console.log(`[useProposal] Requesting ${params.contractType} for ${params.symbol}:`, proposalRequest);

            const response = await api_base.api!.send(proposalRequest);

            // Check if this is still the latest request
            if (requestId !== requestCounterRef.current) {
                return null;
            }

            if (response.error) {
                console.error('[useProposal] Response Error:', response.error);
                throw new Error(response.error.message || 'Proposal failed');
            }

            console.log('[useProposal] Response Success:', response.proposal);

            const limitatory = response.proposal.limitatory || {};
            const proposalData: ProposalData = {
                id: response.proposal.id,
                askPrice: response.proposal.ask_price,
                payout: response.proposal.payout,
                longcode: response.proposal.longcode,
                spot: response.proposal.spot,
                spotTime: response.proposal.spot_time,
                startDate: response.proposal.date_start,
                expiryDate: response.proposal.expiry_date,
                // Accumulators specific data
                maxTicks: limitatory.last_tick !== undefined ? limitatory.last_tick : limitatory.max_ticks,
                maxPayout: limitatory.payout !== undefined ? limitatory.payout : limitatory.max_payout,
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

            return null;
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
