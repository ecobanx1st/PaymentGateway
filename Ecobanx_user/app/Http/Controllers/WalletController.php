<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;

use Auth;
use App\User;
use App\Models\Commission;
use App\Models\UserCommission;
use App\Models\UsersWallet;
use App\Models\Wallet;
use App\Models\UsersWithdraw;
use App\Traits\GoogleAuthenticator;
use App\Traits\BtcClass;
use App\Traits\EvmClass;
use App\Traits\TrcClass;
use App\Mail\SendOtpVerification;
use App\Models\LivePrice;
use App\Models\Usercarddetails;
use App\Models\AdminBank;
use App\Models\Deposit;
use App\Models\Bankuser;
use App\Models\CurrencyWithdraw;
use Session;

class WalletController extends Controller {
    use GoogleAuthenticator,BtcClass,EvmClass,TrcClass;

    public function __construct() {
        $this->middleware(['auth','twofa','kyc']);
        //$this->middleware(['auth','twofa']);
    }

    public function index() {
        $coins = Commission::where('status',1)->get();
        $uid = Auth::id();
        $currency = array();
        $price = array();
        if($coins->count()) {
            foreach($coins as $data) {
                $coin = $data->source;
                $price[$coin] = LivePrice::usersBalance($coin,$uid);
                $balance = UsersWallet::where(['uid'=>$uid,'currency'=>$data->source])->first();
                if($balance){
                    $currency[$balance->currency]['balance'] = sprintf("%.8f", $balance->balance);
                    $currency[$balance->currency]['escrow'] = sprintf("%.8f", $balance->escrow_balance);
                    $currency[$balance->currency]['margin'] = sprintf("%.8f", $balance->vilimpu_camanilai);
                }else{
                    if($data->type == 'fiat'){
                        UsersWallet::insert(['uid' => $uid, 'currency' => $data->source, 'balance' => 0, 'escrow_balance' => 0, 'created_at' => date('Y-m-d H:i:s',time()), 'updated_at' => date('Y-m-d H:i:s',time())]);
                    }
                    $currency[$data->source]['balance'] = sprintf("%.8f", 0);
                    $currency[$data->source]['escrow'] = sprintf("%.8f", 0);
                    $currency[$data->source]['margin'] = sprintf("%.8f", 0);
                }
            }
        }
        //dd($price[$coin]);
        return view('userpanel.wallet',['coins' => $coins,'price' => $price,'wallet' => $currency]);
    }


    public function Deposit($coin) {
        $uid = Auth::user()->id;
        $user = Auth::user();
        $coin_data = UserCommission::where(['status'=>1,'uid'=>$uid,'source' => $coin])->first();
        if($coin_data){
            $coins = UserCommission::where(['status'=>1,'uid'=>$uid,'source' => $coin])->first();
        }else{
            $coins = Commission::where(['status' => 1,'source' => $coin])->first();
        }
        if(!is_object($coins)){
            return redirect('wallet')->with('error','Invalid coin/currency !');
        }
        $currency = array();
        $comdetails = Commission::index();
        if($comdetails->count()) {
          foreach($comdetails as $data) {
            $balance = Wallet::where(['uid'=>$uid,'currency'=>$data->source])->first();
            if($balance) {
              $currency[$balance->currency]['balance'] = sprintf("%.8f", $balance->balance);
              $currency[$balance->currency]['escrow'] = sprintf("%.8f", $balance->escrow_balance);
              $currency[$balance->currency]['margin'] = sprintf("%.8f", $balance->vilimpu_camanilai);
            } else {
              if($data->type == 'fiat') {
                Wallet::insert(['uid' => $uid, 'currency' => $data->source, 'balance' => 0, 'escrow_balance' => 0, 'created_at' => date('Y-m-d H:i:s',time()), 'updated_at' => date('Y-m-d H:i:s',time())]);
              }
              $currency[$data->source]['balance'] = sprintf("%.8f", 0);
              $currency[$data->source]['escrow'] = sprintf("%.8f", 0);
              $currency[$data->source]['margin'] = sprintf("%.8f", 0);
            }
          }
        }
        $networks = Commission::where(['source' => $coin])->get();
        $trxaddress = Wallet::where(['uid'=> $uid,'currency'=> 'TRX'])->value('mukavari');
        $ethaddress = Wallet::where(['uid'=> $uid,'currency'=> 'ETH'])->value('mukavari');

        if($coins){
            $address = Wallet::getAddress($uid,$coin);
            if(!$address){
                $coinsList = Commission::coindetails($coin);
                $address = "";
                $symbol = $coinsList->source;
                $vault_id = $user->vault_id;

                if($symbol == 'BTC' && $coinsList->assertype == 'coin'){

                    $address = $this->create_user_btc($uid);
                }elseif($symbol == 'TRX' || $coinsList->assertype == 'TRC20'){
                    $address = $this->createTrcAddress($uid);
                }else{
                    $address = $this->create_user_evm($uid);
                }
            }
            return view('userpanel.cryptodeposit',['coin' => $coin,'coindetail' => $coins,'address' => $address,'comdetails' => $comdetails, 'wallet' => $currency,'trxaddress' =>$trxaddress,'ethaddress' => $ethaddress,'networks' => $networks]);
        }else{
            return redirect('wallet')->with('error','Invalid coin/currency !');
        }
    }

    public function Withdraw($coin) {

        $uid = Auth::user()->id;
        $coin_data = UserCommission::where(['status'=>1,'uid'=>$uid,'source' => $coin])->first();
        if($coin_data){
            $coins = UserCommission::where(['status'=>1,'uid'=>$uid,'source' => $coin])->first();
        }else{
            $coins = Commission::where(['status' => 1,'source' => $coin])->first();
        }
        $networks = Commission::where(['source' => $coin])->get();
        if(Auth::user()->kyc_verify == 1 ){
            if(is_object($coins)){
                $currency = array();
                $comdetails = Commission::index();
                if($comdetails->count()) {
                  foreach($comdetails as $data) {
                    $balance = UsersWallet::where(['uid'=>$uid,'currency'=>$data->source])->first();
                    if($balance) {
                      $currency[$balance->currency]['balance'] = sprintf("%.8f", $balance->balance);
                      $currency[$balance->currency]['escrow'] = sprintf("%.8f", $balance->escrow_balance);
                      $currency[$balance->currency]['margin'] = sprintf("%.8f", $balance->vilimpu_camanilai);
                    } else {
                      if($data->type == 'fiat') {
                        UsersWallet::insert(['uid' => $uid, 'currency' => $data->source, 'balance' => 0, 'escrow_balance' => 0, 'created_at' => date('Y-m-d H:i:s',time()), 'updated_at' => date('Y-m-d H:i:s',time())]);
                      }
                      $currency[$data->source]['balance'] = sprintf("%.8f", 0);
                      $currency[$data->source]['escrow'] = sprintf("%.8f", 0);
                      $currency[$data->source]['margin'] = sprintf("%.8f", 0);
                    }
                  }
                }

                $wallet = UsersWallet::GetUserBalance($uid,$coin);
                $address = UsersWallet::GetUserAddress($uid,$coin);
                $coinname = $coins->coinname;
                $symbol = $coins->source;
                $withdraw_com = bcdiv($coins->withdraw, 100, 8);
                $netfee = $coins->netfee;
                return view('/userpanel.cryptowithdraw', ['balance' => $wallet,'address' => $address,'commission' => $coins->withdraw,'coin' => $symbol,'withdraw_com' => $withdraw_com,'netfee' => $netfee,'coin' => $coin,'comdetails' => $comdetails, 'wallet' => $currency,'coindetail' => $coins,'networks' => $networks]);
            } else {
                return redirect('wallet')->with('error','Invalid coin/currency !');
            }
        } else {
            return redirect('wallet')->with('error','To withdraw please enable Two Factor Authentication (2FA) and complete your KYC!');
        }
    }

/**
* [validatecryptoWithdraw description]
* @param  Request $request [description]
* @return [type]           [description]
*/
public function ValidateCryptoWithdraw(Request $request) {
    $uid = \Auth::id();
    $this->validate($request, [
        'address' => 'required|alpha_num',
        'amount' => 'required|numeric',
        'coin' => 'required|alpha',
        'network' => 'required|alpha_num',
    ]);
    $to_address = $request->address;
    $currency = $request->coin;
    $network = $request->network;
    $balance = 0;

        $uid = \Auth::id();
        $coin_data = UserCommission::where(['uid'=>$uid,'source' => $currency])->first();
        if($coin_data){
        $btcDeatils = UserCommission::where(['uid'=>$uid,'source' => $currency])->first();
        }else{
        $btcDeatils = Commission::where('source', $currency)->first();
        }

    $commission = ($btcDeatils->withdraw / 100);
    $amount = abs($request->amount);
    $fee = $btcDeatils->netfee;
    $min_amount = $btcDeatils->min_amount;
    $max_amount = $btcDeatils->max_amount;
    $admin_amount = bcmul($commission, $amount,8);
    $debitamt1 = bcadd($admin_amount, $fee,8);
    $debitamt = bcsub($amount, $debitamt1,8);
    $balance = UsersWallet::where([['uid', '=', $uid],['currency',$currency]])->value('balance');
//dd($min_amount);
    if($amount >= $fee AND $amount!=""){
        if($amount >= $min_amount && $amount <= $max_amount) {
            if($to_address!="") {
                if($balance >= $amount) {
                    $data['toaddress'] =  $to_address;
                    $data['amount']     =  $amount;
                    $data['currency']   =  $currency;
                    $data['network']   =  $network;
                    \Session::put('withdrawl', $data);
                    $this->otp_function();
                    return Redirect('/withdrawconform');
                } else {
                    return redirect('/withdraw/'.$currency)->with('fail', "Insufficient fund in your ".$currency." Wallet !!!.You need  ".$amount."  ".$currency);
                }
            } else {
                return redirect('/withdraw/'.$currency)->with('fail', 'Please enter valid '.$currency.' Address!');
            }
        } else {
            return redirect('/withdraw/'.$currency)->with('fail', "Amount should be less than of ".$max_amount. " And minmum of ".$min_amount);
        }
    } else {
        return redirect('/withdraw/'.$currency)->with('fail', "Withdraw amount must be greater than or equal to  ".$fee ." ".$currency);
    }
    return Redirect::back();
}

/**
* [withdraw_otp description]
* @return [type] [description]
*/
public function WithdrawOTP(){
    return view('withdrawotp');
}

public function otp_function() {
    $twofa = \Auth::user()->twofa;

    if($twofa == 'google_otp'){

    }else if($twofa == 'email_otp') {
        $rand = rand(100000,999999);
        $security = User::where(['id' => \Auth::id(), 'email_verify' => 1])->first();
        $security->profile_otp = $rand;
        $security->save();
        \Mail::to($security->email)->send(new SendOtpVerification($rand));
    }
    return true;
}

/**
* [withdrawstore description]
* @param  Request $request [description]
* @return [type]           [description]
*/
public function withdrawstore(Request $request) {
    $niceNames = array(
        'otp' => 'OTP',
    );
    $this->validate($request, [
        'otp' => 'numeric|required'
    ],[],$niceNames);
    $uid = \Auth::id();
    $ses = \Session::get('withdrawl');
    $to_address = $ses['toaddress'];
    $currency = $ses['currency'];
    $amount =$ses['amount'];
    $network =$ses['network'];
    $url = 'withdraw/'.$currency;
    $user = User::where('id',$uid)->first();
    $twofa =$user->twofa;
    if($twofa == 'google_otp') {
        $one_time_password = $request->otp;
        $secret = $user->google2fa_secret;
        $oneCode = $this->getCode($secret);
        $data = $this->verifyCode($secret, $one_time_password, 2);
        if($data) {
            $this->withdrawconfirm($to_address,$currency,$amount,$network);
            session()->forget('withdrawl');
            return redirect('withdrawhistroy/'.$currency);
        } else {
            return redirect('/withdrawconform')->with('faild','Invalid OTP!');
        }
    }
    elseif($twofa == 'email_otp') {
        \Session::flash('success_otp', 'Check your email inbox/spam folder for verification code!.');
        if($user->profile_otp  == $request->otp) {
            $this->withdrawconfirm($to_address,$currency,$amount,$network);
            session()->forget('withdrawl');

            return redirect('withdrawhistroy/'.$currency);
        } else {
            return redirect('/withdrawconform')->with('faild','Invalid OTP! Please try again!');
        }
    } else {
        return redirect('/withdrawconform')->with('faild','Invalid Request! Please try again!');
    }
}

public function withdrawconfirm($to_address,$currency,$amount,$network=null) {
    $balance = 0;
        //$btcDeatils = Commission::where('source', $currency)->first();

        $uid = \Auth::id();
        $coin_data = UserCommission::where(['uid'=>$uid,'source' => $currency])->first();
        if($coin_data){
        $btcDeatils = UserCommission::where(['uid'=>$uid,'source' => $currency])->first();
        }else{
        $btcDeatils = Commission::where('source', $currency)->first();
        }

    $uid = \Auth::id();
    if($btcDeatils) {
        $paymenttype = null;
        $type = $btcDeatils->type;
        $ses = \Session::get('withdrawl');
            if($type == 'fiat'){
                $url = 'fiatwithdraw/'.$currency;
                if(!empty($ses['paymenttype'])){
                $paymenttype = $ses['paymenttype'];
                }
            }else{
                $url = 'withdraw/'.$currency;
            }

        $decimal = $btcDeatils->point_value;

        if($paymenttype == 'Naijapaycard'){
        $commission = bcdiv($btcDeatils->card_com,100,8);
        }else{
        $commission = bcdiv($btcDeatils->withdraw,100,8);
        }

        $amount = abs($amount);
        $fee = display_format($btcDeatils->netfee,8);
        $admin_amount = bcmul($commission, $amount,8);
        $debitamt1 = bcadd($admin_amount, $fee,8);
        $debitamt = bcsub($amount, $debitamt1,8);
        $balance = UsersWallet::where([['uid', '=', $uid],['currency',$currency]])->value('balance');
        if($amount >= $fee AND $amount!=""){
            if($to_address!=""){
                if($balance >= $amount){

                    $autowithdrawstatus = 0;
                    if($btcDeatils->autowithdraw > $amount) {
                        $autowithdrawstatus = 1;
                    }

                    $statustype = "Withdraw";
                    $remark = "Withdraw ".$amount." ".$currency." successfully";

                    if($type == 'fiat'){
                    $Withdrawid = CurrencyWithdraw::createTransaction($uid,$currency,$ses['bankid'],$to_address,$amount,$debitamt1,$debitamt,$paymenttype);
                    }else{
                    $wallet = UsersWallet::where([['uid', '=', $uid],['currency',$currency]])->first();
                    $fromaddress    = $wallet->mukavari;
                    $sathosiamount = $this->sathosi($amount);
                    $Withdrawid = UsersWithdraw::createTransaction($uid,$currency,$fromaddress,$to_address,$amount,$debitamt1,$debitamt,$sathosiamount,$autowithdrawstatus,$network);
                    }

                    $wallet = UsersWallet::debitAmount($uid,$currency,$amount,$decimal,$statustype,$remark,$Withdrawid);

                    session()->forget('withdrawl');
                    return true;
                } else {
                    return redirect($url)->with('fail', "Insufficient fund in your".$currency." Wallet !!!.You need". $amount." ".$currency);
                }
            } else {
                return redirect($url)->with('fail', 'Please enter valid '.$currency.' Address!');
            }
        } else {
            return redirect($url)->with('fail', "Withdraw amount must be greater than or equal to" .$fee." ".$currency);
        }
    }else{
        return redirect('/withdrawconform')->with('faild','Invalid Request! Please try again');
    }
}

public function fiatwithdraw($coin) {
    $user = Auth::user()->id;
    $details = Commission::coindetails($coin);
    if($details){
        if(Auth::user()->kyc_verify == 1){
            $carddetail = Usercarddetails::where([['uid', '=', $user], ['status', '=', 1]])->first();
            $bankdetail = Bankuser::where([['uid', '=', $user], ['status', '=', 1]])->get();
            $fiat_name = $coin;
            $balance = UsersWallet::where([['uid', '=', $user], ['currency',$fiat_name]])->value('balance');

            $com = Commission::where('status',1)->where('source', $fiat_name)->first();

            $uid = \Auth::id();
            $coin_data = UserCommission::where(['uid'=>$uid,'source' => $fiat_name])->first();
            if($coin_data){
            $com = UserCommission::where(['uid'=>$uid,'source' => $fiat_name])->first();
            }else{
            $com = Commission::where('source', $fiat_name)->first();
            }

            $point_value =$com->point_value;
            $withdraw_com = bcdiv($com->withdraw, 100, $point_value);
             $commission1 = $com->withdraw;
             $commission2 = $com->card_com;
             $naijapaycard_withdraw = bcdiv($com->card_com, 100, $point_value);
            return view('userpanel.fiatwithdraw', ['balance'=>$balance, 'commission' => $com->withdraw, 'fee' => $withdraw_com, 'currency' => $fiat_name, 'carddetail' => $carddetail,'commission1' => $commission1,'commission2' => $commission2, 'naijapaycard_withdraw' => $naijapaycard_withdraw, 'bankdetail' => $bankdetail]);
        }else{
            $url = url('/kyc');
            return redirect('security')->with('warning','Identity verification must be done and approved by the admin to withdraw or make Fiat currency deposits!'. '<a href="' . $url . '"> click here </a>');
        }
    }else{
        return redirect('/wallet')->with('adminwalletbank','Invalid Coin/Currency');
    }
}

public function carddropdown(Request $request) {
    $uid= \Auth::id();
    $bank_name=$request->bank_name;
    $bankno= Usercarddetails::where(['uid'=> $uid,'id' => $bank_name])->first();
    $var['card_type']= $bankno->card_type;
    $var['card_holdername']= $bankno->card_holdername;
    $var['card_number']= $bankno->card_number;
    $var['card_bankname']= $bankno->card_bankname;
    $var['id']= $bankno->id;
    echo json_encode($var);
}

public function validatefiatWithdraw(Request $request) {
    $uid = \Auth::id();


    $this->validate($request, [
        'paymenttype'    => 'required|alpha_num',
    ]);

    if($request->paymenttype == 'Bank') {
    $this->validate($request, [
        'bank_name'    => 'required|alpha_num',
        'account_no'    => 'required',
        'amount'        => 'required|numeric',
        'coin'          => 'required|alpha',
    ]);
    }

    if($request->paymenttype == 'Naijapaycard') {
    $this->validate($request, [
        'card_type'    => 'required',
        'card_holdername'    => 'required',
        'card_bankname'    => 'required',
        'card_number'     => 'required|numeric',
        'amount'        => 'required|numeric',
        'coin'          => 'required|alpha',
    ]);
    }

    $paymenttype = $request->paymenttype;

    if($paymenttype == 'Naijapaycard'){
    $bankid = $request->card_type;
    $account_no = $request->card_number;
    }else{
    $bankid = $request->bank_name;
    $account_no = $request->account_no;
    }

    $currency = $request->coin;

    $balance = 0;
    $fee = 0;
    $commissions = Commission::coindetails($currency);

            $uid = \Auth::id();
            $coin_data = UserCommission::where(['uid'=>$uid,'source' => $fiat_name])->first();
            if($coin_data){
            $commissions = UserCommission::coindetails($currency,$uid);
            }else{
            $commissions = Commission::coindetails($currency);
            }

    $fee = $commissions->netfee;
    $point_value = $commissions->point_value;

    $min_amount = $commissions->min_amount;
    $max_amount = $commissions->max_amount;

    if($paymenttype == 'Naijapaycard'){
    $commission = ($commissions->card_com / 100);
    }else{
    $commission = ($commissions->withdraw / 100);
    }

    $amount = abs($request->amount);
    $admin_amount = bcmul($commission, $amount,$point_value);
    if($admin_amount > $fee) {
        $admin_amount = $fee;
    }
    $debitamt = bcsub($amount, $admin_amount,$point_value);
    $balance = UsersWallet::where([['uid', '=', $uid],['currency',$currency]])->value('balance');
    if($amount >= $fee AND $amount > 0) {
        if($amount >= $min_amount && $amount <= $max_amount) {
        if($account_no!="") {
            $balance_leaverage = ncSub($balance,0,$point_value);
            if($balance_leaverage >= $amount) {
                $data['bankid'] =  $bankid;
                $data['toaddress'] =  $account_no;
                $data['amount'] =  $amount;
                $data['currency'] =  $currency;
                $data['paymenttype']   =  $paymenttype;

                Session::put('withdrawl', $data);
                if(\Auth::user()->twofa == 'google_otp') {
                    return Redirect('/withdrawconform');
                } else if(\Auth::user()->twofa == 'email_otp') {
                    $user = Auth::user();
                    $security = User::where('id', $uid)->first();
                    $rand = rand(100000,999999);
                    $security->profile_otp = $rand;
                    $security->save();
                    \Mail::to($user->email)->send(new SendOtpVerification($rand));
                    return Redirect('/withdrawconform');
                } else {
                    return $this->WithoutOTP();
                }
            }else {
                return redirect('/fiatwithdraw/'.$currency)->with('fail', "Insufficient fund in your $currency Wallet !!!.You need avilable balance $amount $currency");
            }
        }else {
            return redirect('/fiatwithdraw/'.$currency)->with('fail', 'Please enter valid '.$currency.' Address!');
        }

} else {
            return redirect('/fiatwithdraw/'.$currency)->with('fail', "Amount should be less than of ".$max_amount. " And minmum of ".$min_amount);
        }

    } else {
        return redirect('/fiatwithdraw/'.$currency)->with('fail', "Withdraw amount must be greater than or equal to $fee  $currency");
    }
    return Redirect::back();
}

function TransactionString($length = 15) {
    $str = "";
    $characters = array_merge(range('A','Z'), range('a','z'), range('0','9'));
    $max = count($characters) - 1;
    for ($i = 0; $i < $length; $i++) {
        $rand = mt_rand(0, $max);
        $str .= $characters[$rand];
    }
    return $str;
}


public function bankdropdown(Request $request)
{
    $uid= \Auth::id();
    $bank_name=$request->bank_name;
    $bankno= Bankuser::where(['uid'=> $uid,'id' => $bank_name])->first();

    $var['account_number']= $bankno->account_number;
    $var['id']= $bankno->id;
    echo json_encode($var);
}


    public function fiatdeposit(Request $request)
    {

        $fiat_name = $request->fiat_name;
        $coins = Commission::where([['source','=',$fiat_name],['type','=','fiat'],['status','=',1]])->first();

            $uid = \Auth::id();
            $coin_data = UserCommission::where(['uid'=>$uid,'source' => $fiat_name])->first();
            if($coin_data){
            $coins = UserCommission::where(['uid'=>$uid,'source' => $fiat_name])->first();
            }else{
            $coins = Commission::where([['source','=',$fiat_name],['type','=','fiat'],['status','=',1]])->first();
            }

        if(Auth::user()->kyc_verify == 1){
            if($coins){
                $user = Auth::user()->id;
                $admin_account = AdminBank::where('coin' , $fiat_name)->first();
                if($admin_account && $admin_account->count() > 0)
                {
                    $account = trim($admin_account->account," ");
                    $account_details = str_replace(array("\r\n", "\r", "\n"), "<br />", $account);
                    $depositfee = $coins->deposit_fee;
                    $admindepositfee = ncDiv($coins->deposit_fee,100,8);

                    return view('userpanel.fiatdeposit', ['currency' => $fiat_name, 'admin_account' => $account_details,'depositfee' => $depositfee,'admindepositfee' => $admindepositfee]);
                }else{
                    return redirect('wallet')->with('adminwalletbank','Admin bank details not available!');
                }
            }else{
                return redirect('wallet')->with('adminwalletbank','Invalid Coin/Currency');
            }
        }else{

            $url = url('/kyc');
                return redirect('security')->with('warning','Identity verification must be done and approved by the admin to withdraw or make Fiat currency deposits!'. '<a href="' . $url . '"> click here </a>');
        }

    }


    public function uploadProof(Request $request)
    {
        $user = Auth::user()->id;
        $currency = $request->currency;
        $validator = $this->validate($request, [
            'amount' => 'required|numeric',
            'proof' => 'required|mimes:jpeg,jpg,png|max:5120',
        ]);
        $amount = $request->amount;
        $admin_account = AdminBank::where('id' , 1)->first();
        if($admin_account && $admin_account->count() > 0)
        {
            $account = trim($admin_account->account," ");
            $account_details = str_replace(array("\r\n", "\r", "\n"), "<br />", $account);
        }

        if($amount > 0){

            if($this->imgvalidaion($_FILES['proof']['tmp_name']) == 1 ){
                $dir = 'proof/';
                $path = 'storage' . DIRECTORY_SEPARATOR .'app'. DIRECTORY_SEPARATOR.'public'. DIRECTORY_SEPARATOR. $dir;

                if(Input::hasFile('proof')){
                    $fornt = Input::File('proof');
                    $filenamewithextension = $fornt->getClientOriginalName();
                    $photnam = str_replace('.','',microtime(true));
                    $filename = pathinfo($photnam, PATHINFO_FILENAME);
                    $extension = $fornt->getClientOriginalExtension();
                    $photo = $filename.'.'. $extension;
                    $fornt->move($path, $photo);
                    $front_img = $path.$photo;
                }
                $deposit_request = new Deposit();
                $deposit_request->uid = $user;
                $deposit_request->orderid = TransactionString();
                $deposit_request->amount = $amount;
                $deposit_request->credit_amount = $amount;
                $deposit_request->proof = url($front_img);
                $deposit_request->currency = $currency;
                $deposit_request->type = 'wirepayment';
                $deposit_request->status = 0;

                if($deposit_request->save()){
                    \Session::flash('success', 'Proof Uploaded Successfully. Please wait for admin confirmation.');
                    return redirect('fiatdeposit/'.$currency)->with(['admin_account' => $account_details, 'currency' => $currency]);
                }else{
                    \Session::flash('error', 'Proof Uploaded Failed. Try Again!');
                    return redirect('fiatdeposit/'.$currency)->with(['admin_account' => $account_details, 'currency' => $currency]);
                }
            }else{
                 \Session::flash('error', 'Proof Uploaded Failed. Try Again!');
                    return redirect('fiatdeposit/'.$currency)->with(['admin_account' => $account_details, 'currency' => $currency]);
            }
        }else{
            \Session::flash('error', 'Enter amount should be above zero.');
            return redirect('fiatdeposit/'.$currency)->with(['admin_account' => $account_details, 'currency' => $currency]);
        }
    }



    public function imgvalidaion($img)
    {
      $myfile = fopen($img, "r") or die("Unable to open file!");

      $value = fread($myfile,filesize($img));

      if (! empty($value) && strpos($value, "<?php") !== false) {
        $img = 0;
      }
      elseif (! empty($value) && strpos($value, "<?=") !== false){
        $img = 0;
      }
      elseif (! empty($value) && strpos($value, "eval") !== false) {
        $img = 0;
      }
      elseif (! empty($value) && strpos($value,"<script") !== false) {
        $img = 0;
      }else{
        $img=1;
      }

      fclose($myfile);

      return $img;
    }
}
