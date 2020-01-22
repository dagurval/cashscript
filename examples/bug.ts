import { BITBOX } from 'bitbox-sdk';
import { Contract, Sig } from 'cashscript';
import * as path from 'path';

run().catch((err) => {
    console.log(err);
});

export async function run(): Promise<void> {
  const network = 'mainnet';
  const bitbox = new BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });

  const rootSeed = bitbox.Mnemonic.toSeed('CashScript');
  const hdNode = bitbox.HDNode.fromSeed(rootSeed, network);

  const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
  const alicePk = bitbox.ECPair.toPublicKey(alice);
  const alicePkh = bitbox.Crypto.hash160(alicePk);


  const eatbch = "bitcoincash:pp8skudq3x5hzw8ew7vzsw8tn4k8wxsqsv0lt0mf3g";

  const Bug = Contract.compile(path.join(__dirname, 'bug.cash'), network);

  const instance = Bug.new(bitbox.Address.cashToHash160(eatbch))

  const contractBalance = await instance.getBalance();
  console.log('Contract address:', instance.address);
  console.log('Contract balance:', contractBalance);

  console.log('contract opcount:', instance.opcount);
  console.log('contract bytesize:', instance.bytesize);

  const tx = await instance.functions.yum(alicePk, new Sig(alice))
    .send(eatbch, 546, { fee: 523 })
    .catch((e) => { console.log(e) })

  console.log('transaction details:', tx);
}
