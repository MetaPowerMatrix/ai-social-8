import React from 'react';
import {
	Button, Divider,
	Form,
	Input,
} from 'antd';
import {useTranslations} from "next-intl";
import styles from "./Deposit.module.css"
import commandDataContainer from "@/container/command";
import Web3 from 'web3';
import Image from "next/image";
import utilStyles from "@/styles/utils.module.css";

interface DepositProps {
	visible: boolean;
	id: string,
	onClose: ()=>void;
}

declare global {
	interface Window {
		ethereum: any;
	}
}

const Deposit: React.FC<DepositProps> = ({visible, id, onClose}) => {
	const t = useTranslations('ISSForm');
	const [form] = Form.useForm();
	const command = commandDataContainer.useContainer()

	async function invokeSmartContractMethod() {
		const web3 = new Web3(window.ethereum);
		const contractABI: any[] = [
			// Your contract ABI goes here
		];
		const contractAddress = '0xYourContractAddressHere';
		const contract = new web3.eth.Contract(contractABI, contractAddress);
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
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

	async function sendBNB(recipient: string, amount: string) {
		const web3 = new Web3(window.ethereum);
		// Request account access if needed
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		const sender = accounts[0]; // The first account is usually the current account

		// Convert amount to Wei
		const amountInWei = web3.utils.toWei(amount, 'ether');

		// Send transaction
		web3.eth.sendTransaction({
			from: sender,
			to: recipient,
			value: amountInWei
		})
			.on('transactionHash', function(hash){
				console.log('Transaction hash:', hash);
			})
			.on('receipt', function(receipt){
				console.log('Transaction confirmed:', receipt);
				command.deposit_metapower(id, parseFloat(amount)).then((res) => {
					console.log(res)
				})
			})
			.on('error', console.error); // If a out of gas error, the second parameter is the receipt.
	}

	async function connectToBsc() {
		const web3 = new Web3(window.ethereum);

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
		const account = accounts[0];
		console.log(accounts)

		const balance = await web3.eth.getBalance(account);
		console.log(balance);
	}

	const deposit = (id: string, amount: string) => {
		sendBNB(id, amount).then((res) => {
			console.log(res)
		})
	}

	const handleSubmit = (values: any) => {
		console.log(values);
		if (values.amount === ""){
			alert(t("requireAmount"))
		}
		deposit(id, values.amount)
	};
	const handleSubmitDAO = (values: any) => {
		console.log(values);
		if (values.amount === ""){
			alert(t("requireAmount"))
		}
		deposit(id, values.amount)
	};
	const handleSubmitDonation = (values: any) => {
		console.log(values);
		if (values.amount === ""){
			alert(t("requireAmount"))
		}
		deposit(id, values.amount)
	};

	return (
		<div hidden={!visible} className={styles.call_form_container}>
			<div className={styles.call_form_content}>
				<h5 style={{display: 'inline-block'}}>{t("stakeTips")}</h5>
				<Button onClick={connectToBsc} style={{marginLeft:50}}>
					{t("connectMM")}
				</Button>
				<Button onClick={onClose} style={{marginLeft:50}}>
					{t("close")}
				</Button>
				<div>
					<Image priority src="/images/pab.jpg" height={12} width={12} style={{display: 'inline-block', marginRight: 10}} alt={"pab"}/>
					<h5 style={{display: 'inline-block'}}>{t("tips3")}</h5>
				</div>
				<Form layout="inline" form={form} variant="filled" onFinish={handleSubmit}>
					<Form.Item label={t("amount")} name="amount" rules={[{required: true, message: '必填项'}]}>
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
					<Image priority src="/images/pab.jpg" height={12} width={12}
					       style={{display: 'inline-block', marginRight: 10}} alt={"pab"}/>
					<h5 style={{display: 'inline-block'}}>{t("donationTips")}</h5>
				</div>
				<Form layout="inline" form={form} variant="filled" onFinish={handleSubmitDonation}>
					<Form.Item label={t("DonationAmount")} name="DonationAmount" rules={[{required: true, message: '必填项'}]}>
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
					<Image priority src="/images/pab.jpg" height={12} width={12}
					       style={{display: 'inline-block', marginRight: 10}} alt={"pab"}/>
					<h5 style={{display: 'inline-block'}}>{t("daoTips")}</h5>
				</div>
				<Form layout="inline" form={form} variant="filled" onFinish={handleSubmitDAO}>
					<Form.Item label={t("DAOAmount")} name="DAOAmount" rules={[{required: true, message: '必填项'}]}>
						<Input/>
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
