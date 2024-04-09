import React from 'react';
import styles from "@/components/Subscriptions/SubscriptionsComponent.module.css";
import {Button, Col, Divider, Modal, Popover, Row} from "antd";
import {useTranslations} from "next-intl";
import {
	CheckOutlined,
	CloseOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, recipientAddress, tokenAbi, tokenContractAddress} from "@/common";
import commandDataContainer from "@/container/command";
import Web3 from "web3";
import Image from "next/image";

interface SubscriptionsPros {
	id: string,
	onClose: ()=>void;
	visible: boolean;
	onShowProgress: (s: boolean)=>void;
	mobile: boolean;
}
declare global {
	interface Window {
		ethereum: any;
	}
}

const SubscriptionsComponent: React.FC<SubscriptionsPros>  = ({visible, id, onClose, onShowProgress, mobile}) => {
	const t = useTranslations('others');

	const transferToken = async (id: string, amount: number, type: string, web3: Web3) => {
		// const web3 = new Web3(window.ethereum)
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
				handleSubCommand(amount, type)
			})
			.on('error', console.error); // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
	};

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

	const handleSubmitBasic = () => {
		connectToBsc().then((web3) => {
			transferToken(id, 200000, 'basic', web3).then(() => {
			})
		});
	};
	const handleSubmitPlus = () => {
		connectToBsc().then((web3) => {
			transferToken(id, 2000000, 'plus', web3).then(()=>{})
		});
	};
	const handleSubmitPro = () => {
		connectToBsc().then((web3) => {
			transferToken(id, 200000000, 'pro', web3).then(()=>{})
		});
	};

	const handleSubCommand = (amount: number, type: string) => {
		const data = {id: id, amount: amount, sub_type: type };
		let url = getApiServer(80) + api_url.account.wallet.subscription
		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(data)
		})
			.then(response => response.json())
			.then(data => {
				if (data.code === "200") {
					Modal.success({
						content: t('sub_ok')
					})
				}else{
					Modal.warning({
						content: t('sub_fail')
					})
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				alert(t('sub_fail'));
			});
	};

	return (
		<div hidden={!visible}>
			<div className={styles.voice_instruct_container}>
				<div className={mobile ? styles.voice_instruct_content_mobile : styles.voice_instruct_content}>
					<Row>
						<Col span={8}>
							<CloseOutlined style={{color: "black", fontSize: 20}} onClick={() => onClose()}/>
						</Col>
					</Row>
					<Divider type={"horizontal"}/>
					<div style={{height: 560, overflow:"scroll"}}>
          <Row align={"middle"} justify={"space-between"} >
	          <Col span={24} style={{textAlign: "center", marginBottom:10, border: "1px dotted cyan"}}>
		          <h1>Basic</h1>
		          <h2>PAB Staking 200,000/12Months</h2>
		          <Button type={"primary"} onClick={handleSubmitBasic}>{t('upgrade')}</Button>
		          <h4><CheckOutlined /> Force 10,000</h4>
		          <h4><CheckOutlined /> Earn Force Value</h4>
	          </Col>
          </Row>
					<Row>
	          <Col span={24} style={{textAlign: "center", marginBottom:10, border: "1px dotted cyan"}}>
		          <h1>Plus</h1>
		          <h2>PAB Staking 2,000,000/12Months</h2>
		          <Button type={"primary"} onClick={handleSubmitPlus}>{t('upgrade')}</Button>
		          <h4><CheckOutlined/> Force 120,000</h4>
		          <h4><CheckOutlined/> create 1 Town</h4>
		          <h4><CheckOutlined/> Earn Force Value and redeem rewards</h4>
	          </Col>
					</Row>
					<Row>
	          <Col span={24} style={{textAlign: "center", border: "1px dotted cyan"}}>
		          <h1>Pro</h1>
		          <h2>PAB Staking 200,000,000/12Months</h2>
		          <Button type={"primary"} onClick={handleSubmitPro}>{t('upgrade')}</Button>
		          <h4><CheckOutlined/> Force 1,500,000</h4>
		          <h4><CheckOutlined/> create 3 Towns</h4>
		          <h4><CheckOutlined/> Earn Force Value and redeem rewards</h4>
	          </Col>
          </Row>
					<Divider type={"horizontal"}/>
					<Row>
						<Col span={8} style={{textAlign: "center"}}>
						<a target={"_blank"} href={"https://pancakeswap.finance/swap?outputCurrency=0xD6311f9A6bd3a802263F4cd92e2729bC2C31Ed23&inputCurrency=0x55d398326f99059fF775485246999027B3197955"}>PAB购买地址</a>
						</Col>
						<Col span={8} style={{textAlign: "center"}}>
							<Popover  content={<Image width={246} height={336} onClick={()=>alert(t('scan'))} src={"/images/wepay.png"} alt={"scan"}/>} title={t('scan')}>
								<Button type="primary">{t('scan_btn')}</Button>
							</Popover>

						</Col>
						<Col span={8} style={{textAlign: "center"}}>
							<a target={"_blank"} href={"https://bscscan.com/address/0xd6311f9a6bd3a802263f4cd92e2729bc2c31ed23"}>PAB合约地址</a>
						</Col>
					</Row>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionsComponent;
