<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Validator;
use Auth;
use App\Models\UserMerchant;
use Session;
use App\Models\Country;
use App\Models\OrderTransaction;
use App\Models\BuyerInformation;
use App\Models\ShippingInformation;
use App\Models\Commission;
use App\Models\UsersProfile;
use App\Models\UsersWallet;
use App\Models\BlockAddress;
use App\Models\MerchantSetting;
use App\Models\UsersPaymentAddress;
use App\User;
use App\Traits\Fireblock;
use App\Traits\Ipn;
use App\Mail\IpnVerification;
use Mail;
use App\Models\LivePrice;
use App\Models\InvoiceDetails;
use App\Models\ItemDetails;
use App\Libraries\BitGo;

use App\Traits\BtcClass;
use App\Traits\EvmClass;
use App\Traits\TrcClass;

class TransactionController extends Controller
{
    use BtcClass,EvmClass,TrcClass,Ipn;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cmd'      => 'required|alpha_dash|max:50',
            'merchant'      => 'required|alpha_num|max:50',
            'currency'      => 'required |alpha| max:5',
            'amount'       => 'required |numeric| min:0.0001',
            'item_name'     => 'required|max:180',
            'item_desc'     => 'max:180',
            'want_shipping' => 'required|boolean',
            'success_url'   => 'nullable|url',
            'cancel_url'    => 'nullable|url',
        ]);
        if ($validator->fails()) {  
            return view('payments.error',['message'=> $validator->errors()->first()]);          
        }
        if($request->currency == 'USD' || $request->currency == 'ETH' || $request->currency == 'USDT' || $request->currency == 'BTC'){
            if(($request->currency == 'USD') && $request->amount < 5){
                return view('payments.error',['message'=> 'Payment Amount must be greater than 5 '.$request->currency.'!']);
            }
            $data = UserMerchant::getData($request->merchant);
            if($data){
                \Session::put('payments', $request->all());
                return redirect('/checkout');
            }else{
                return view('payments.error',['message'=> 'Invalid merchant ID.Please check!']);
            }
        }
        else{
            return view('payments.error',['message'=> 'Invalid Currency.Incorrect currency symbol you pass!']);
        }
      
    }


    /**
     * Display the specified resource.
     *
     * @param  \App\Transaction  $transaction
     * @return \Illuminate\Http\Response
     */
    public function showCheckout(Transaction $transaction)
    {
        $ses = \Session::get('payments');
        $mid = $ses['merchant'];
        $merchant = UserMerchant::getData($mid);
        if(isset($merchant->userprofile->display_name)){
            $dpname = $merchant->userprofile->display_name;
        }else{
            $dpname = $merchant->userdetails->username;
        }
        $country = Country::get();
        if($ses['currency'] == 'USD' || $ses['currency'] == 'EUR'){
            $comDetails = Commission::get();
        }else{
            $comDetails = Commission::where('source',$ses['currency'])->get();
        }
        
        return view('payments.create-payement',['payments'=> $ses,'merchant' => $merchant,'dpname' => $dpname,'country' => $country,'comDetails' => $comDetails]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function CreateTransaction(Request $request)
    {
        $ses = \Session::get('payments');
        if($ses['want_shipping'] == 1){
			$message['address1.regex'] = 'Allowed only special characters without space!';
			$message['address2.regex'] = 'Allowed only special characters without space!';
			$message['zipcode.regex'] = 'Special characters not allowed!';
			$message['phoneno.regex'] = 'Allowed only special characters without space!';
			
            $this->validate($request,[
                'first_name'   => 'required|regex:/^[\pL\s\-]+$/u|max:30',
                'last_name'    => 'required|regex:/^[\pL\s\-]+$/u|max:30',
                'email'        => 'required|email|max:60',
                'address1'     => 'required|regex:/^[\w]+([:,-_\s]{1}[a-zA-Z0-9]+)*$/i|max:100',
                'address2'     => 'nullable|regex:/^[\w]+([,-_\s]{1}[a-zA-Z0-9]+)*$/i|max:100',
                'city'         => 'required|regex:/^[\pL\s\-]+$/u|max:30',
                'country'      => 'required|numeric',
                'state'        => 'required|regex:/^[\pL\s\-]+$/u|max:30',
                'zipcode'      => 'required|regex:/^[\w]+([,-_\s]{1}[a-zA-Z0-9]+)*$/i|max:8',
                'phoneno'      => 'required|regex:/^[\w]+([+-_\s]{1}[0-9]+)*$/i|max:15',
                'total'        => 'required|numeric',
            ],$message);
        }else{
            $this->validate($request,[
                'first_name'   => 'required|regex:/^[\pL\s\-]+$/u|max:30',
                'last_name'    => 'required|regex:/^[\pL\s\-]+$/u|max:30',
                'email'        => 'required|email|max:60',
                'total'        => 'required|numeric',
            ]);
        }
        $item_amount = $item_desc = $ipn_url =  $item_number = $invoice = $custom = $on1 = $ov1 = $on2 = $ov2 = $extra ='';

        $quantity = 1;
        $item_number = 0;
        $ov1        =  $ov2 = 0;
        $mid        = $ses['merchant'];
        $merchant   = UserMerchant::getData($mid);
        $uid        = $merchant->userdetails->id;
        $txn_id     = 'FC'.keygenerate();
        $currency1  = $ses['currency'];        
        $currency2  = $request->currency2;        
        $amount1    = $ses['amount'];
        $comDetails = Commission::where('source',$currency2)->first();
        if(!is_object($comDetails)){
            return view('payments.error',['message'=> 'Invalid Coin/Currency.Please check!']);
        }
        if($currency1 == 'USD' || $currency1 == 'EUR'){
            $lprice = LivePrice::GetLivePrice($currency2,$currency1);
            $amount2    = ncDiv($ses['amount'],$lprice);
        }else{
            $amount2    = $ses['amount'];
        }
        
        //dd($amount2);

        $cmd   = $ses['cmd'];
        $subtotal   = $ses['amount'];
        $subtotal   = $request->total;
        $shipping   = $ses['want_shipping'];
       

        if(isset($ses['item_amount'])){
            $item_amount   = $ses['item_amount'];
        }
        if(isset($ses['item_desc'])){
            $item_desc   = $ses['item_desc'];
        }
        if(isset($ses['ipn_url'])){
            $ipn_url   = $ses['ipn_url'];
        }
        if(isset($ses['quantity'])){
            $ipn_url   = $ses['quantity'];
        }
        if(isset($ses['item_number'])){
            $item_number   = $ses['item_number'];
        }

         if(isset($ses['tax'])){
            $tax   = $ses['tax'];
        }
         if(isset($ses['fee'])){
            $fee   = $ses['fee'];
        }
         if(isset($ses['net'])){
            $net   = $ses['net'];
        }
        
        if(isset($ses['invoice'])){
            $invoice   = $ses['invoice'];
        }
        if(isset($ses['custom'])){
            $custom   = $ses['custom'];
        }
        if(isset($ses['on1'])){
            $on1   = $ses['on1'];
        }
        if(isset($ses['ov1'])){
            $ov1   = $ses['ov1'];
        }
        if(isset($ses['on2'])){
            $on2   = $ses['on2'];
        }
        if(isset($ses['ov2'])){
            $ov2   = $ses['ov2'];
        }
        if(isset($ses['extra'])){
            $extra   = $ses['extra'];
        }
        $item_name = $ses['item_name'];
        $secret = TransactionString();        
        $coin = strtolower($currency2);
        //Generate Address internally
        if($currency2 == 'BTC' && $comDetails->type =='coin'){
            $data = $this->createPaymentAddressBTC();
        }else if($coin == 'TRX' || $comDetails->type =='TRC20'){
            $data = $this->createPaymentAddressTRX();
        }else{
            $data = $this->createPaymentAddressETH();
        }
        $address = $data['address']; 
        $pvtkey = $data['pvtkey'];
        $address = UsersPaymentAddress::createPaymentAdress($currency2,$comDetails->type,$txn_id,$secret,$address,$pvtkey);
        if(empty($address)) {
            return view('payments.error',['message'=> 'Invalid transaction.Please check!']);
        }
        /*
        //dd($address);
        if(!$address){
            $block = BlockAddress::where('status',0)->orderBy('id', 'asc')->first();
           $address = $block->address;
           $secret =  $block->secret;
        }*/
         
        $order = OrderTransaction::CreateTransaction($uid,$cmd,$txn_id,$currency1,$currency2,$amount1,$amount2,$subtotal,$shipping,$item_amount,$item_name,$item_desc,$ipn_url,$quantity,$item_number,$invoice,$custom,$on1,$ov1,$on2,$ov2,$extra,$secret,$address);
        $oid = $order->id;
        $first_name = $request->first_name; 
        $last_name  = $request->last_name;
        $email      = $request->email;
        $buyer = BuyerInformation::CreateBuyer($oid,$first_name,$last_name,$company=null,$email);
        if($order->shipping == 1){
            $address1   = $request->address1;
			$address2   ='';
			if(isset($request->address2)){
				$address2   = $request->address2;
			}
            
            $city       = $request->city;
            $state      = $request->state;
            $zip        = $request->zipcode;
            $country    = $request->country;
            $phone      = $request->phoneno;
            $shipping = ShippingInformation::CreateShipping($oid,$address1,$address2,$city,$state,$zip,$country,$phone);
        }
        $ipnmail    = MerchantSetting::GetData($uid);
        $user       = User::where('id', $uid)->first();
        $sitename   = config('app.name');                
        if($ipnmail){
            $receive_mail = explode(",",$ipnmail['receive_mail']);
            if(in_array(1, $receive_mail)){
                //Mail sended
                $sub = "User submits a new payment to you on your ".$sitename;
                $message = "User submits a new payment of BTC ".$item_amount." on your ".$sitename." account on ".date('d-M-Y',time());
                $this->sendEmailIpn($user,$sub,$message);
            }
        }
        return redirect('/payment-scan/'.$txn_id);
        
    }
    public function posDeposit(Request $request){
        $validator = Validator::make($request->all(), [
            'cmd'           => 'required|alpha_dash|max:50',
            'merchant'      => 'required|alpha_num|max:50',
            'currency'      => 'required |alpha| max:15',
            'amount'       => 'required |numeric| min:0.0001',
            'item_name'     => 'nullable|regex:/^[\pL\s\-]+$/u|max:50',
            'item_desc'     => 'nullable|max:50',
            'want_shipping' => 'required|boolean',
            'item_number' => 'nullable|numeric',
            'invoice' => 'nullable',
            'custom' => 'nullable',
            'ipn_url' => 'nullable',
        ]);
        if ($validator->fails()) {  
            return view('payments.error',['message'=> $validator->errors()->first()]);          
        }
        $comDetails = Commission::where('source',$request->currency)->first();
        if(!is_object($comDetails)){
            return view('payments.error',['message'=> 'Invalid Coin/Currency.Please check!']);
        }
        \Session::put('payments', $request->all());
        $item_amount = $item_desc = $ipn_url =  $item_number = $invoice = $custom = $on1 = $ov1 = $on2 = $ov2 = $extra =  '';
        $quantity = 1;
        $item_number = 0;
        $ov1        =  $ov2 = 0;
        $mid = $request->merchant;
        $merchant   = UserMerchant::getData($mid);
        $uid        = $merchant->userdetails->id;
        $txn_id     = 'FC'.keygenerate();
        $cmd  = $request->cmd;        
        $currency1  = $request->currency;        
        $currency2  = $request->currency;        
        $amount1    = $request->amount;
        $amount2    = $request->amount;
        $subtotal   = $request->amount;
        $shipping   = $request->want_shipping;
        $invoice   = $request->invoice ? $request->invoice : null;
        $ipn_url   = $request->ipn_url ? $request->ipn_url : null;
        $custom   = $request->custom ? $request->custom : null;
        $item_name   = $request->item_name ? $request->item_name : null;
        $item_desc   = $request->item_desc ? $request->item_desc : null;
        $item_number   = $request->item_number ? $request->item_number : 1;
        $secret = TransactionString();

        if($currency2 == 'BTC' && $comDetails->type =='coin'){
            $data = $this->createPaymentAddressBTC();
        }else if($coin == 'TRX' || $comDetails->type =='TRC20'){
            $data = $this->createPaymentAddressTRX();
        }else{
            $data = $this->createPaymentAddressETH();
        }
        $address = $data['address']; 
        $pvtkey = $data['pvtkey'];
        $address = UsersPaymentAddress::createPaymentAdress($currency2,$comDetails->type,$txn_id,$secret,$address,$pvtkey);
        if(empty($address)) {
            return view('payments.error',['message'=> 'Invalid transaction.Please check!']);
        }

        $order = OrderTransaction::CreateTransaction($uid,$cmd,$txn_id,$currency1,$currency2,$amount1,$amount2,$subtotal,$shipping,$item_amount,$item_name,$item_desc,$ipn_url,$quantity,$item_number,$invoice,$custom,$on1,$ov1,$on2,$ov2,$extra,$secret,$address);
        return redirect('/payment-scan/'.$txn_id);
    }

    public function PaymentCrypto($txid){
        $ses = \Session::get('payments');
        $mid = $ses['merchant'];
        $merchant = UserMerchant::getData($mid);
        $uid    = $merchant->userdetails->id;        
        $order  = OrderTransaction::where(['txn_id' => $txid ,'uid' => $uid])->first();
        if(isset($ses['currency'])){
            $coin   = $ses['currency'];
        }else{            
            $coin   = $order->currency2;
        }
        $coins  = Commission::where(['status' => 1,'source' => $coin])->first();
        if($coins){
            if($order){
                $address = $order->payment_address;
                if($address == ""){
                    $address = UsersWallet::GetUserAddress($uid,$coin);
                }
                
                return view('payments.payment-scan',['address' => $address,'order' => $order,'txid' => $txid]);
            }else{
                return view('payments.error',['message'=> 'Invalid transaction.Please check!']);
            }
            
        }else{
            return view('payments.error',['message'=> 'Invalid transaction.Please check!']);
            //return redirect('wallet')->with('error','Invalid coin/currency !');
        }
        
    }


    /* function ReturnPaymentSuccess(Request $request)
    {
        $item_id  = $request->item_id;
        $orders =OrderTransaction::where('txn_id',$item_id)->first();
        if($orders->received_confirms > 1)
        {
            $var = 'success';
			
            $url = url('/PaymentSuccessStatus/'.$item_id);
        }
        else
        {
            $var = 'error';
            $url = '';
        }

        $res['status'] = $var;
        $res['url'] = $url;

        return json_encode($res);

    } */
	function ReturnPaymentSuccess(Request $request)
    {
        $item_id  = $request->item_id;
        $orders =OrderTransaction::where('txn_id',$item_id)->first();
        if($orders->received_confirms > 1)
        {
            $var = 'success';
            $ses = \Session::get('payments');

           if(isset($ses['success_url'])){
                $success_url =  $ses['success_url'];
           }else{
               $siteurl   = config('app.url');  
               $success_url =  url('/PaymentSuccessStatus/'.$item_id);
           }
            if($success_url !=""){
                $url = $success_url;
            }else{
                $url = url('/PaymentSuccessStatus/'.$item_id);
            }
            
        }else{
            $var = 'error';
            $url = '';
        }

        $res['status'] = $var;
        $res['url'] = $url;

        return json_encode($res);

    }

    public function success_url($item_id)
    {
        $item_id    = $item_id;
        $orders     = OrderTransaction::where('txn_id',$item_id)->first();
        if(is_object(($orders))){
            if($orders->received_confirms > 1)
            {
                $uid    = $orders->uid;
                $user   = User::where('id',$uid)->first();
				$ses = \Session::get('payments');
                if(isset($ses)){
                    //sleep(10);
                    if(isset($ses['success_url']) && $ses['success_url'] !== ""){
                        $success_url = $ses['success_url'];
                        \Session::forget('payments');
                        return redirect($success_url);
                    }                    
                }
                return view('payments.payment-info',['orders' => $orders,'user' =>$user ]);
            }else{
                return view('payments.error',['message'=> 'Your transaction will not be confirmed  please try again!']);
            }
        }else{
            return view('payments.error',['message'=> 'Invalid transaction.Please check!']);
        }

    }

    public function ReturnReceived(Request $request){
        $item_id    = $request->item_id;
        $ses        = \Session::get('payments');
        $orders     = OrderTransaction::where('txn_id',$item_id)->first();
        if($orders->received_confirms > 1)
        {
           $var = 'success';
           if(isset($ses['success_url'])){
           $url =  $ses['success_url'];
           }else{
           $siteurl   = config('app.url');  
           $url =  $siteurl;
           }
        }else{
            $var = 'error';
            $url = '';
        }
        $res['status']  = $var;
        $res['url']     = $url;
        return json_encode($res);        
    }

    public function CancelPayment($tid){   
        $ses = \Session::get('payments');
        $orders = OrderTransaction::where('txn_id',$tid)->first();
        if($orders){
            $orders->status         = -1;
            $orders->status_text    = 'Cancelled / Timed Out';
            $orders->save();
            $this->ResentOrderTrans(\Hashids::encode($orders->id));
        }

           if(isset($ses['cancel_url'])){
                $url =  $ses['cancel_url'];
           }else{
               $siteurl   = config('app.url');  
               $url =  $siteurl;
               return view('payments.error',['message'=> 'Your transaction Cancelled.please try agian!']);
            }

        //$cancel_url = $ses['cancel_url'];
        return redirect($url);
    }


    public function UpdatePaymentStatus(){
        if(isset($_GET['invoice_id']) && isset($_GET['transaction_hash']) && $_GET['value'] && $_GET['address'] && $_GET['secret'] && $_GET['confirmations']){
            $invoice_id         = $_GET['invoice_id'];
            $transaction_hash   = $_GET['transaction_hash'];
            $value_in_btc       = $_GET['value'] / 100000000;
            $value_receive      = $_GET['address'];
            $value_secret       = $_GET['secret'];
            $order = OrderTransaction::where(['txn_id' => $invoice_id ,'secret' => $value_secret,'payment_address' => $value_receive])->first();
			
            if($order){
                $order->received_confirms   = $_GET['confirmations'];
                $order->received_amount     = $value_in_btc;
                $order->order_count         = 0;
                            
                if ($order->received_confirms >= 4) {
                    $uid        = $order->uid;
                    $currency   = 'BTC';
                    if($order->status != 100){
                        //UsersWallet::creditAmount($uid, $currency, $value_in_btc, 8);
                            $type = "payment";
                            $remark = "Payment success";
                            $insertid = $order->id;

                            UsersWallet::creditAmount($uid, $currency, $value_in_btc, 8,$type,$remark,$insertid);

                        $status     = 100;
                        $statustext = 'Payment completed successfully';
                        //Mail & IPN
                        //IPN Details Update
                        if($order->ipn_url !=""){
                            $this->ResentOrderTrans(\Hashids::encode($order->id));
                        }
                        $uid        = $order->uid;
                        $profile    = UsersProfile::getData($uid);
                        $ipnmail    = MerchantSetting::GetData($uid);  
                        $sitename   = config('app.name');  

                        //Buyer mail send 
                            $buyer =BuyerInformation::where('oid',$order->id)->first();

                            $sub = "Payment received on your ".$sitename;
                            $message = "We have received payment of BTC ".$value_in_btc." on your ".$sitename." account on ".date('d-M-Y',time());
                            $this->sendEmailIpn($buyer,$sub,$message);
                        //End buyer send mail
                        $user       = User::where('id', $uid)->first();
                        if($ipnmail){
                            $receive_mail = explode(",",$ipnmail['receive_mail']);
                            if(in_array(3, $receive_mail)){
                                //Mail sended                        
                                $sub = "Payment received on your ".$sitename;
                                $message = "We have received payment of BTC ".$value_in_btc." on your ".$sitename." account on ".date('d-M-Y',time());
                                $this->sendEmailIpn($user,$sub,$message);
                            }
                        }
                        $order->status      = $status;
                        $order->status_text = $statustext;         
                        
                    }
                    $order->save();              
                }else{
                    $status = $order->status;
                    $statustext = 'Payment has been received but not cofirmed yet!';
                    $order->status      = $status;
                    $order->status_text = $statustext;
                    $order->save();
                }
                
                
                return "Payment Updated!";
            }else{
                echo "Invalid invoice id or secret!";
                return "Invalid invoice id / secret!";
            }
        }else{
            return "Something went wrong";
        }
    }

    public function invoicepayment($id)
    {
        $id =\Crypt::decrypt($id);
        $subcategory =InvoiceDetails::where(['referralid'=>$id,'status'=>1])->first();
        if($subcategory){
            $Itemdetails =ItemDetails::where('invoice_id',$subcategory->id)->first();
            if($Itemdetails){
            \Session::put('invoicepayments', $id);

            return redirect('/payout');
        }else{
        $data['status'] = '404';
        $data['msg'] = 'Page Not Found';
        }
        }else{
        $data['status'] = '500';
        $data['msg'] = 'Token Mismatch';
        }

        return json_encode($data);
    }

    public function showpayout()
    {
        $ses = \Session::get('invoicepayments');
        $category =InvoiceDetails::where(['referralid'=>$ses])->first();
        $subcategory =ItemDetails::where('invoice_id',$category->id)->get();
        return view('payments.invoice-payement',['category' => $category,'subcategory' => $subcategory]);
    }

    public function CreateInvoiceTransaction()
    {
        $ses = \Session::get('invoicepayments');
        $category =InvoiceDetails::where(['referralid'=>$ses])->first();
        $subcategory =ItemDetails::where('invoice_id',$category->id)->get();
        $mid = UserMerchant::getmerchant($category->uid);
        $merchant = UserMerchant::getData($mid);
        if(isset($merchant->userprofile->display_name)){
            $dpname = $merchant->userprofile->display_name;
        }else{
            $dpname = $merchant->userdetails->username;
        }

        \Session::put('payments', ['merchant'=>$mid]);

        $lprice = LivePrice::GetLivePrice('BTC',$category->coin);
        $country = Country::get();
        $data =array();
        $data['category'] = $category;
        $data['subcategory'] = $subcategory;
        return view('payments.create-invoicepayement',['payments'=> $data,'merchant' => $merchant,'dpname' => $dpname,'country' => $country,'lprice' => $lprice]);
    }

    public function makeinvoiceordercode(Request $request)
    {
        $ses = \Session::get('invoicepayments');

            $this->validate($request,[
                'first_name'   => 'required|regex:/^[\pL\s\-]+$/u|max:30',
                'last_name'    => 'required|regex:/^[\pL\s\-]+$/u|max:30',
                'email'        => 'required|email|max:60',
                'total'        => 'required|numeric',
            ]);


        $category =InvoiceDetails::where(['referralid'=>$ses])->first();
        $subcategory =ItemDetails::where('invoice_id',$category->id)->get();
        $mid = UserMerchant::getmerchant($category->uid);
        $merchant = UserMerchant::getData($mid);

        $item_amount = $item_desc = $ipn_url =  $item_number = $invoice = $custom = $on1 = $ov1 = $on2 = $ov2 = $extra ='';
        $quantity = 1;
        $item_number = 0;
        $ov1        =  $ov2 = 0;
        $uid        = $category->uid;
        $txn_id     = 'FCPAY'.keygenerate();
        $currency1  = $category->coin;//$ses['currency'];        
        $currency2  = $category->cointwo;
        $amount1    = $category->total;//$ses['amount'];
        if($currency1 == 'USD' || $currency1 == 'EUR' ){
            $lprice = LivePrice::GetLivePrice($currency2,$currency1);
            $amount2    = ncDiv($category->total,$lprice);
        }else{
            $amount2    = $category->total;
        }

        $subtotal   = $category->total;
        $subtotal   = $request->total;
        $shipping   = 1;      
        
        if(isset($ses['item_amount'])){
            $item_amount   = $ses['item_amount'];
        }
        if(isset($ses['item_desc'])){
            $item_desc   = $ses['item_desc'];
        }
        if(isset($ses['ipn_url'])){
            $ipn_url   = $ses['ipn_url'];
        }
        if(isset($ses['quantity'])){
            $ipn_url   = $ses['quantity'];
        }
        if(isset($ses['item_number'])){
            $item_number   = $ses['item_number'];
        }

         if(isset($ses['tax'])){
            $tax   = $ses['tax'];
        }
         if(isset($ses['fee'])){
            $fee   = $ses['fee'];
        }
         if(isset($ses['net'])){
            $net   = $ses['net'];
        }
        
        if(isset($ses['invoice'])){
            $invoice   = $ses['invoice'];
        }
        if(isset($ses['custom'])){
            $custom   = $ses['custom'];
        }
        if(isset($ses['on1'])){
            $on1   = $ses['on1'];
        }
        if(isset($ses['ov1'])){
            $ov1   = $ses['ov1'];
        }
        if(isset($ses['on2'])){
            $on2   = $ses['on2'];
        }
        if(isset($ses['ov2'])){
            $ov2   = $ses['ov2'];
        }
        if(isset($ses['extra'])){
            $extra   = $ses['extra'];
        }
        
        //$item_name = $ses['item_name'];
        $item_name = 'Invoice ID:'.$category->invoice_id;

        $secret = TransactionString();
        $address = "";
        $comDetails = Commission::where('source',$currency2)->first();
        if(!is_object($comDetails)){
            return view('payments.error',['message'=> 'Invalid Coin/Currency.Please check!']);
        }

        if($currency2 == 'BTC' && $comDetails->type =='coin'){
            $data = $this->createPaymentAddressBTC();
        }else if($coin == 'TRX' || $comDetails->type =='TRC20'){
            $data = $this->createPaymentAddressTRX();
        }else{
            $data = $this->createPaymentAddressETH();
        }
        $address = $data['address']; 
        $pvtkey = $data['pvtkey'];
        $address = UsersPaymentAddress::createPaymentAdress($currency2,$comDetails->type,$txn_id,$secret,$address,$pvtkey);
        if(empty($address)) {
            return view('payments.error',['message'=> 'Invalid transaction.Please check!']);
        }   


        $order = OrderTransaction::CreateTransaction($uid,'_invoice',$txn_id,$currency1,$currency2,$amount1,$amount2,$subtotal,$shipping,$item_amount,$item_name,$item_desc,$ipn_url,$quantity,$item_number,$invoice,$custom,$on1,$ov1,$on2,$ov2,$extra,$secret,$address);
        $oid = $order->id;
        $first_name = $request->first_name; 
        $last_name  = $request->last_name;
        $email      = $request->email;
        $buyer = BuyerInformation::CreateBuyer($oid,$first_name,$last_name,$company=null,$email);

        if($category->invoicetype == 'simple'){
        if($order->shipping == 1){
            $address1   = $request->address1;
            $address2   ='';
            $city   ='';
            $state   ='';
            $zip   ='';
            $country   ='';
            $phone   ='';
            if(isset($request->address2)){
                $address2   = $request->address2;
            }
            /*
            $city       = $request->city;
            $state      = $request->state;
            $zip        = $request->zipcode;
            $country    = $request->country;
            $phone      = $request->phoneno;
            */
            $shipping = ShippingInformation::CreateShipping($oid,$address1,$address2,$city,$state,$zip,$country,$phone);
        }
        }
        $ipnmail    = MerchantSetting::GetData($uid);
        $user       = User::where('id', $uid)->first();
        $sitename   = config('app.name');                
        if($ipnmail){
            $receive_mail = explode(",",$ipnmail['receive_mail']);
            if(in_array(1, $receive_mail)){
                //Mail sended
                $sub = "User submits a new payment to you on your ".$sitename;
                $message = "User submits a new payment of BTC ".$item_amount." on your ".$sitename." account on ".date('d-M-Y',time());
                $this->sendEmailIpn($user,$sub,$message);
            }
        }
        return redirect('/payment-scan/'.$txn_id);
        
    }
}
