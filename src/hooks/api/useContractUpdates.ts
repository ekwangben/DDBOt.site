import { useCallback,useEffect, useRef, useState } from 'react';
import { api_base } from '@/external/bot-skeleton';
import { ProposalOpenContract } from '@deriv/api-types';

/**
 * Hook for subscribing to open contract updates
 * Monitors active positions in real-time
 */
export const useContractUpdates = () => {
    const [contracts, setContracts] = useState<ProposalOpenContract[]>([]);
    const subscriptionIdRef = useRef<string | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Subscribe to all open contract updates
     */
    const subscribeToContracts = useCallback(async () => {
        if (!api_base.api) {
            console.warn('[ContractUpdates] API not initialized');
            return;
        }

        try {
            // Forget previous subscription
            if (subscriptionIdRef.current) {
                await api_base.api.forget(subscriptionIdRef.current);
                subscriptionIdRef.current = null;
            }

            const response = await api_base.api.send({
                proposal_open_contract: 1,
                subscribe: 1,
            });

            if (response.error) {
                console.error('[ContractUpdates] Subscription error:', response.error.message);
                return;
            }

            if (response.subscription) {
                subscriptionIdRef.current = response.subscription.id;
            }

            if (response.proposal_open_contract) {
                const contract = response.proposal_open_contract;

                if (isMountedRef.current) {
                    setContracts(prev => {
                        // Update existing contract or add new one
                        const existingIndex = prev.findIndex(c => c.contract_id === contract.contract_id);
                        if (existingIndex >= 0) {
                            const updated = [...prev];
                            updated[existingIndex] = contract;
                            return updated;
                        }
                        return [...prev, contract];
                    });
                }
            }

            // Subscribe to future updates
            api_base.api.onMessage().subscribe(({ data }: { data: any }) => {
                if (data.msg_type === 'proposal_open_contract' && data.proposal_open_contract) {
                    const contract = data.proposal_open_contract;

                    if (isMountedRef.current) {
                        setContracts(prev => {
                            const existingIndex = prev.findIndex(c => c.contract_id === contract.contract_id);
                            if (existingIndex >= 0) {
                                const updated = [...prev];
                                updated[existingIndex] = contract;
                                return updated;
                            }
                            return [...prev, contract];
                        });
                    }
                }
            });
        } catch (error) {
            console.error('[ContractUpdates] Failed to subscribe:', error);
        }
    }, []);

    /**
     * Unsubscribe from contract updates
     */
    const unsubscribe = useCallback(async () => {
        if (subscriptionIdRef.current && api_base.api) {
            await api_base.api.forget(subscriptionIdRef.current);
            subscriptionIdRef.current = null;
        }
        setContracts([]);
    }, []);

    /**
     * Get only active (non-sold, non-expired) contracts
     */
    const activeContracts = contracts.filter(c => c.is_valid && !c.is_sold && c.status === 'open');

    return {
        contracts,
        activeContracts,
        subscribeToContracts,
        unsubscribe,
    };
};
