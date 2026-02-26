const getGasAmountForContractCall = async (fromAddress, toAddress, amount, contractAddress) => {
    const contract = new web3.eth.Contract(ABI, contractAddress);
    gasAmount = await contract.methods.transfer(toAddress, Web3.utils.toWei(`${amount}`)).estimateGas({ from: fromAddress });
    return gasAmount
}

getGasAmountForContractCall(data.formaddr, data.toddr, data.amount, data.abiarray,data.contract);