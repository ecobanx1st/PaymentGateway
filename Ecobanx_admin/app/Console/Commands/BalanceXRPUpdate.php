<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserXrpAddress;
use App\Models\AdminFeeWallet;
use App\Models\CryptoTransactions;
use App\FeeWalletTransaction;

class BalanceXRPUpdate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:xrp';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update XRP transaction for logged Users';

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
        $ethtable = AdminFeeWallet::where('coinname','XRP')->first();
        $address = $ethtable->address;
		//$url = 'https://data.ripple.com/v2/accounts/'.$address.'/transactions';
		$url = 'https://data.ripple.com/v2/accounts/'.$address.'/transactions?limit=1000&descending=true';
		$result = $this->cUrl_xrp($url);
		if(isset($result['result']) && $result['result']=='success' && $result['count'] > 0){   
			foreach($result['transactions'] as $trn){
				if(isset($trn['tx']['Amount'])) {
					if(!is_array($trn['tx']['Amount'])) { 
						if(isset($trn['tx']['DestinationTag'])) {						
							$amount         = ncDiv($trn['meta']['delivered_amount'],1000000,8);
							$time           = $trn['date'];
							$recive_address = $trn['tx']['Destination'];
							$type           = $trn['tx']['TransactionType'];
							$send_address   = $trn['tx']['Account'];
							$fee            = $trn['tx']['Fee']/1000000;
							$txid           = $trn['hash'];
							$DestinationTag = $trn['tx']['DestinationTag'];
                            $txtype = 'Send';
							if($address == $recive_address){									
								$uid = UserXrpAddress::getUserID($DestinationTag);
								if($uid){
									$ctime = date('Y-m-d H:i:s',strtotime($time));
									CryptoTransactions::createTransaction($uid,'XRP',$txid,$send_address,$recive_address,$amount,100,$ctime,'coin');                           
								}
                                $txtype='Received';								
							}
                            FeeWalletTransaction::createTransaction('XRP',$txid,$send_address,$recive_address,$amount,3,$ctime,'coin',$txtype);
						}
					}
				}
			}
		}

        $this->info('XRP transaction updated to All Users');
    }

    public function cUrl_xrp($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            $result = 'Error:' . curl_error($ch);
        }
        curl_close($ch);
        return json_decode($result, true);
    }
}
