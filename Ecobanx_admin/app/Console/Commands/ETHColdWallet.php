<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CryptoTransactions;
use App\Models\UserEvmAddress;
use App\Models\Commission;
use App\Traits\EvmClass;
use App\Models\AdminFeeWallet;

class ETHColdWallet extends Command
{
    use EvmClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'coldwallet:eth';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move ETH balance to admin cold wallet';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $network = "ETH";

        $trans = CryptoTransactions::whereIn('usdt_deposit_type',['ethcoin','erctoken'])->where(['nirvaki_nilai' => 0])->get();
        if(count($trans) > 0){
            $limit = 1;
            $toAddress = AdminFeeWallet::where([['coinname', '=','ETH']])->value('address');
            foreach ($trans as $tran) {
                $uid    = $tran->uid;
                echo "uid: $uid";
                $amount = $tran->amount;
                $useraddress = UserEvmAddress::where('user_id',$uid)->value('address');
                $balance = $this->getEVMBalance($network,$uid);
                $coins = Commission::whereIn('type',['erctoken','token'])->get();
                if(count($coins) > 0){
                    foreach ($coins as $token) {
                        $coin = $token->source;
                        $contractaddress = $token->contractaddress;
                        $tokenbalance = $this->getEVM20Balance($network,$uid,$contractaddress);
                        echo $uid." $coin  Balance: ".display_format($tokenbalance).' - ';
                        if($tokenbalance > 1){
                            //$tokenbalance = ncSub($tokenbalance,0.001,3);
                            //$tokenbalance = weitoeth($tokenbalance);
                            $feeResult = $this->getGasAmountForContractCall($network,$uid,$contractaddress,$toAddress,$tokenbalance);
                            if(isset($feeResult->status) && isset($feeResult->result)){
                                //$txid = $this->SendBNBUser(1,$useraddress,0.000);
                                //dd($feeResult);
                            }else{                                
                                $needfee = weitoeth($feeResult->fee);
                                if($balance >= $needfee){
                                    $txid = $this->createTransactionEVMToken($network,$uid,$contractaddress,$toAddress,$tokenbalance);
                                    if(isset($txid->txid)){
                                        echo $uid." $coin  TxID: ".$txid->txid;
                                        CryptoTransactions::where(['currency'=> $coin,'uid' => $uid,'usdt_deposit_type' => 'erctoken'])->update(['nirvaki_nilai' => 100, 'atxid' => $txid->txid,'updated_at' => date('Y-m-d H:i:s',time())]);
                                    }
                                }else{
                                    $txid = $this->SendEVMAdmin($network,$useraddress,$needfee);
                                    echo $uid." $coin  needfee: ".$needfee.' - '.$txid->txid;
                                } 
                            }
                            
                        }
                        sleep(2);
                    }
                    if($limit % 4 == 0){
                        sleep(2);
                    }
                    $limit++;
                }
                if($balance > 0.0007){ 
                    $amount = ncSub($balance,0.00042);
                    if($amount > 0){
                        $txid = $this->SendEVMUser($network,$uid,$toAddress,$amount); 
                        if(isset($txid->txid)){
                            CryptoTransactions::where(['currency'=> 'ETH','uid' => $uid])->update(['nirvaki_nilai' => 100, 'atxid' => $txid->txid,'updated_at' => date('Y-m-d H:i:s',time())]);
                        }                        
                    }                    
                }
            }
        }
        $this->info('ETH cold wallet updated to All Users');
    }

    public function handle1()
    {
        $trans = CryptoTransactions::where(['nirvaki_nilai' => 0,'currency' => 'ETH'])->get();
        if(count($trans) > 0){
            foreach ($trans as $tran) {
                $uid    = $tran->uid;
                $amount = $tran->amount;
                $fee    = 0.00042;
                $total  = ncSub($amount,$fee,8);
                $send   = $this->createUserEthTransaction($uid,$total);
                if($send){
                    CryptoTransactions::where(['id'=> $tran->id])->update(['nirvaki_nilai' => 100, 'updated_at' => date('Y-m-d H:i:s',time())]);
                }
            }
        }
        $this->info('ETH cold wallet updated to All Users');
    }
}
