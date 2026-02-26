<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\CryptoTransactions;
use App\Models\UserBtcAddress;
use App\Traits\Bitcoin;
use App\Models\TransactionBlock;

class BlockchainUpdate extends Command
{
    use Bitcoin;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:blockchain';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update Blockchain Blocks transaction for logged Users';

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
        $blocks = TransactionBlock::where('coin','BTC')->first();
        $takeblock = $blocks->blocks;
     
 
        $url = "https://blockchain.info/rawblock/".$takeblock;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        //curl_setopt($ch, CURLOPT_HEADER, TRUE);
        //curl_setopt($ch, CURLOPT_NOBODY, TRUE); // remove body
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch); 
 
        /* $fp = fopen('652530.json', 'w');
        fwrite($fp, $result);
        fclose($fp);
        $address = array("1Mg7wU9ZCg4YwFHh1hhFYPB8SPGmEmDXKV", "3BpN14iGA83L3pc6exNpCm2vHyYzTDT3G8"); 
        $str = file_get_contents("652530.json");
        */
   
        $address = UserBtcAddress::pluck('address')->toArray();
        $json = json_decode($result, true);
        if($json){
            if(isset($json['tx']) && $json['tx'] > 0){
                foreach($json['tx'] as $txs){
                    $tx_hash = $txs['hash'];
                    $time = date('Y-m-d H:i:s',$txs['time']);
                    $fee = $this->sathositobtc($txs['fee']);
                    $amount = 0;
                    $is_present = 0;
                    $type = 'Received';   

                    foreach($txs['inputs'] as $inputs){
                
                        if(isset($inputs['prev_out'])){
                            if(isset($inputs['prev_out']['addr'])){
                            if(in_array($inputs['prev_out']['addr'], $address)){
                                $is_present = 1;
                                $sender = $inputs['prev_out']['addr'];
                                $type = 'Send';
                                break;
                            }else{
                                $sender = $inputs['prev_out']['addr'];
                            }
                           }else{
                                $sender = '';
                            }
                         
                        }else{
                            $sender = "";
                        }
                    }
                    foreach($txs['out'] as $outs){
                        if(isset($outs['addr'])){
                            if(in_array($outs['addr'], $address)){
                                $is_present = 1;
                                $amount = $this->sathositobtc($outs['value']);                            
                                $receiver = $outs['addr'];
                                break;
                            }else{
                                $receiver = $outs['addr'];
                            }
                        }else{
                            $receiver = "";
                        }
                    }
                    if($is_present == 1){
                        echo "Type : $type Hash: ".$tx_hash."  Amount :  ".$amount." Sender : $sender Receiver : $receiver <br/>";
                        if($sender != $receiver && $type =='Received'){
                            $uid = UserBtcAddress::where(['address' => $receiver])->value('user_id');
                            $is_txn = CryptoTransactions::where('txid',$tx_hash)->first();
                            if(!$is_txn)
                            {
                                CryptoTransactions::createTransaction($uid,'BTC',$tx_hash,$sender,$receiver,$amount,3,$time,'coin');                    
                            }
                        }
                    }
                }
                $blocks->blocks = $takeblock + 1;
                $blocks->last_blocks = $takeblock;
                $takeblock=$takeblock+1;
                $blocks->updated_at = date('Y-m-d H:i:s',time());
                $blocks->save();
            }else{
				print_r($json);
			}
        }else{
            print_r($result);
        }
        $this->info('Blocks transaction updated to All Users');   
    }
}
