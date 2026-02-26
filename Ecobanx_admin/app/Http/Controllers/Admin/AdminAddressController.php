<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Tanippatta_Panappais;
use App\Models\FeeTokenWallet;
use App\UserTokenAddress;
use App\TokenTransaction;
use App\Traits\TrcClass;
use App\Models\AdminFeeWallet;
use App\FeeWalletTransaction;
use App\Traits\BtcClass;
use App\Traits\EvmClass;
use App\Traits\XrpClass;
use Illuminate\Support\Facades\Crypt;
use App\Models\Commission;
use App\Models\UserWallet;

class AdminAddressController extends Controller
{
    use TrcClass,BtcClass,EvmClass,XrpClass;
    public function __construct()
    {
        $this->middleware('admin');
    }
/*
    public function index()
    {
        $adminwallet = Tanippatta_Panappais::index();
        return view('adminwallet.adminwallet',[
            'adminwallet' => $adminwallet
        ]);
    }*/

    public function index1()
    {
        $adminwallet = FeeTokenWallet::index();
        return view('adminwallet.adminwallet',[
            'adminwallet' => $adminwallet
        ]);
    }
    public function index()
    {
        $feewallet = FeeTokenWallet::where('id',1)->first();
        $adminwallet = UserTokenAddress::where('mugavari',$feewallet->mugavari)->first();
        $depositList = TokenTransaction::where('uid',$adminwallet->user_id)->orderBy('id','Desc')->paginate(20);
        return view('admin.feewallet',[
            'data' => $adminwallet,'depositList' => $depositList,'coin' => 'NAS']);
    }
    public function adminsendtoken(Request $request)
    {
        $this->validate($request, [               
            'amount'    => 'required|numeric',            
            'toaddress' => 'required',                   
        ]);
        $amount = $request->amount;
        $to_address = $request->toaddress;
        $send = $this->AdminTrc10SendAmount($to_address,$amount);
        if($send){
            return back()->with('success','Token Successfully sended.Reference tranasction ID is '.$send);
        }else{
            return back()->with('erreo','Token Not sended please try again later');
        }

        
    }
    public function cryptoSendAmount(Request $request)
    {
        $this->validate($request, [               
            'id'        => 'required',            
            'amount'    => 'required|numeric',            
            'toaddress' => 'required',                   
        ]);
        $to_address = $request->toaddress;
        $id = $request->id;
        $amount = $request->amount;

        $id = \Crypt::decrypt($id);
        $ethtable = AdminFeeWallet::where(['id' => $id])->first();
        //dd($ethtable);
        $Commission = Commission::where(['source'=> $ethtable->coinname,'type' => $ethtable->network])->first();
        $uid = $ethtable->id; 
        if(($Commission->source == 'BNB' || $Commission->source == 'ETH' || $Commission->source == 'MATIC') && $Commission->type == 'coin'){
            $txid = $this->SendEVMAdmin($Commission->source,$to_address,$amount);
            if(isset($txid->txid)){
                $txid = $txid->txid;
            }            
        }else if($Commission->source == 'BTC' && $Commission->type == 'coin'){
            $txid = $this->createAdminBTCTransaction($to_address,$amount);
            if(isset($txid->txid)){
                $txid = $txid->txid;
            }            
        }
        else if($Commission->source == 'TRX'){
            $txid = $this->withdrawTRX($uid,$amount,$to_address);
        }
        else if($Commission->type == 'erctoken' || $Commission->type == 'token' || $Commission->type == 'bsctoken' || $Commission->type == 'polytoken'){
            if($Commission->type == 'erctoken' || $Commission->type == 'token'){
                $network = 'ETH';
            }else if($Commission->type == 'bsctoken'){
                $network = 'BNB';
            }else if($Commission->type == 'polytoken'){
                $network = 'MATIC';
            }
            //$amount = weitoeth($amount);
            $txid = $this->createAdminTransactionEVMToken($network,$Commission->contractaddress,$to_address,$amount);
            if(isset($txid->txid)){
                $txid = $txid->txid;
            }
        }
        else if($Commission->type == 'trxtoken'){
            $txid = $this->withdrawTRC20($amount,$to_address,$Commission->contractaddress);
        }
        if(isset($txid->status) && isset($txid->result)){
            return Redirect::back()->with('error', $txid->result);
        }        
        if($txid){
            return back()->with('success',$Commission->source.' Successfully sended.Reference tranasaction ID is '.$txid);
        }else{
            return back()->with('error',$Commission->source.' Not sended please try again later');
        }        
    }

    public function edit($id)
    {
        $adminwallet = Tanippatta_Panappais::edit(Crypt::decrypt($id));

        return view('adminwallet.edit')->with('adminwallet',$adminwallet);
    }

    public function adminwalletupdate(Request $request)
    {


        if($request->coin_name=='BTC'){
            $this->validate($request, [
                'coin_name' => 'required',
                'address' => 'regex:/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/'
            ]);
        }elseif($request->coin_name=='ETH'){
            $this->validate($request, [
                'coin_name' => 'required',
                'address' => 'regex:/^0x[a-fA-F0-9]{40}$/'
            ]);
        }elseif($request->coin_name=='LTC'){
            $this->validate($request, [
                'coin_name' => 'required',
                'address' => 'regex:/^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/'
            ]);
        }

        $commission = Tanippatta_Panappais::adminwalletupdate($request);

        return back()->with('status','Address Updated Successfully');
    }
    public function feewalletTRC20($coin='NAS'){
        //dd($coin);
        $ethtable = AdminFeeWallet::where(['coinname' => $coin,'network' => 'trxtoken'])->first();
        if(!$ethtable){
            $table = AdminFeeWallet::where('coinname','TRX')->first();
            $ethtable = new AdminFeeWallet;
            $ethtable->coinname = $coin;
            $ethtable->network = 'trxtoken';
            $ethtable->address = $table->address;
            $ethtable->narcanru = $table->narcanru;
            $ethtable->hex_address = $table->hex_address;
            $ethtable->balance = 0.00000000;
            $ethtable->save();
        }
        $this->getAdminTRC20Balance($coin);
        $bdata = $this->getTrxBalances($ethtable->hex_address);
        if(isset($bdata['balance'])){
            $trx_balance = $bdata['balance'] / 1000000;
            AdminFeeWallet::where(['coinname'=> $coin,'network' => 'trxtoken'])->update(['trx_balance' => $trx_balance,'updated_at' => date('Y-m-d H:i:s',time())]);
            if(isset($bdata['assetV2'])){
                $assetV2 = $bdata['assetV2'];
                foreach($assetV2 as $key => $value){
                    $assetid = $value['key'];
                    $amtToken = $value['value'] / 1000000;
                    $coinTok = Commission::where('contractaddress',$assetid)->first();
                    if(is_object($coinTok)){
                        AdminFeeWallet::where(['coinname'=> $coinTok->source,'network' => 'trxtoken'])->update(['balance' => $amtToken,'trx_balance' => $trx_balance,'updated_at' => date('Y-m-d H:i:s',time())]);
                    }
                }
            }
        }
        // $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decrypt($ethtable->narcanru);
        $this->adminTransactionTrxToken($coin);
        $depositList = FeeWalletTransaction::where(['currency' => $coin,'network' => 'trxtoken'])->orderBy('id','Desc')->paginate(10);
        $site_balance = UserWallet::where('currency','TRX')->sum('balance');

        $coinlists = Commission::whereNotIn('type',['fiat','ecopays'])->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => $coin,'type' => 'trxtoken','site_balance' => $site_balance]);
    }
    public function feewalletBTC(){
        $ethtable = AdminFeeWallet::where(['coinname'=>'BTC','network' => 'coin'])->first();
        if(!$ethtable){
          /* $btc = shell_exec('node '.base_path().'/block_btc/generate_btc.js');
		  echo shell_exec('node  /home/superadmin/htdocs/sadm2024.lynowallet.com/block_btc/generate_btc.js');
	  dd($btc); */
		$ethtable = $this->btc_admin_address_create();
          /* $address = $btc->address;
          $publickey = Crypt::encryptString($btc->publickey);
          $wif = Crypt::encryptString($btc->wif);
          $privatekey = Crypt::encryptString($btc->privatekey);
          $ethtable = new AdminFeeWallet;
          $credential = $publickey.','.$wif.','.$privatekey;
          $ethtable->coinname = "BTC";
          $ethtable->network = "coin";
          $ethtable->address = $address;
          $ethtable->narcanru = $credential;
          $ethtable->fee = 0.0005;
          $ethtable->balance = 0.00000000;
          $ethtable->save(); */
    
        }    
        $useraddress = $ethtable->address;
        // $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($ethtable->narcanru);
        $this->transactionBTC($useraddress);
        $depositList = FeeWalletTransaction::where('currency','BTC')->orderBy('id','Desc')->paginate(10);
        $site_balance = UserWallet::where('currency','BTC')->sum('balance');
        
        $coinlists = Commission::whereNotIn('type',['fiat','ecopays'])->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'BTC','type' => 'coin','site_balance' => $site_balance]);
    }
    public function feewalletLTC(){
        $ethtable = AdminFeeWallet::where(['coinname'=>'LTC','network' => 'coin'])->first();
        if(!$ethtable){
          $btc = json_decode(shell_exec('node '.base_path().'/block_ltc/generate_ltc.js'));
          $address = $btc->address;
          $publickey = Crypt::encryptString($btc->publickey);
          $wif = Crypt::encryptString($btc->wif);
          $privatekey = Crypt::encryptString($btc->privatekey);
          $ethtable = new AdminFeeWallet;
          $credential = $publickey;
          $ethtable->coinname = "LTC";
          $ethtable->network = "coin";
          $ethtable->address = $address;
          $ethtable->narcanru = $credential;
          $ethtable->fee = 0.0005;
          $ethtable->balance = 0.00000000;
          $ethtable->save();    
        }    
        $useraddress = $ethtable->address;
        // $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($ethtable->narcanru);
        
        $this->transactionLTC($useraddress);
        $depositList = FeeWalletTransaction::where('currency','LTC')->orderBy('id','Desc')->paginate(10);
        $site_balance = UserWallet::where('currency','LTC')->sum('balance');


        $coinlists = Commission::whereNotIn('type',['fiat','ecopays'])->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'LTC','type' => 'coin','site_balance' => $site_balance]);
    }
    public function feewalletXRP(){
        $ethtable = $this->xrp_admin_address_create(); 
        $useraddress = $ethtable->address;
        // $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($ethtable->narcanru);
        //dd($pvk);
        //$this->transactionBTC($useraddress);
        $depositList = FeeWalletTransaction::where('currency','XRP')->orderBy('id','Desc')->paginate(10);
        $site_balance = UserWallet::where('currency','XRP')->sum('balance');

        $coinlists = Commission::whereNotIn('type',['fiat'])->where('status',1)->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'XRP','type' => 'coin','site_balance' => $site_balance]);
    }
    public function feewalletGBC(){
        $ethtable = AdminFeeWallet::where('coinname','TRX')->first(); 
        if(!$ethtable){
            $ethtable = $this->GBC_admin_address_create(); 
        }
        
        $useraddress = $ethtable->address;
        // $credential = explode(',',$ethtable->narcanru);

        $pvk = Crypt::decryptString($ethtable->narcanru);       
        $depositList = FeeWalletTransaction::where('currency','GBC')->orderBy('id','Desc')->paginate(10);
        $balance = $this->getGBCWalletbalance($useraddress);
        if(isset($balance)){            
            $ethtable->balance = $balance;
            $ethtable->save();
        }
        $coinlists = Commission::whereNotIn('type',['fiat'])->where('status',1)->get();
        $site_balance = UserWallet::where('currency','GBC')->sum('balance');

        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'GBC','type' => 'coin','site_balance' => $site_balance]);
    }
    public function transactionBTC($useraddress){
        $tokenblock = "d1b1c5245c3043b3a68a9d92f387ba99";
        $url = 'https://api.blockcypher.com/v1/btc/main/addrs/'.$useraddress.'/full?token='.$tokenblock;
        $sends = $this->getTrans($url);
        $send = json_decode($sends);
        if(isset($send->final_balance)){
            if($send->final_balance <= 0)
            {  
                return true;
            }else{
                echo $useraddress;
                $uncofirm_count = $send->unconfirmed_n_tx;
                $final_balance = $this->sathositobtc($send->final_balance);
                $update_balance = AdminFeeWallet::where(['coinname'=>'BTC','network' => 'coin'])->update(['balance' => $final_balance,'updated_at' => date('Y-m-d H:i:s',time())]);

                if($update_balance)
                {
                    if(isset($send->txs)){
                        foreach ($send->txs as $key => $tran) {
                            $tx_hash = $tran->hash;
                            $confirmations = $tran->confirmations;
                            $time     = date('Y-m-d H:i:s',strtotime($tran->received));
                            foreach ($tran->inputs as $key => $inputs) {
                                if(isset($inputs->addresses)){
                                    if(in_array($useraddress , $inputs->addresses)){
                                        $sender = $useraddress;
                                        break;
                                    }else{
                                        $sender = $inputs->addresses[0];
                                    }
                                }else if(isset($inputs->prev_addresses)){
                                    if(in_array($useraddress , $inputs->prev_addresses)){
                                        $sender = $useraddress;
                                        break;
                                    }else{
                                        $sender = $inputs->prev_addresses[0];
                                    }                        
                                }else{
                                    $sender = "";
                                }
                                //$sender = $inputs->addresses[0];
                            }
                            foreach ($tran->outputs as $outputs) {
                                if(isset($outputs->addresses)){
                                    if(in_array($useraddress , $outputs->addresses)){
                                        $receiver = $useraddress;
                                        $amount = $this->sathositobtc($outputs->value);
                                        echo "$receiver $amount : ";
                                        break;
                                    }else{
                                        $receiver = $outputs->addresses[0];
                                    }
                                }else{
                                    $receiver = "";
                                }
                            }
                            if($sender != $receiver){
                                if($receiver == $useraddress)
                                {
                                  $type = 'Received';
                                }else{
                                    $type = 'Send';
                                }
                            }
                            $tran = FeeWalletTransaction::where(['currency' => 'BTC','txid' => $tx_hash])->first();
                            if(!$tran){
                                $tran = new FeeWalletTransaction();
                                $tran->currency = "BTC";
                                $tran->txtype = $type;
                                $tran->network = 'coin';
                                $tran->txid = $tx_hash;
                                $tran->from_addr = $sender;
                                $tran->to_addr = $receiver;
                                $tran->amount = $amount;            
                                $tran->status = 2;
                                $tran->created_at = $time;
                            }
                            $tran->confirmation = $confirmations;
                            $tran->updated_at = date('Y-m-d H:i:s',time());
                            $tran->save();
                        }
                    }
                }
            }
        }
    }
    public function transactionLTC($useraddress){
        $tokenblock = "baa0f23afe98406bb7c19f028876af52";
        $url = 'https://api.blockcypher.com/v1/ltc/main/addrs/'.$useraddress.'/full?token='.$tokenblock;
        $sends = $this->getTrans($url);
        $send = json_decode($sends);
        if(isset($send->final_balance)){
            if($send->final_balance <= 0)
            {  
                return true;
            }else{
                echo $useraddress;
                $uncofirm_count = $send->unconfirmed_n_tx;
                $final_balance = $this->sathositobtc($send->final_balance);
                $update_balance = AdminFeeWallet::where(['coinname'=>'LTC','network' => 'coin'])->update(['balance' => $final_balance,'updated_at' => date('Y-m-d H:i:s',time())]);

                if($update_balance)
                {
                    if(isset($send->txs)){
                        foreach ($send->txs as $key => $tran) {
                            $tx_hash = $tran->hash;
                            $confirmations = $tran->confirmations;
                            $time     = date('Y-m-d H:i:s',strtotime($tran->received));
                            foreach ($tran->inputs as $key => $inputs) {
                                if(isset($inputs->addresses)){
                                    if(in_array($useraddress , $inputs->addresses)){
                                        $sender = $useraddress;
                                        break;
                                    }else{
                                        $sender = $inputs->addresses[0];
                                    }
                                }else if(isset($inputs->prev_addresses)){
                                    if(in_array($useraddress , $inputs->prev_addresses)){
                                        $sender = $useraddress;
                                        break;
                                    }else{
                                        $sender = $inputs->prev_addresses[0];
                                    }                        
                                }else{
                                    $sender = "";
                                }
                                //$sender = $inputs->addresses[0];
                            }
                            foreach ($tran->outputs as $outputs) {
                                if(isset($outputs->addresses)){
                                    if(in_array($useraddress , $outputs->addresses)){
                                        $receiver = $useraddress;
                                        $amount = $this->sathositobtc($outputs->value);
                                        echo "$receiver $amount : ";
                                        break;
                                    }else{
                                        $receiver = $outputs->addresses[0];
                                    }
                                }else{
                                    $receiver = "";
                                }
                            }
                            if($sender != $receiver){
                                if($receiver == $useraddress)
                                {
                                  $type = 'Received';
                                }else{
                                    $type = 'Send';
                                }
                            }
                            $tran = FeeWalletTransaction::where(['currency' => 'LTC','txid' => $tx_hash])->first();
                            if(!$tran){
                                $tran = new FeeWalletTransaction();
                                $tran->currency = "LTC";
                                $tran->txtype = $type;
                                $tran->network = 'coin';
                                $tran->txid = $tx_hash;
                                $tran->from_addr = $sender;
                                $tran->to_addr = $receiver;
                                $tran->amount = $amount;            
                                $tran->status = 2;
                                $tran->created_at = $time;
                            }
                            $tran->confirmation = $confirmations;
                            $tran->updated_at = date('Y-m-d H:i:s',time());
                            $tran->save();
                        }
                    }
                }
            }
        }
    }
    public function feewalletTRX(){
        $ethtable = AdminFeeWallet::where('coinname','TRX')->first(); 
        if(!$ethtable){
            $ethtable = $this->trx_admin_address_create();
        }

        $useraddress = $ethtable->address;
        // $credential = explode(',',$ethtable->narcanru);
       
        $pvk = Crypt::decrypt($ethtable->narcanru);
        $bdata = $this->getBalanceTRXAddress($useraddress);
        if(isset($bdata)){
            $ethtable->balance = $bdata;
            $ethtable->save();
        }

        $this->adminTransactionTrx();
        $depositList = FeeWalletTransaction::where(['currency'=> 'TRX','network' =>'coin'])->orderBy('id','Desc')->paginate(10);
        $site_balance = UserWallet::where('currency','TRX')->sum('balance');

        $coinlists = Commission::whereNotIn('type',['fiat','ecopays'])->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'TRX','type' => 'coin','site_balance' => $site_balance ]);
    }
    public function transactionTRX($useraddress){
        if($useraddress){
            $url = 'https://insight.bitpay.com/api/txs/?address='.$useraddress;
            $tran = $this->cUrlss($url);
            $tran = json_decode($tran);
            if($tran){      
            if(count($tran->txs) > 0){
              foreach($tran->txs as $addr){
                $order_no   = TransactionString().$uid;
                $txid       = $addr->txid;
                $sender     = $addr->vin[0]->addr;
                $confirm    = $addr->confirmations;
                $fees       = $addr->fees;
                $time       = $addr->time;
                foreach ($addr->vout as $vout) {
                    if(isset($vout->scriptPubKey->addresses)){
                        if(in_array($useraddress , $vout->scriptPubKey->addresses)){
                            $receiver = $useraddress;
                            $amount = $vout->value;
                            break;
                        }else{
                            $receiver = $addr->vout[0]->addr;
                        }
                    }else{
                        $receiver = "";
                    }                 
                }
                foreach ($addr->vin as $vin) {
                    if(isset($vin->scriptPubKey->addresses)){
                        if(in_array($useraddress , $vin->scriptPubKey->addresses)){
                            $sender = $useraddress;
                            $amount = $vin->value;
                            break;
                        }else{
                            $sender = $addr->vin[0]->addr;
                        }
                    }else{
                        $sender = "";
                    }                 
                }
                if($sender != $receiver){
                    if($receiver == $useraddress)
                    {
                      $type = 'Received';
                    }else{
                        $type = 'Send';
                    }
                }
                $tran = FeeWalletTransaction::where(['currency' => 'BTC','txid' => $txid])->first();
                if(!$tran){
                    $tran = new FeeWalletTransaction();
                    $tran->currency = "BTC";
                    $tran->txtype = $type;
                    $tran->network = 'coin';
                    $tran->txid = $txid;
                    $tran->from_addr = $sender;
                    $tran->to_addr = $receiver;
                    $tran->amount = $amount;            
                    $tran->status = 2;
                    $tran->created_at = $time;
                }
                $tran->confirmation = $confirm;
                $tran->updated_at = date('Y-m-d H:i:s',time());
                $tran->save();
              }
            }
          }            
        }
    }
    public function sendWallet(Request $request){
        $this->validate($request, [   
                    'coinname' => 'required',
                    'toaddress' => 'required',
                    'amount' => 'required',
                ]);
        $coin = $request->coinname;
        $toaddress = $request->toaddress;
        $amount = $request->amount;
        $send   = $this->createAdminBtcTransaction($toaddress,$amount,0.0005);                    
        if($send){
            if(isset($send->txid)){
                $txnid = $send->txid;
            }elseif(isset($send->tx->hash)){
                $txnid = $send->tx->hash;
            }else{
                $txnid = "No";
            }
        }
        return Redirect::back()->with( 'success', "Your transaction ID is $txnid");
    }
    public function feeWallet($coin='ETH',$type='coin'){
        $coinlists = Commission::where(['source' => $coin,'type' => $type])->first();
        if($coin == 'ETH' || $coin == 'BNB' || $coin == 'MATIC' || $coin == 'WFI'){
            return $this->feeWalletEVM($coin);
        }else if($coinlists->type == 'token' || $coinlists->type == 'erctoken'){
            return $this->feeWalletEVMToken($coin,$coinlists->type,$coinlists->contractaddress,'ETH');
        }else if($coinlists->type == 'bsctoken'){
            return $this->feeWalletEVMToken($coin,$coinlists->type,$coinlists->contractaddress,'BNB');
        }else if($coinlists->type == 'wfitoken'){
            return $this->feeWalletEVMToken($coin,$coinlists->type,$coinlists->contractaddress,'WFI');
        }else if($coinlists->type == 'polytoken'){
            return $this->feeWalletEVMToken($coin,$coinlists->type,$coinlists->contractaddress,'MATIC');
        }else if($coinlists->type == 'trxtoken'){
            return $this->feewalletTRC20($coin);
        }else{
            $coinfn = "feeWallet".$coin;
            return $this->$coinfn();
        }        
    }
    public function feeWalletEVM($coin){ 
        $ethtable = AdminFeeWallet::where(['coinname'=> $coin,'network' => 'coin'])->first();
        if(!$ethtable){
            $table = AdminFeeWallet::where('coinname','ETH')->first();
            if(is_object($table)){
                $address = $table->address;
                $pvtk = $table->narcanru;
            }else{
                $address_gen = $this->evmcreate();
                $privateKey = Crypt::encryptString($address_gen->private);
                $pubk = Crypt::encryptString($address_gen->public);                
                $address = "0x".$address_gen->address;
                $pvtk = $privateKey;
            }        

            $ethtable = new AdminFeeWallet;
            $ethtable->coinname = $coin;
            $ethtable->network  = "coin";
            $ethtable->address  = $address;
            $ethtable->narcanru = $pvtk;
            $ethtable->fee      = 0.00042;
            $ethtable->balance  = 0.00000000;
            $ethtable->save();
        }        
        $useraddress = $ethtable->address;
        // $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($ethtable->narcanru);        
        $depositList = FeeWalletTransaction::where(['currency' => $coin,'network' => 'coin'])->orderBy('id','Desc')->paginate(10); 
        $balance = $this->getEVMBalanceAddress($coin,$useraddress);
        if($balance > 0){
            $this->transactionAdminEVM($coin,$useraddress);
        }       
        $ethtable->balance = $balance;
        $ethtable->save();
        $coinlists = Commission::whereNotIn('type',['fiat','ecopays'])->get();
        $site_balance = UserWallet::where('currency',$coin)->sum('balance');

        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => $coin,'type' => 'coin','site_balance' => $site_balance]);
    }

    public function feeWalletEVMToken($coin,$network,$contractaddress,$evmType){
        $ethtable = AdminFeeWallet::where(['coinname' => $coin,'network' => $network])->first();
        if(!$ethtable){
            $table = AdminFeeWallet::where('coinname','ETH')->first();
            $ethtable = new AdminFeeWallet;
            $ethtable->coinname = $coin;
            $ethtable->network = $network;
            $ethtable->address = $table->address;
            $ethtable->narcanru = $table->narcanru;
            $ethtable->fee = 0.00042;
            $ethtable->balance = 0.00000000;
            $ethtable->save();
        }        
        $useraddress = $ethtable->address;
        // $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($ethtable->narcanru);

        $ethbalance = $this->getEVM20BalanceAddress($evmType,$useraddress,$contractaddress);
        $ethtable->balance = $ethbalance;
        $ethtable->save();

        $this->transactionAdminEVMToken($evmType,$useraddress);
        $depositList = FeeWalletTransaction::where(['currency' => $coin,'network' => $network])->orderBy('id','Desc')->paginate(10);
        $coinlists = Commission::whereNotIn('type',['fiat','ecopays'])->where('status',1)->get();
        $site_balance = UserWallet::where('currency',$coin)->sum('balance');


        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => $coin,'type' => $network,'site_balance' => $site_balance]);
    }
    public function cUrlss($url, $postfilds=null){
         $this->url = $url;
         $this->ch = curl_init();
         curl_setopt($this->ch, CURLOPT_URL, $this->url);
         curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, 1);
         curl_setopt($this->ch, CURLOPT_SSL_VERIFYPEER, false);
         if(!is_null($postfilds)){
         curl_setopt($this->ch, CURLOPT_POSTFIELDS, $postfilds);
         }
         if(strpos($this->url, '?') !== false){
         curl_setopt($this->ch, CURLOPT_POST, 1);
         }
         $headers = array('Content-Length: 0');
         $headers[] = "Content-Type: application/x-www-form-urlencoded";
         curl_setopt($this->ch, CURLOPT_HTTPHEADER, $headers);
         if (curl_errno($this->ch)) {
         $this->result = 'Error:' . curl_error($this->ch);
         } else {
         $this->result = curl_exec($this->ch);
         } 
         curl_close($this->ch);
         return json_decode($this->result, true);
    }
    public function weitoeth($amount){
        if($amount > 0){
            return $amount / 1000000000000000000;
        }
        return 0;
    }
    public function weitousdt($amount,$tokenDecimal=null){
        if($amount == 0){
            return 0;
        }
        if($tokenDecimal){
            if($tokenDecimal > 0){
               $tokenDecimal = 1 + $tokenDecimal;
                $number = 1;
                $number = str_pad($number, $tokenDecimal, '0', STR_PAD_RIGHT);  
            }else{
                $number = 1;
            }         
            return $amount / $number;
        }else{
            return $amount / 1;
        }
    }
    public function getTrxBalances($address)
    {
        $ch = curl_init();
        $params = array(
            "address" => $address
        );
        curl_setopt($ch, CURLOPT_URL, "https://api.trongrid.io/wallet/getaccount");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
        $headers = array();
        $headers[] = "Content-Type : application/json";
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);
        return json_decode($result, true);
    }
    public function getTrans($url){
        $curl = curl_init();

        curl_setopt_array($curl, array(
          CURLOPT_URL => $url,
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => "",
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 0,
          CURLOPT_FOLLOWLOCATION => true,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => "GET",
          CURLOPT_HTTPHEADER => array(
            "Cookie: __cfduid=ddcb961b22bbc1a177b842e7a955638491596203691"
          ),
        ));

        $result = curl_exec($curl);

        curl_close($curl);
        return $result;
    }

    public function feeWalletedit($id){
        
        $id = Crypt::decrypt($id);
        
        $data = AdminFeeWallet::where('id',$id)->first();
        $coin = $data->coinname;

        if($data->coinname == 'TRX' && $data->network == 'coin'){       
            $pvk = Crypt::decrypt($data->narcanru);
        }else if($data->network == 'trxtoken'){
            $pvk = Crypt::decrypt($data->narcanru);
        }else {
            $pvk = Crypt::decryptString($data->narcanru);
        }

        $fromaddress = $data->address;

        return view('admin.feewalletedit',[
           'pvk' => $pvk,'coin' => $coin,'fromaddress' => $fromaddress]);
    
    }

    public function feewalletupdate(Request $request){

        $coin = $request->coinname;
        $pvk = $request->pvk;
        $fromaddress = $request->fromaddress;

        $table = AdminFeeWallet::where('coinname',$coin)->first();
        
        if($table->coinname == 'TRX' && $table->network == 'coin'){
            $privateKey = Crypt::encrypt($pvk);
        }else if($table->network == 'trxtoken'){
            $privateKey = Crypt::encrypt($pvk);
        }else {
            $privateKey = Crypt::encryptString($pvk);
        }

        $table->address =  $fromaddress;
        $table->narcanru = $privateKey;
        $table->save();

        return view('admin.feewalletedit', [
            'pvk' => $pvk,
            'coin' => $coin,
            'fromaddress' => $fromaddress,
            'success' => 'Updated Successfully',
        ]);
    
            
    }
}
