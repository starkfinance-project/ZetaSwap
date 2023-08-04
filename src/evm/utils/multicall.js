import { getMulticallContract } from '..//hooks/useContract';

export function parseCallKey(callKey) {
    const pcs = callKey.split('-');
    if (pcs.length !== 2) {
        throw new Error(`Invalid call key: ${callKey}`);
    }
    return {
        address: pcs[0],
        callData: pcs[1],
    };
}

export const getSingleContractMultipleData = async (library, contract, methodName, callInputs) => {
    try {
        if (!contract?.interface) return undefined;
        const fragment = contract.interface?.getFunction(methodName);
        const calls =
            contract && fragment && callInputs && callInputs.length > 0
                ? callInputs.map((inputs) => {
                      return {
                          address: contract.address,
                          callData: contract.interface.encodeFunctionData(fragment, inputs),
                      };
                  })
                : [];
        const multicallContract = await getMulticallContract(library);
        const chunks = await fetchChunk(multicallContract, calls);
        const { results } = chunks;
        return results.map((result) => contract.interface?.decodeFunctionResult(methodName, result));
    } catch (error) {
        throw error;
    }
};

export const getMultipleContractMultipleData = async (library, contracts, methodName, callInputs) => {
    try {
        if (contracts.length != callInputs.length) return;
        const calls = contracts.map((contract, i) => {
            if (!contract?.interface) return undefined;
            const fragment = contract.interface.getFunction(methodName);
            return {
                address: contract.address,
                callData: contract.interface.encodeFunctionData(fragment, callInputs[i]),
            };
        });
        const multicallContract = await getMulticallContract(library);
        const chunks = await fetchChunk(multicallContract, calls);
        const { results } = chunks;
        return results.map((result, i) => {
            try {
                return contracts[i]?.interface?.decodeFunctionResult(methodName, result);
            } catch (error) {
                return undefined;
            }
        });
    } catch (error) {
        throw error;
    }
};

export const getSingleContractMultipleDataMultipleMethods = async (library, contract, methodNames, callInputs) => {
    try {
        if (methodNames.length != callInputs.length) return;
        const calls = methodNames.map((methodName, i) => {
            if (!contract?.interface) return undefined;
            const fragment = contract.interface.getFunction(methodName);
            return {
                address: contract.address,
                callData: contract.interface.encodeFunctionData(fragment, callInputs[i]),
            };
        });
        const multicallContract = await getMulticallContract(library);
        const chunks = await fetchChunk(multicallContract, calls);
        const { results } = chunks;
        return results.map((result, i) => contract.interface?.decodeFunctionResult(methodNames[i], result));
    } catch (error) {
        throw error;
    }
};

export const getMultipleContractMultipleDataMultipleMethods = async (library, contracts, methodNames, callInputs) => {
    try {
        return Promise.all(
            contracts.map(async (contract, i) => {
                if (!contract?.interface) return undefined;
                const fragment = contract.interface.getFunction(methodNames[i]);
                const calls =
                    contract && fragment && callInputs && callInputs.length > 0
                        ? callInputs.map((inputs) => {
                              return {
                                  address: contract.address,
                                  callData: contract.interface.encodeFunctionData(fragment, inputs),
                              };
                          })
                        : [];
                const multicallContract = await getMulticallContract(library);
                const chunks = await fetchChunk(multicallContract, calls);
                const { results } = chunks;
                return results.map((result) => contract.interface?.decodeFunctionResult(methodNames[i], result));
            }),
        );
    } catch (error) {
        throw error;
    }
};

// chunk calls so we do not exceed the gas limit
const CALL_CHUNK_SIZE = 500;

/**
 * Fetches a chunk of calls, enforcing a minimum block number constraint
 * @param multicallContract multicall contract to fetch against
 * @param chunk chunk of calls to make
 * @param minBlockNumber minimum block number of the result set
 */
async function fetchChunk(multicallContract, chunk, minBlockNumber = undefined, account = undefined) {
    let resultsBlockNumber, returnData;

    try {
        [resultsBlockNumber, returnData] =
            account && multicallContract.signer
                ? await multicallContract.aggregate(chunk.map((obj) => [obj.address, obj.callData]))
                : await multicallContract.callStatic.aggregate(chunk.map((obj) => [obj.address, obj.callData]));
    } catch (error) {
        throw error;
    }
    if (minBlockNumber && resultsBlockNumber.toNumber() < minBlockNumber) {
        throw new Error('Fetched for old block number');
    }
    return { results: returnData, blockNumber: resultsBlockNumber.toNumber() };
}
