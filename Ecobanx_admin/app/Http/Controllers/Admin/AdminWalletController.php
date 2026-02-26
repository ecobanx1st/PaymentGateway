<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB;
use App\Models\AdminWallet;
use App\Models\Commission;
use App\Models\AdminFeeWallet;
use App\FeeWalletTransaction;
use App\Traits\EthClass;
use App\Traits\BtcClass;

class AdminWalletController extends Controller
{
    use BtcClass,EthClass;
    public function __construct()
    {
        $this->middleware('admin');
    }

    public function feeWalletETH(){
        $ethtable = AdminFeeWallet::where('coinname','ETH')->first(); 
        if(!$ethtable){
            $address_gen = $this->ethcreate();
            $pvtk = Crypt::encryptString($address_gen->private);
            $pubk = Crypt::encryptString($address_gen->public);
            $address = "0x".$address_gen->address;

            $ethtable = new AdminFeeWallet;
            $ethtable->coinname = "ETH";
            $ethtable->address    = $address;
            $ethtable->narcanru   = $pvtk.','.$pubk;
            $ethtable->fee = 0.00042;
            $ethtable->balance = 0.00000000;
            $ethtable->save();
        }      
        $useraddress = $ethtable->address;
        $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($credential[0]);
        
        $depositList = FeeWalletTransaction::where('currency','ETH')->orderBy('id','Desc')->paginate(10);
        $ethurl = "https://api.etherscan.io/api?module=account&apikey=WZTRZ613U3X53WQ5NS2GY782FTUAF93XK7&action=balance&address=".$useraddress;
            $ethresult = $this->cUrlss($ethurl);
            $ethbalance = $this->weitoeth($ethresult['result']);
            $ethtable->balance = $ethbalance;
            $ethtable->save();
        $this->transactionETH($useraddress);
        $coinlists = Commission::whereNotIn('type',['fiat'])->where('status',1)->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'ETH']);
    }

    public function feeWalletToken($coin,$contractaddress,$decimal){        
        $ethtable = AdminFeeWallet::where('coinname',$coin)->first();
        if(!$ethtable){
            $table = AdminFeeWallet::where('coinname','ETH')->first();
            $ethtable = new AdminFeeWallet;
            $ethtable->coinname = $coin;
            $ethtable->address = $table->address;
            $ethtable->narcanru = $table->narcanru;
            $ethtable->fee = 0.00042;
            $ethtable->balance = 0.00000000;
            $ethtable->save();
        }        
        $useraddress = $ethtable->address;
        $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($credential[0]);
        $depositList = FeeWalletTransaction::where('currency',$coin)->orderBy('id','Desc')->paginate(10);
        $ethurl = "https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=".$contractaddress."&address=".$useraddress."&tag=latest&apikey=WZTRZ613U3X53WQ5NS2GY782FTUAF93XK7";
            $ethresult = $this->cUrlss($ethurl);
            $ethbalance = $this->weitousdt($ethresult['result'],$decimal);
            $ethtable->balance = $ethbalance;
            $ethtable->save();
        $this->transactionToken($useraddress);
        $coinlists = Commission::whereNotIn('type',['fiat'])->where('status',1)->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => $coin]);
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
    public function transactionETH($useraddress){
        if($useraddress){        
            $url = "http://api.etherscan.io/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=DBIVHXYCZNDVHTCEINY31KKM3REVEURXB9";
            $balance = $this->cUrlss($url);
            if(isset($balance['result'])){
                $count = count($balance['result']);
            }else{
                $count = 0;
            }
            if($count > 0)
            {
               $result_data = $balance['result'];
                for($i = 0; $i < $count; $i++)
                {
                    $data     = $result_data[$i];
                    $txid     = $data['hash'];
                    $confirm  = $data['confirmations'];
                    $from     = $data['from'];
                    $to       = $data['to'];               
                    $time     = date('Y-m-d H:i:s',$data['timeStamp']);               
                    $total    = self::weitoeth($data['value']);
                    $order_no = TransactionString();
                    $amount   = display_format($total,8);
                    if($to == $useraddress){
                        $type = 'Received';
                    }else{
                        $type = 'Send';
                    }
                    $tran = FeeWalletTransaction::where(['currency' => 'ETH','txid' => $txid])->first();
                    if(!$tran){
                        $tran = new FeeWalletTransaction();
                        $tran->currency = "ETH";
                        $tran->txtype = $type;
                        $tran->txid = $txid;
                        $tran->from_addr = $from;
                        $tran->to_addr = $to;
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
    public function transactionToken($useraddress){
        if($useraddress){
            $apikey = "514A3XGJZD82WJU73J6MMWH4QUG5I54EM7";
            $url = "https://api.etherscan.io/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apikey;
            $result_data = $this->cUrlss($url);
            if(isset($result_data['result'])){
                if(count($result_data['result']) > 0){
                    foreach ($result_data['result'] as $data) { 
                        $tokenSymbol    = $data['tokenSymbol'];
                        $contractAddress = $data['contractAddress'];
                        $txid           = $data['hash'];
                        $time           = date('Y-m-d H:i:s',$data['timeStamp']);
                        $from           = $data['from'];
                        $to             = $data['to'];
                        $confirmations  = $data['confirmations'];
                        $total          = self::weitousdt($data['value'],$data['tokenDecimal']);
                        //print_r($useraddress.' -'.$to.' total:'.$total.' decimal:'.$data['tokenDecimal']);
                        $total = sprintf('%.8f',$total);
                        if($to == $useraddress){
                            $type = 'Received';
                        }else{
                            $type = 'Send';
                        }
                        $tran = FeeWalletTransaction::where(['currency' => $tokenSymbol,'txid' => $txid])->first();
                        if(!$tran){
                            $tran = new FeeWalletTransaction();
                            $tran->currency = $tokenSymbol;
                            $tran->txtype = $type;
                            $tran->txid = $txid;
                            $tran->from_addr = $from;
                            $tran->to_addr = $to;
                            $tran->amount = $total;            
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
    public function weitoeth($amount){
        return $amount / 1000000000000000000;
    }
    public function weitousdt($amount,$tokenDecimal=null){
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

    public function feewalletBTC(){
        $ethtable = $this->btc_admin_address_create();    
        $useraddress = $ethtable->address;
        $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($credential[0]);
        $this->transactionBTC($useraddress);
        $depositList = FeeWalletTransaction::where('currency','BTC')->orderBy('id','Desc')->paginate(10);

        $coinlists = Commission::whereNotIn('type',['fiat'])->where('status',1)->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'BTC']);
    }
    public function transactionBTC($useraddress){
        if($useraddress){
            $url = 'https://insight.bitpay.com/api/txs/?address='.$useraddress;
            $tran = crul($url);
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

    public function feewalletLTC(){
        $ethtable = $this->ltc_admin_address_create();    
        $useraddress = $ethtable->address;
        $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($credential[0]);
        $this->transactionBTC($useraddress);
        $depositList = FeeWalletTransaction::where('currency','LTC')->orderBy('id','Desc')->paginate(10);

        $coinlists = Commission::whereNotIn('type',['fiat'])->where('status',1)->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'LTC']);
    }
    
    public function transactionLTC($useraddress){
        if($useraddress){
            $url = 'https://insight.litecore.io/api/txs/?address='.$useraddress;
            $tran = crul($url);
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
                $tran = FeeWalletTransaction::where(['currency' => 'LTC','txid' => $txid])->first();
                if(!$tran){
                    $tran = new FeeWalletTransaction();
                    $tran->currency = "LTC";
                    $tran->txtype = $type;
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
    public function feewalletDASH(){
        $ethtable = $this->dash_admin_address_create();    
        $useraddress = $ethtable->address;
        $credential = explode(',',$ethtable->narcanru);
        $pvk = Crypt::decryptString($credential[0]);
        $this->transactionDASH($useraddress);
        $depositList = FeeWalletTransaction::where('currency','DASH')->orderBy('id','Desc')->paginate(10);

        $coinlists = Commission::whereNotIn('type',['fiat'])->where('status',1)->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'DASH']);
    }
    public function transactionDASH($useraddress){
        $tokenblock = "0f9d5906bc704aa4bf8d217571d0132d";
        $url = 'https://api.blockcypher.com/v1/dash/main/addrs/'.$useraddress.'/full?token='.$tokenblock;
        $sends = $this->getTransDash($useraddress);
        $send = json_decode($sends);
        if(isset($send->final_balance)){
            $ethtable = AdminFeeWallet::where('coinname','DASH')->first();
            if($send->final_balance <= 0)
            {               
                $ethtable->balance = 0;
                $ethtable->save();
            }else{
                $uncofirm_count = $send->unconfirmed_n_tx;
                $final_balance = $this->convertdash($send->final_balance);
                $ethtable->balance = $final_balance;
                $ethtable->updated_at = date('Y-m-d H:i:s',time());
                $ethtable->save();
                if($update_balance)
                {
                    if(isset($send->txs)){
                        foreach ($send->txs as $key => $tran) {
                            $txid = $tran->hash;
                            $confirmations = $tran->confirmations;
                            $time     = date('Y-m-d H:i:s',strtotime($tran->received));                       
                            foreach ($tran->inputs as $inputs) {
                                if(isset($inputs->addresses)){
                                    if(in_array($useraddress , $inputs->addresses)){
                                        $sender = $useraddress;
                                        $amount = $this->convertdash($inputs->value);
                                        break;
                                    }else{
                                        $sender = $inputs->addresses[0];
                                    }
                                }else{
                                    $sender = $inputs->addresses[0];
                                }
                            }
                            foreach ($tran->outputs as $outputs) {
                                if(isset($outputs->addresses)){
                                    if(in_array($useraddress , $outputs->addresses)){
                                        $receiver = $useraddress;
                                        $amount = $this->convertdash($outputs->value);
                                        break;
                                    }else{
                                        $receiver = $outputs->addresses[0];
                                    }
                                }else{
                                    $receiver = $outputs->addresses[0];
                                }
                            }
                            if($receiver == $useraddress){
                                $type = 'Received';
                            }else{
                                $type = 'Send';
                            }
                            $tran = FeeWalletTransaction::where(['currency' => 'DASH','txid' => $txid])->first();
                            if(!$tran){
                                $tran = new FeeWalletTransaction();
                                $tran->currency = "DASH";
                                $tran->txtype = $type;
                                $tran->txid = $txid;
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
        }else{
            echo "API stop $sends";
            return true;
        }
    }
    public function convertdash($amount){
        return $amount / 100000000;
    }
    public function getTransDash($address){
        $curl = curl_init();

        curl_setopt_array($curl, array(
          CURLOPT_URL => "https://api.blockcypher.com/v1/dash/main/addrs/$address/full?token=0f9d5906bc704aa4bf8d217571d0132d",
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
    public function feewalletXRP(){
        $ethtable = $this->xrp_admin_address_create();    
        $useraddress = $ethtable->address;
        $pvk = Crypt::decryptString($ethtable->narcanru);
        $depositList = FeeWalletTransaction::where('currency','XRP')->orderBy('id','Desc')->paginate(10);

        $coinlists = Commission::whereNotIn('type',['fiat'])->where('status',1)->get();
        return view('admin.feewallet',[
            'data' => $ethtable,'pvk' => $pvk,'depositList' => $depositList,'coinlists' => $coinlists,'coin' => 'XRP']);
    }
    public function feeWallet($coin='ETH'){
        $coinlists = Commission::where('source',$coin)->first();
        if($coinlists->type == 'token'){
            return $this->feeWalletToken($coin,$coinlists->contractaddress,$coinlists->decimal);
        }else{
            $coinfn = "feeWallet".$coin;
            return $this->$coinfn();
        }        
    }
}
