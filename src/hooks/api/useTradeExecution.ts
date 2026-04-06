import { useCallback, useRef,useState } from 'react';
import { api_base } from '@/external/bot-skeleton';

export interface TradeParams {
    symbol: string;
    contractType: string;
    amount: number;
    currency: string;
    duration?: number;
    durationUnit?: string;
    growthRate?: number; // For accumulator contracts
    basis?: 'stake' | 'payout';
}

export interface TradeResult {
    transactionId: string;
    contractId: string;
    buyPrice: number;
    longcode: string;
}

export interface TradeState {
    isLoading: boolean;
    error: string | null;
    lastTrade: TradeResult | null;
}

/**
 * Hook for executing trades via Deriv API
 * Provides buy functionality with proper proposal handling
 */
export const useTradeExecution = () => {
    const [state, setState] = useState<TradeState>({
        isLoading: false,
        error: null,
        lastTrade: null,
    });

    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useState(() => {
        return () => {
            isMountedRef.current = false;
        };
    });

    /**
     * Send API request with retry logic
     */
    const sendWithRetry = async (request: any, retries = 3): Promise<any> => {
        try {
            const response = await api_base.api!.send(request);
            return response;
        } catch (error: any) {
            if (retries > 0 && (error.code === 'RateLimit' || error.code === 'ServiceUnavailable')) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return sendWithRetry(request, retries - 1);
            }
            throw error;
        }
    };

    /**
     * Buy contract using Deriv API
     * Uses two-step process: proposal → purchase
     */
    const buy = useCallback(async (params: TradeParams): Promise<TradeResult | null> => {
        if (!api_base.api) {
            const error = 'API not initialized';
            setState(prev => ({ ...prev, error }));
            throw new Error(error);
        }

        if (!api_base.is_authorized) {
            const error = 'Not authorized. Please log in first.';
            setState(prev => ({ ...prev, error }));
            throw new Error(error);
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Step 1: Request proposal
            const proposalRequest: any = {
                proposal: 1,
                amount: params.amount,
                basis: params.basis || 'stake',
                contract_type: params.contractType,
                currency: params.currency,
                symbol: params.symbol,
                ...(params.duration && { duration: params.duration }),
                ...(params.durationUnit && { duration_unit: params.durationUnit }),
                ...(params.growthRate && { growth_rate: params.growthRate }),
            };

            const proposalResponse = await sendWithRetry(proposalRequest);

            if (proposalResponse.error) {
                throw new Error(proposalResponse.error.message || 'Proposal failed');
            }

            const { id: proposalId, ask_price: askPrice } = proposalResponse.proposal;

            // Step 2: Buy the contract
            const buyRequest = {
                buy: proposalId,
                price: askPrice,
            };

            const buyResponse = await sendWithRetry(buyRequest);

            if (buyResponse.error) {
                throw new Error(buyResponse.error.message || 'Buy failed');
            }

            const { buy } = buyResponse;
            const tradeResult: TradeResult = {
                transactionId: buy.transaction_id,
                contractId: buy.contract_id,
                buyPrice: buy.buy_price,
                longcode: buy.longcode,
            };

            if (isMountedRef.current) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    lastTrade: tradeResult,
                }));
            }

            return tradeResult;
        } catch (error: any) {
            const errorMessage = error?.message || error?.code || 'Trade execution failed';

            if (isMountedRef.current) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));
            }

            throw error;
        }
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    /**
     * Clear last trade result
     */
    const clearLastTrade = useCallback(() => {
        setState(prev => ({ ...prev, lastTrade: null }));
    }, []);

    return {
        ...state,
        buy,
        clearError,
        clearLastTrade,
        isAuthorized: api_base.is_authorized,
        apiInitialized: !!api_base.api,
    };
};
