<?php
namespace App\Http\Controllers\API;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\User;
use App\Models\UsersApi;
use App\Models\Country;
use App\Models\UsersWallet;
use App\Models\UserMerchant;
use App\Models\UsersWithdraw;
use App\Models\UsersApiSetting;
use App\Models\OrderTransaction;
use App\Models\BuyerInformation;
use App\Models\LivePrice;
use App\Models\Commission;
use App\Models\UsersPaymentAddress;
use Mail;
use App\Mail\EmailVerification;
use App\Mail\Forgetpassword;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Str;
use Illuminate\Routing\Route;
use App\Traits\Fireblock;
use Session;

use App\Traits\BtcClass;
use App\Traits\EvmClass;
use App\Traits\TrcClass;
use App\Traits\EthClass;
use App\Traits\TokenERCClass;
use App\Traits\Ipn;

use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ApiController extends Controller
{

    use BtcClass,EvmClass,TrcClass,Ipn;

    public $successStatus = 200;

     public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'publickey' => 'required',
            'privatekey' => 'required'
        ]);
        if ($validator->fails()) { 
            return response()->json(["success" => false,'result' => NULL,'message'=> $validator->errors()->first()], 200);           
        }

        $credentials = request(['publickey', 'privatekey']);
        $publickey= $request->publickey;
        $privatekey= $request->privatekey;
        $UsersApi= UsersApi::where(['public_key' => $publickey,'private_key' => $privatekey])->first();

        if(!$UsersApi)
            return response()->json([
                'success' => false,
                'result' => '',
                'message' => 'Unauthorized',
               
            ], 401);
        $uid = $UsersApi->user_id;
        $user = User::where('id',$uid)->first();


        if($user->email_verify !=1 )
        {return response()->json(["success" => false,'result' => null,'message'=> 'Email not verfiy!']);}

        $tokenResult = $UsersApi->createToken($user->name);
        $token = $tokenResult->token;
        $token->save();

        $success = [            
            'access_token' => 'Bearer '.$tokenResult->accessToken,
            'expires_at' => Carbon::parse(
                $tokenResult->token->expires_at
            )->toDateTimeString(),
        ];

      
        
        return response()->json(['success' => true,'result'=> $success, 'message' => 'Login successfully!'], $this->successStatus);
    }

    public function accesscheck($access)
    {
        $uid = Auth::user()->user_id;
        $apiid = Auth::user()->id;
        $check = UsersApiSetting::where(['api_id' =>$apiid,'uid' => $uid ])->value($access);

        return $check;
    }


    public function accesscheckwithoutauth($access,$uid)
    {

        $user = User::where('id',$uid)->first();
        $uid = $user->id;
        $check = UsersApiSetting::where(['uid' => $uid ])->value($access);
        return $check;
    }


    public function GetBasicInfo() 
    { 

        $uid = Auth::user()->user_id;
        $basicinfo = $this->accesscheck('basicinfo');

        if($basicinfo == 1)
        {
            $merchant = UserMerchant::where('uid',$uid)->first(); 
            $result['username'] =$merchant->userdetails['name'];
            $result['merchant_id'] = $merchant->merchant_id;
            $result['email'] =$merchant->userdetails['email'];
            $result['public_name'] =$merchant->userprofile['display_name'] !="" ? $merchant->userprofile['display_name'] : "";  
        }
        else
        {
            $result ='Access denied!';
        }
     
        return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
    }



   public function WalletBalances(){ 

        $uid = Auth::user()->user_id;
        $balance = $this->accesscheck('balance');
        if($balance == 1)
        {
            $balance= UsersWallet::GetUserBalance($uid,'BTC');
            $result['BTC']['balance'] =$balance;
            $result['BTC']['balancef'] = $this->sathosi($balance); 
        }
        else
        {
            $result ='Access denied!';
        }
       
        return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
    }

    public function GetDepositAddress() 
    {
        $uid = Auth::user()->user_id;
        $deposit = $this->accesscheck('deposit');
        $apiid = Auth::user()->id;

        if($deposit == 1)
        {
            $basicinfo = UsersApiSetting::where(['api_id' =>$apiid,'uid' => $uid ])->value('basicinfo');

            $address= UsersWallet::GetUserAddress($uid,'BTC');
            $result['address'] =$address;
        }
        else
        {
            $result ='Access denied!';
        }

        return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
    }


    public function GetTxInfoMulti() 
    { 

        $uid = Auth::user()->user_id;
        $transaction = $this->accesscheck('transaction');

        if($transaction == 1)
        {
            $result= OrderTransaction::where('uid',$uid)->limit(25)->get();
        }
        else
        {
            $result ='Access denied!';
        }
        return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
    }


    public function GetTxInfo(Request $request) 
    { 
        $validator = Validator::make($request->all(),[ 
            'txid'   => 'required'
        ]);

        if ($validator->fails()) { 
        return response()->json(['error'=> false,'result' => $validator->errors()->first()], 200);           
        }
        $uid = Auth::user()->user_id;
        $txid = $request->txid;
        $transaction =$this->accesscheck('transaction');

        if($transaction == 1)
        {

          $result= OrderTransaction::getOneData($uid,$txid);
        }
        else
        {
            $result ='Access denied!';
        }
        return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
    }


    public function GetTxIds(Request $request) 
    {
        $uid = Auth::user()->user_id;
        $transaction =$this->accesscheck('transaction');

        if($transaction == 1)
        {
             $result= OrderTransaction::listView($uid,100,0);
        }
        else
        {
            $result ='Access denied!';
        }

        return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
    }



    public function CreateTransfer(Request $request) 
    {
        $uid = Auth::user()->user_id;
        $withdraw = $this->accesscheck('withdraw');
        if($withdraw == 1)
        {

            $validator = Validator::make($request->all(),[ 
                'toaddress' => 'required|alpha_num',
                'amount' => 'required|numeric',
                'currency' => 'required|alpha',
                'network' => 'required',
            ]);

            if ($validator->fails()) { 
            return response()->json(['error'=> false,'result' => $validator->errors()->first()], 200);           
            }

            $to_address =$request->toaddress;
            $currency = $request->currency;
            $network = $request->network;
            $amount =$request->amount;
            $uid = Auth::user()->user_id;

            $balance = 0;
            $btcDeatils = Commission::where('source', $currency)->first();
            if(!$btcDeatils){
            return response()->json(['error'=> false,'result' => "Invalid Currency"], 200);           
            }
            $commission = ($btcDeatils->withdraw / 100);
            $amount = abs($request->amount);
            $fee = $btcDeatils->netfee;
            $admin_amount = bcmul($commission, $amount,8);
            $debitamt1 = bcadd($admin_amount, $fee,8);
            $debitamt = bcsub($amount, $debitamt1,8);
            $balance = UsersWallet::where([['uid', '=', $uid],['currency',$currency]])->value('balance');


                 if($amount >= $fee AND $amount!="")
                 {
                        if($to_address!="")
                        {

                           if($balance >= $amount)
                            {
                                $id = $this->withdrawconfirm($to_address,$currency,$amount,$network);
                                return response()->json(['error' => 'ok','result'=> $id], $this-> successStatus);
                            }
                            else
                            {
                                  return response()->json(['error' => false,'result'=>  "Insufficient fund in your ".$currency." Wallet !!!.You need  ".$amount."  ".$currency], $this-> successStatus);  
                            }
                        }
                        else{

                            return response()->json(['error' => false,'result'=>'Please enter valid '.$currency.' Address!'], $this-> successStatus); 

                        } 

                 }
                 else
                 {
                    return response()->json(['error' => 'ok','result'=>" Withdraw amount must be greater than or equal to".$fee ." ".$currency], $this-> successStatus); 
                 }
        }
        else
        {
            $result ='Access denied!';
            return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
        }

    }
     public function withdrawconfirm($to_address,$currency,$amount,$network)
    {

            $balance = 0;
            $btcDeatils = Commission::where('source', $currency)->first();
            $uid = Auth::user()->user_id;
            if($btcDeatils)
            {
                    $type = $btcDeatils->type;
                    $decimal = $btcDeatils->point_value;
                    $commission = bcdiv($btcDeatils->withdraw,100,8);
                    $amount = abs($amount);
                    $fee = display_format($btcDeatils->netfee,8);
                    $admin_amount = bcmul($commission, $amount,8);
                    $debitamt1 = bcadd($admin_amount, $fee,8);
                    $debitamt = bcsub($amount, $debitamt1,8);
                    $balance = UsersWallet::where([['uid', '=', $uid],['currency',$currency]])->value('balance');

                    $sathosiamount = $this->sathosi($amount);
                    $network = $network;
                    //$wallet = UsersWallet::debitAmount($uid,$currency,$amount,$decimal);

                    $autowithdrawstatus = 0;
                    if($btcDeatils->autowithdraw > $amount) {
                        $autowithdrawstatus = 1;
                    }
                    $Withdrawid = UsersWithdraw::createTransaction($uid,$currency,$wallet->mukavari,$to_address,$amount,$debitamt1,$debitamt,$sathosiamount,$autowithdrawstatus,$network);

                    $type = "Withdraw";
                    $remark = "Withdraw ".$amount." ".$currency." successfully";

                    $wallet = UsersWallet::debitAmount($uid,$currency,$amount,$decimal,$type,$remark,$Withdrawid);

                    $result['id'] = $Withdrawid;
                    $result['status'] = 1;
                    return $result;

            }else{

                 return $result = "Invalid Request! Please try again";

            } 
    }

    public function Convert(Request $request) 
    { 

        $uid = Auth::user()->user_id;
        $convert_coins = $this->accesscheck('convert_coins');
        if($convert_coins == 1)
        {
        
            $validator = Validator::make($request->all(),[ 
            'to'   => 'required'
            ]);

            if ($validator->fails()) { 
            return response()->json(['error'=> false,'result' => $validator->errors()->first()], 200);           
            }
            $uid = Auth::user()->user_id;
            $to = $request->to;
            $coin = 'BTC';
            //$price = LivePrice::where(['fcoin' => $coin,'tcoin' => $to])->value('price');  

            $coin_price  =array();
            $balance = UsersWallet::GetUserBalance($uid,$coin);
            $list = LivePrice::where(['fcoin' => $coin,'tcoin' => $to])->first();
            $coin_price = $list->price;
            $data = ncmul($coin_price,$balance);



            return response()->json(['error' => 'ok','result'=> display_format($data,8)], $this-> successStatus); 
        }
        else
        {
            $results ='Access denied!';

            return response()->json(['error' => 'ok','result'=> $results], $this-> successStatus);
        }
   
    }

    public function GetWithdrawalHistory(Request $request) 
    {
        $uid = Auth::user()->user_id;
        $withdraw = $this->accesscheck('withdraw_history');
        if($withdraw == 1)
        {

            $variable = UsersWithdraw::where(['user_id' => $uid])->orderBy('id', 'desc')->offset(0)->limit(100)->get();   

            if($variable)
            {
                $withdraw =array();
                foreach ($variable as $key => $query) {
                        $withdraw[$key]['id'] = $query->id;
                        $withdraw[$key]['time_created'] = strtotime($query->created_at);
                        $withdraw[$key]['status'] = $query->status;
                        $withdraw[$key]['status_text'] = $query->remark;
                        $withdraw[$key]['coin'] = $query->coin_name;
                        $withdraw[$key]['amount'] = display_format($query->amount,8);
                        $withdraw[$key]['amountf'] = display_format($query->admin_fee,8);
                        $withdraw[$key]['send_address'] = $query->sender;
                        $withdraw[$key]['send_txid'] = $query->transaction_id;
                }
            }
            else
            {
                $withdraw = NULL;
            }
        }
        else
        {
            $withdraw ='Access denied!';
        }


        return response()->json(['error' => 'ok','result'=> $withdraw], $this-> successStatus); 
    }

    public function GetWithdrawalInfo(Request $request) 
    {

        $uid = Auth::user()->user_id;
        $withdraw =$this->accesscheck('withdraw_history');
        if($withdraw == 1)
        {

                $validator = Validator::make($request->all(),[ 
                    'id'   => 'required'
                ]);

                if ($validator->fails()) { 
                return response()->json(['error'=> false,'result' => $validator->errors()->first()], 200);           
                }

                $uid = Auth::user()->user_id;
                $id = $request->id;
                $query = UsersWithdraw::where(['user_id' => $uid,'id'=>$id])->first();   
                    if($query)
                    {
                        $date = strtotime($query->created_at);
                        $res['time_created'] =$date;
                        $res['status'] = $query->status;
                        $res['status_text'] = $query->remark;
                        $res['coin'] = $query->coin_name;
                        $res['amount'] = display_format($query->amount,8);
                        $res['amountf'] = display_format($query->admin_fee,8);
                        $res['send_address'] = $query->sender;
                        $res['send_txid'] = $query->transaction_id;
                    }
                    else
                    {
                        $res = NULL;
                    }
        }
        else
        {
            $res ='Access denied!';
        }

       
        return response()->json(['error' => 'ok','result'=> $res], $this-> successStatus); 
    }

    public function sumSubKYC(Request $request){
        return response()->json(['success' => 'ok'], 200);
    }

    public function CreateTransaction(Request $request) 
    { 

            $item_name = "";
            $item_desc = "";
            $item_number = 1;
            $invoice = "";
            $custom = "";
            $on1 = "";
            $ov1 = 0;
            $on2 = "";
            $ov2 =0;
            $extra = "";

        $uid = Auth::user()->user_id;
        $transaction = $this->accesscheck('transaction');

        if($transaction == 1)
        {
            $validator = Validator::make($request->all(),[ 
            'amount'   => 'required',
            'currency1'   => 'required',
            'currency2'   => 'required',
            'buyer_email'   => 'required',
            'ipn_url'   => 'required'
            ]);

            if ($validator->fails()) { 
            return response()->json(['error'=> false,'result' => $validator->errors()->first()], 200);           
            }
            $uid = Auth::user()->user_id;
            $txn_id     = 'WFI'.keygenerate();
            $currency1 = $request->currency1;
            $currency2 = $request->currency2;
            $amount = $request->amount;
            $subtotal = $request->amount;
            $buyer_email = $request->buyer_email;
            $ipn_url = $request->ipn_url;
            $item_amount = $request->amount;
            $secret = TransactionString();
            
            $currency2 = strtoupper($currency2);
            $currency1 = strtoupper($currency1);

            $comCheck = Commission::where('source',$currency2)->first();
            if(!$comCheck){
            return response()->json(['error'=> false,'result' => 'Invalid currency2.'], 200);           
            }
            
            if($currency1 == 'USD' || $currency1 == 'NGN'){
                $lprice = LivePrice::GetLivePrice($currency2,$currency1);
                $amount2    = ncDiv($amount,$lprice);
            }else{
                $amount2    = $amount;
                $currency2 = strtoupper($request->currency1);
            }

            $comCheck = Commission::where('source',$currency2)->first();
            if(!$comCheck){
            return response()->json(['error'=> false,'result' => 'Invalid currency2.'], 200);           
            }
          //  $address = $this->createaddress_btc($txn_id,$secret);
            //dd($currency2);
            // if($currency2 == 'BTC') {
            //     $address = $this->createaddress_btc($txn_id,$secret);
            // } elseif($currency2 == 'ETH') {
            //     $address = $this->createaddress_eth($txn_id,$secret);
            // } elseif($currency2 == 'USDT') {
            //     $address = $this->createaddress_erctoken($txn_id,$secret);
            // } else {
            // return response()->json(['error'=> false,'result' => 'Invalid transaction.Please check!.'], 200);
            // }

            //return response()->json(['error' => 'ok','result'=> $comCheck], $this-> successStatus);

            if($comCheck->source == 'BTC' && $comCheck->type =='coin'){
                $data = $this->createPaymentAddressBTC();
            }else if($comCheck->source == 'TRX' || $comCheck->type =='TRC20'){
                $data = $this->createPaymentAddressTRX();
            }else{
                $data = $this->createPaymentAddressETH();
            }
            $address = $data['address']; 
            $pvtkey = $data['pvtkey'];
            $address = UsersPaymentAddress::createPaymentAdress($comCheck->source,$comCheck->type,$txn_id,$secret,$address,$pvtkey);
            if(empty($address)) {
                return view('payments.error',['message'=> 'Invalid transaction.Please check!']);
            }

            if(!$address){
            $block = BlockAddress::where('status',0)->orderBy('id', 'asc')->first();
            $address = $block->address;
            $secret =  $block->secret;
            }

            $order = OrderTransaction::ApiCreateTransaction($uid,$txn_id,$currency1,$currency2,$amount2,$amount2,$subtotal,0,$item_amount,$item_name,$item_desc,$ipn_url,1,$item_number,$invoice,$custom,$on1,$ov1,$on2,$ov2,$extra,$secret,$address);
            $oid = $order->id;

            $user =User::where('id',$uid)->first();
            $first_name = $user->name; 
            $last_name  = $user->name;
            $email      = $buyer_email;

            $buyer = BuyerInformation::CreateBuyer($oid,$first_name,$last_name,$company=null,$email);

            $result['amount'] = $amount2;
            $result['address'] = $address;
            $result['txn_id'] =$txn_id;
            $result['confirms_needed'] = $order->received_confirms;
            $result['timeout'] = '9000';
            // $result['qrcode_url'] = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl='.$address;

            $qrCodeImage = QrCode::size(300)->generate($address);
            $base64QrCode = base64_encode($qrCodeImage);
            $result['qrcode_url'] = 'data:image/svg+xml;base64,' . $base64QrCode;

        } else {
            $result ='Access denied!';
        }
        return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
    }  


    public function CreateTransactionWithoutAuth(Request $request) 
    { 

            $item_name = "";
            $item_desc = "";
            $item_number = 1;
            $invoice = "";
            $custom = "";
            $on1 = "";
            $ov1 = 0;
            $on2 = "";
            $ov2 =0;
            $extra = "";

        $merchant_data = UserMerchant::where('merchant_id',$request->merchant_id)->first();    
        $uid = $merchant_data->uid;
        $user = User::where('id',$uid)->first();
        
        $transaction = $this->accesscheckwithoutauth('transaction',$uid);

        if($transaction == 1)
        {
            $validator = Validator::make($request->all(),[ 
            'amount'   => 'required',
            // 'currency1'   => 'required',
            // 'currency2'   => 'required',
            'buyer_email'   => 'nullable',
            'ipn_url'   => 'required',
            'merchant_id' => 'required',
            'network' => 'required',
            'coin'   => 'required',
            ]);

            if ($validator->fails()) { 
            return response()->json(['error'=> false,'result' => $validator->errors()->first()], 200);           
            }
            
            $txn_id     = 'WFI'.keygenerate();
            $coin = $request->coin;
            $network = $request->network;
            $amount = $request->amount;
            $subtotal = $request->amount;
            $buyer_email = (isset($request->buyer_email) && $request->buyer_email !='') ? $request->buyer_email : $user->email;
            $ipn_url = $request->ipn_url;
            $item_amount = $request->amount;
            $secret = TransactionString();

            $comCheck = Commission::where('source',$coin)->first();
            if(!$comCheck){
            return response()->json(['error'=> false,'result' => 'Invalid coin'], 200);           
            }
            
            // if($coin == 'USD' || $coin == 'NGN'){
            // $lprice = LivePrice::GetLivePrice($currency2,$currency1);
            // $amount2    = ncDiv($amount,$lprice);
            // }else{
            // $amount2    = $amount;
            // $currency2 = $coin;
            // }

            $comCheck = Commission::where('source',$coin)->first();
            if(!$comCheck){
            return response()->json(['error'=> false,'result' => 'Invalid coin.'], 200);           
            }
          //  $address = $this->createaddress_btc($txn_id,$secret);
            //dd($currency2);
            // if($currency2 == 'BTC') {
            //     $address = $this->createaddress_btc($txn_id,$secret);
            // } elseif($currency2 == 'ETH') {
            //     $address = $this->createaddress_eth($txn_id,$secret);
            // } elseif($currency2 == 'USDT') {
            //     $address = $this->createaddress_erctoken($txn_id,$secret);
            // } else {
            // return response()->json(['error'=> false,'result' => 'Invalid transaction.Please check!.'], 200);
            // }


            if($coin == 'BTC' && $comCheck->type =='coin'){
                $data = $this->createPaymentAddressBTC();
            }else if($coin == 'TRX' || $comCheck->type =='TRC20'){
                $data = $this->createPaymentAddressTRX();
            }else{
                $data = $this->createPaymentAddressETH();
            }
            $address = $data['address']; 
            $pvtkey = $data['pvtkey'];
            $address = UsersPaymentAddress::createPaymentAdress($coin,$network,$txn_id,$secret,$address,$pvtkey);
            if(empty($address)) {
                return view('payments.error',['message'=> 'Invalid transaction.Please check!']);
            }

            if(!$address){
            $block = BlockAddress::where('status',0)->orderBy('id', 'asc')->first();
            $address = $block->address;
            $secret =  $block->secret;
            }

            $order = OrderTransaction::ApiCreateTransaction($uid,$txn_id,$coin,$coin,$amount,$amount,$subtotal,0,$item_amount,$item_name,$item_desc,$ipn_url,1,$item_number,$invoice,$custom,$on1,$ov1,$on2,$ov2,$extra,$secret,$address);
            $oid = $order->id;

            $user =User::where('id',$uid)->first();
            $first_name = $user->name; 
            $last_name  = $user->name;
            $email      = $buyer_email;

            $buyer = BuyerInformation::CreateBuyer($oid,$first_name,$last_name,$company=null,$email);

            $result['amount'] = $amount;
            $result['address'] = $address;
            $result['txn_id'] =$txn_id;
            $result['confirms_needed'] = $order->received_confirms;
            $result['timeout'] = '9000';
            // $result['qrcode_url'] = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl='.$address;

            $qrCodeImage = QrCode::size(300)->generate($address);
            $base64QrCode = base64_encode($qrCodeImage);
            $result['qrcode_url'] = 'data:image/png;base64,' . $base64QrCode;

        } else {
            $result ='Access denied!';
        }
        return response()->json(['error' => 'ok','result'=> $result], $this-> successStatus); 
    }  

    public function sathosi($amount){
		if(!empty($amount)){
			return 100000000 * $amount;
		}
	}

    public function GetTransactionWithoutAuth(Request $request) 
    { 
        $validator = Validator::make($request->all(),[ 
            'txid'   => 'required',
            'merchant_id' => 'required',
        ]);

        if ($validator->fails()) { 
        return response()->json(['error'=> false,'result' => $validator->errors()->first()], 200);           
        }

        $merchant_data = UserMerchant::where('merchant_id',$request->merchant_id)->first();    
        $uid = $merchant_data->uid;
        $user = User::where('id',$uid)->first();
        $txid = $request->txid;
        $transaction =$this->accesscheckwithoutauth('transaction',$uid);

        

        if($transaction == 1)
        {

          $result= OrderTransaction::getOneData($uid,$txid);

          if($result->status == -1){
                $status = "failed";
          }else if($result->status == 100){
                $status = "confirmed";
          }else if($result->status == 0){
            $status = "waiting";
          }else{
            $status = "waiting";
          }

          $data = [];
          $data['txn_id'] = $result->txn_id;
          $data['payment_address'] = $result->payment_address;
          $data['coin'] = $result->currency1;
          $data['amount'] = $result->amount1;
          $data['subtotal'] = $result->subtotal;
          $data['item_amount'] = $result->item_amount;
          $data['item_name'] = $result->item_name;
          $data['quantity'] = $result->quantity;
          $data['received_amount'] = $result->received_amount;
          $data['received_confirms'] = $result->received_confirms;
          $data['status'] = $status;
          $data['status_text'] = $result->status_text;;
        }
        else
        {
            $result ='Access denied!';
        }
        return response()->json(['error' => 'ok','result'=> $data], $this-> successStatus); 
    }

}