<?php
	namespace App\Http\Controllers;
	
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Auth;
	use Illuminate\Support\Facades\Crypt;
	use Illuminate\Support\Str;
	use Illuminate\Support\Facades\Redirect;
	use Illuminate\Support\Facades\Input;
	use Illuminate\Support\Facades\File;
	use Illuminate\Support\Facades\URL;
	use DB;
	use Session;
	use Mail;
	use Validator;
	use Carbon\Carbon;
	use App\Libraries\BinanceClass;

	use App\User;
	use App\Models\Tradepair;
	use App\Models\LivePrice;
	use App\Models\Commission;
	use App\Models\UsersWallet;
	use App\Models\InstantTrade;

	class InstantController extends Controller
	{		
		public function __construct()
		{
			//$this->middleware(['auth','twofa']);			
        	$this->middleware(['auth','twofa','kyc']);
		}
		
		public function InstantTrade($coinone,$cointwo)
		{
			$uid = \Auth::id();
            
            $currentprice = LivePrice::GetLivePrice($coinone,$cointwo);  
			//Commission
			$cointwo_com = Commission::where('source',$cointwo)->first();
			
			$com_cointwo_buy = ncDiv($cointwo_com->tradecom,100,8);
			$com_cointwo_sell = ncDiv($cointwo_com->tradecom,100,8);
			
			$first_pair_currentprice  = ncAdd($currentprice,$com_cointwo_buy,8);
			
			//Wallet balance			
			$coinone_balance = UsersWallet::where(['uid' => $uid,'currency' => $coinone])->value('balance');			
			$cointwo_balance = UsersWallet::where(['uid' => $uid,'currency' => $cointwo])->value('balance');
			
			return view('userpanel.instant.Instanttrade',['first_pair_currentprice' => $first_pair_currentprice,'cointwo_com' => $cointwo_com,'com_cointwo_buy' => $com_cointwo_buy,'com_cointwo_sell' => $com_cointwo_sell,'coinone_balance' => $coinone_balance,'cointwo_balance' => $cointwo_balance,'coinone' => $coinone ,'cointwo' => $cointwo]);
		}
		
		public function instantsubmit(Request $request)
		{
			$validator = Validator::make($request->all(), [
				'coinone' => 'required|alpha_dash|max:10',
				'cointwo' => 'required|alpha_dash|max:10',
				'cointwo_value' => 'required|numeric|min:0',
			]);
			if ($validator->fails()) {
				$data['status'] = "fail";
                $data['msg'] = "<div class='alert alert-danger   alert-dismissible'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><div id='buylimitwarning'>All fields required!</div></div>";
				return $data;           
			}
			$uid = \Auth::id();
			$cointwo_price = $request->cointwo_value;
			$coinone = $request->coinone;
			$cointwo = $request->cointwo;			
			if($cointwo_price > 0)
			{	

			$pair = Tradepair::where('active',1)->where(['coinone' => $coinone,'cointwo' => $cointwo])->first();
			
			if($pair) {

                    $sellmarketvolume = (float)$cointwo_price;                        
					// get inputs
					$volume = (float)$cointwo_price;
					$order_type = 4;
					$user = Auth::user()->id;								
					
					$commission = Commission::where('source', $coinone)->first();					
					if($commission->tradecom > 0){
						$commission = bcdiv(sprintf('%.10f', $commission->tradecom), 100, 8);
					}else{
						$commission = 0;
					}

						$balance = 0;
						$wallet = UsersWallet::where([['uid', '=', $user],['currency', '=', $coinone]])->first();
						if ($wallet) {
							$balance = $wallet->balance;
						}

					$is_type = 1;

				    if($pair->type == 1){

						$api = new BinanceClass;
						$ask = $api->getbidask();
						$liqpair = $coinone.$cointwo;
						$price = $ask[$liqpair]['ask'];
						$totalprice = ncMul($price,$volume);
						$fees = ncMul($volume,$commission);
						$totalvolume = bcadd(sprintf('%.10f', $fees), sprintf('%.10f', $volume), 8);
						
						if ((float)$balance >= (float)$totalvolume) {
							
							$sellliq = $api->place_market_sellorder($liqpair,$volume);
							if(isset($sellliq)){
								if (in_array("Filter failure: PRICE_FILTER", $sellliq)) {
									$msg ="Price is too high, too low, and/or not following the tick size rule for the symbol.";
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if (in_array("Filter failure: PERCENT_PRICE" , $sellliq)) {
									$msg = "Price is X% too high or X% too low from the average weighted price over the last Y minutes.";					
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if (in_array("Filter failure: LOT_SIZE" , $sellliq)) {
									$msg = "Quantity is too high, too low, and/or not following the step size rule for the symbol.";
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if (in_array("Filter failure: MIN_NOTIONAL", $sellliq)) {
									$msg = "Price * quantity is too low to be a valid order for the symbol.";
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if (in_array("Filter failure: MAX_NUM_ORDERS" , $sellliq)) {   	
									$msg = "Account has too many open orders on the symbol.";
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if (in_array("Filter failure: MAX_ALGO_ORDERS" , $sellliq)) {
									$msg = "Account has too many open stop loss and/or take profit orders on the symbol.";
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if (in_array("Filter failure: MAX_NUM_ICEBERG_ORDERS" , $sellliq)) {
									$msg = "Account has too many open iceberg orders on the symbol.";
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if (in_array("Filter failure: EXCHANGE_MAX_NUM_ORDERS" , $sellliq)) {
									$msg = "Account has too many open orders on the exchange.";
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if (in_array("Filter failure: EXCHANGE_MAX_ALGO_ORDERS"    , $sellliq)) {
									$msg = "Account has too many open stop loss and/or take profit orders on the exchange.";
									$data['status'] = 'fail';
									$data['msg'] = "<`div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}else if(isset($sellliq['msg'])){
									$msg = $sellliq['msg'];
									$data['status'] = 'fail';
									$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>$msg</div>";
									return $data;
								}
								$orderId = $sellliq['orderId'];
								$clientOrderId = $sellliq['clientOrderId'];
								$status = $sellliq['status'];
								$cummulativeQuoteQty = $sellliq['cummulativeQuoteQty'];
								$executedQty = $sellliq['executedQty'];
							}else{
								$data['status'] = 'fail';
								$data['msg'] = "<div id='selllimitwarning' class='alerttext text-danger text-center'>Something went wrong please try again later!</div>";
								return $data;
							}
							}else{								
							$data['status'] = "Insufficient";
							$data['msg'] = "<div class='alert alert-danger   alert-dismissible'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><div id='buylimitwarning'>Insufficient fund in ". $coinone . " wallet!</div></div>";
								return $data;
							}
							}else{
			            		$price = LivePrice::GetLivePrice($coinone,$cointwo);  
								$total = ncMul($price,$volume);

								$fees  = ncMul($volume,$commission);
								$totalvolume = ncAdd($volume,$fees);			
								$clientOrderId = TransactionString();
								$orderId = $clientOrderId;
								$cummulativeQuoteQty = $total;
								$status = "Success";

								if ((float)$balance >= (float)$totalvolume) {
								
								}else{								
								$data['status'] = "Insufficient";
								$data['msg'] = "<div class='alert alert-danger   alert-dismissible'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><div id='buylimitwarning'>Insufficient fund in ". $coinone . " wallet!</div></div>";
								return $data;
								}
								//dd($volume);
							}
								$trade = new InstantTrade;
								$trade->uid = $user;
								$trade->ouid = $clientOrderId;
								$trade->order_id = $orderId;
								$trade->coinone = $coinone;
								$trade->cointwo = $cointwo;
								$trade->order_type = 4;
								$trade->volume = $volume;
								$trade->value = $cummulativeQuoteQty;
								$trade->fees = $fees;
								$trade->remaining = 0;
								$trade->status = 1;
								$trade->leverage = 1;
								$trade->spend = 0;
								$trade->post_ty = 'web';
								$trade->balance = $balance;
								$trade->status_text = $status;
								$trade->is_type = $is_type;
								$trade->created_at = date('Y-m-d H:i:s', time());
								$trade->updated_at = date('Y-m-d H:i:s', time());
								$trade->save();

								$type = "Convert";
								$remark = "Convert ".$coinone." to NGN";
								$insertid = $trade->id;

								UsersWallet::debitAmount($user,$coinone,$totalvolume,8,$type,$remark,$insertid);
								UsersWallet::creditAmount($user,$cointwo,$cummulativeQuoteQty,8,$type,$remark,$insertid);
								
								$data['status'] = "success";
								$data['msg'] = "<div class='alert alert-success   alert-dismissible'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><div id='buylimitwarning'>".$coinone." to NGN Converted Successfully!</div></div>";

				} else {		
	                $data['status'] = "fail";
	                $data['msg'] = "<div class='alert alert-danger   alert-dismissible'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><div id='buylimitwarning'>Invalid trade pair!</div></div>";
				}
			}else{				
				$data['status'] = "fail";
				$data['msg'] = "<div class='alert alert-danger   alert-dismissible'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><div id='buylimitwarning'>Entered amount should be above 0!</div></div>";				
			}
			return $data;
			
		}
		
		public function instant_calculation(Request $request)
		{
			$coinone = $request->coinone;
			$cointwo = $request->cointwo;
			$type = $request->type;
			$coinone_value = $request->coinone_value;
			$uid = \Auth::id();
			
			$pair = Tradepair::where('active',1)->where(['coinone' => $coinone,'cointwo' => $cointwo])->first();
			
			if($pair) {	
				$coinone_balance = UsersWallet::where(['uid' => $uid,'currency' => $coinone])->value('balance');
				$cointwo_balance = UsersWallet::where(['uid' => $uid,'currency' => $cointwo])->value('balance');
				
				$data['coinone_balance']  = $coinone_balance ? $coinone_balance : '0.00000000';
				$data['cointwo_balance']  = $cointwo_balance ? $cointwo_balance : '0.00000000';
				$commission1 = Commission::where('source', $cointwo)->first();
				$commission = bcdiv(sprintf('%.10f', $commission1->tradecom), 100, 8);		
				
				$volume = $coinone_value;
				if($pair->type == 1){
					$api = new BinanceClass;
					$bid = $api->getbidask();
					$liqpair = $coinone.$cointwo;
					$price = $bid[$liqpair]['bid'];
					$total = ncMul($price,$volume);
					$fees = ncMul($total,$commission);
					$totalprice = ncAdd($total,$fees);
					$data['status'] = "success";
					$data['msg'] = $totalprice;
					$data['fees'] = $fees;
					$data['buycommission'] = $commission1->tradecom ? $commission1->tradecom : '0.00000000';
				}else{
            		$price = LivePrice::GetLivePrice($coinone,$cointwo);  
					$total = ncMul($price,$volume);
					$fees  = ncMul($total,$commission);
					$totalprice = ncAdd($total,$fees);
					$data['status'] = "success";
					$data['msg'] = $totalprice;
					$data['fees'] = $fees;
					$data['buycommission'] = $commission1->tradecom ? $commission1->tradecom : '0.00000000';
				}

			} else {		
                $data['status'] = "fail";
                $data['msg'] = "Invalid trade pair!";
			}

            return $data;
		}
		
		
}	