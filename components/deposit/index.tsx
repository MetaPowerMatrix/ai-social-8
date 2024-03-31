import React from 'react';
import {
	Button, Divider,
	Form,
	Input, InputNumber,
} from 'antd';
import {useTranslations} from "next-intl";
import styles from "./Deposit.module.css"
import commandDataContainer from "@/container/command";
import Web3 from 'web3';
import Image from "next/image";
import {recipientAddress, tokenAbi, tokenContractAddress} from "@/common";

interface DepositProps {
	visible: boolean;
	id: string,
	onClose: ()=>void;
	mobile: boolean;
}

declare global {
	interface Window {
		ethereum: any;
	}
}

const Deposit: React.FC<DepositProps> = ({visible, id, onClose, mobile}) => {
	const t = useTranslations('ISSForm');
	const [form] = Form.useForm();
	const [formDonation] = Form.useForm();
	const [formDao] = Form.useForm();
	const command = commandDataContainer.useContainer()

	const transferToken = async (id: string, amount: number) => {
		const web3 = new Web3(window.ethereum)
		const accounts = await web3.eth.getAccounts();
		const myAddress = accounts[0];

		// The number of token decimals
		const decimals = 6; // This varies between tokens, ensure to set the correct value

		const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress, {from: myAddress});
		// const amountInWei = web3.utils.toWei(amount, 'ether');
		const value = amount * (10 ** decimals); // Adjust amount by token's decimals
		console.log("send token:", value)
		tokenContract.methods.transfer(recipientAddress, value).send({from: myAddress})
			.on('transactionHash', function(hash){
				console.log(`Transaction hash: ${hash}`);
			})
			.on('receipt', function(receipt){
				console.log('Transaction was confirmed.');
				command.stake_metapower(id, amount, true).then((res) => {
					console.log(res)
				})
				alert("stake成功")
			})
			.on('error', console.error); // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
	};

	async function invokeSmartContractMethod() {
		const web3 = new Web3(window.ethereum)
			const contractABI: any[] = [
				// Your contract ABI goes here
			];
			const contractAddress = '0xYourContractAddressHere';
			const contract = new web3.eth.Contract(contractABI, contractAddress);
			const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
			const account = accounts[0]; // Using the first account

			// contract.methods.methodName('arg1', 'arg2', ...).send({ from: account })
			// 	.on('transactionHash', (hash) => {
			// 		console.log('Transaction hash:', hash);
			// 	})
			// 	.on('receipt', (receipt) => {
			// 		console.log('Transaction confirmed:', receipt);
			// 	})
			// 	.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
	}

	async function sendBNB(recipient: string, amount: string, is_donation: boolean) {
		const web3 = new Web3(window.ethereum)
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			const sender = accounts[0]; // The first account is usually the current account
			const amountInWei = web3.utils.toWei(amount, 'ether');
			console.log("amountInWei", amountInWei)
			// Send transaction
			web3.eth.sendTransaction({
				from: sender,
				to: '0xd951AA2182A55aEeE6D32b1be11ebAEe61Cb2623',
				value: amountInWei,
				gas: 21000,
			})
				.on('transactionHash', function(hash){
					console.log('Transaction hash:', hash);
				})
				.on('receipt', function(receipt){
					console.log('Transaction confirmed:', receipt);
					command.deposit_metapower(id, parseFloat(amount), is_donation).then((res) => {
						console.log(res)
					})
					if (is_donation){
						alert(t("donated"))
					}else{
						alert(t('deposited'))
					}
					onClose()
				})
				.on('error', function (error){
					// alert(error.data.message)
					console.error
				}); // If a out of gas error, the second parameter is the receipt.
	}

	async function connectToBsc() {
		const web3 = new Web3(window.ethereum)
		await window.ethereum.request({ method: 'eth_requestAccounts' });
		try {
			await window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: '0x38' }], // 0x38 is the hexadecimal representation of 56
			});
		} catch (error: any) {
			if (error.code === 4902) {
				await window.ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [
						{
							chainId: '0x38',
							chainName: 'Binance Smart Chain Mainnet',
							nativeCurrency: { name: 'BNB', decimals: 18, symbol: 'BNB' },
							rpcUrls: ['https://bsc-dataseed.binance.org/'],
							blockExplorerUrls: ['https://bscscan.com/'],
						},
					],
				});
			}
		}

		const accounts = await web3.eth.getAccounts();
		for(var account of accounts)  {
			const balance = await web3.eth.getBalance(account);
			console.log(account, ":", balance);
		}

		return web3
	}

	const deposit = (id: string, amount: string, is_donation:boolean) => {
		sendBNB(id, amount, is_donation).then((res) => {
			console.log(res)
		})
	}

	const handleSubmit = (values: any) => {
		console.log(values);
		if (values.amount === ""){
			alert(t("requireAmount"))
		}
		deposit(id, values.amount, false)
	};
	const handleSubmitDAO = (values: any) => {
		console.log(values);
		if (values.DAOAmount === 0 || values.DAOAmount === undefined){
			alert(t("requireAmount"))
		}
		transferToken(id, values.DAOAmount).then(()=>{})
	};
	const handleSubmitDonation = (values: any) => {
		console.log(values);
		if (values.DonationAmount === ""){
			alert(t("requireAmount"))
		}
		deposit(id, values.DonationAmount, true)
	};

	return (
		<div hidden={!visible} className={styles.call_form_container}>
			<div className={mobile ? styles.call_form_content_mobile : styles.call_form_content}>
				<Button onClick={connectToBsc} style={{marginLeft:50}}>
					{t("connectMM")}
				</Button>
				<Button onClick={onClose} style={{marginLeft:50}}>
					{t("close")}
				</Button>
				<Divider type={"horizontal"}/>
				<h5 style={{display: 'inline-block'}}>{t("tips3")}</h5>
				<Form layout="inline" form={form} variant="filled" onFinish={handleSubmit}>
					<Form.Item label={t("amount")} name="amount" rules={[{required: true, message: t('must')}]}>
						<Input/>
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit">
							{t("deposit")}
						</Button>
						<Divider type={"vertical"}/>
					</Form.Item>
				</Form>
				<Divider type={"horizontal"}/>
				<div>
					<h5 style={{display: 'inline-block'}}>{t("donationTips")}</h5>
				</div>
				<Form layout="inline" form={formDonation} variant="filled" onFinish={handleSubmitDonation}>
					<Form.Item label={t("DonationAmount")} name="DonationAmount" rules={[{required: true, message: t('must')}]}>
						<Input/>
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" >
							{t("donation")}
						</Button>
					</Form.Item>
				</Form>
				<Divider type={"horizontal"}/>
				<div>
					<h5 style={{display: 'inline-block'}}>{t("daoTips")}</h5>
				</div>
				<Form layout="inline" form={formDao} variant="filled" onFinish={handleSubmitDAO}>
					<Form.Item initialValue={100000} label={t("DAOAmount")} name="DAOAmount" rules={[{required: true, message: t('must')}]}>
						<InputNumber style={{width: 300}} />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit">
							{t("dao")}
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	)
		;
}

export default Deposit;
