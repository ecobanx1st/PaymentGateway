<?php
namespace App\Http\Controllers\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Crypt;
use App\Models\User;
use App\Models\UserWallet;
use App\Models\Transaction;
use App\Models\UsersWithdraw;
use App\Models\CurrencyDeposit;
use App\Models\CurrencyWithdraw;
use App\Models\UserBtcAddress;
use App\Models\UserMerchant;
use App\Models\UsersApi;
use App\Models\UsersProfile;
use App\Models\MerchantSetting;
use App\Models\Commission;
use App\Models\UserCommission;
use App\Models\OverallTransaction;

use App\Traits\AddressCreation;

class UserController extends Controller {

use  AddressCreation;

public function __construct() {
$this->middleware('admin');
}

public function index() {
$details = User::index();
return view('user.users')->with('details',$details);
}

public function userDestroy($id) {
$uid = \Crypt::decrypt($id);
$user = User::find($uid);
if($user) {

$data = User::DeleteAll($uid);

$check =UserBtcAddress::getAddress($uid);
if($check) {
$data = UserBtcAddress::addressDelete($uid);
}
return Redirect('admin/users')->with('success','Successfully Deleted!');
} else {
return Redirect('admin/users')->with('error','Invalid request!');
}
}

public function edit($id) {
$user_id = \Crypt::decrypt($id);
if($user_id) {
$user = User::find($user_id);
$uid =$id;
return view('user.user_edit', ['userdetails' => $user,'phone' => $user->phone_no, 'address' => $user->address,'uid' => $uid,'country' => $user->country]);
}
}

public function Profile($id) {
$user_id = \Crypt::decrypt($id);
if($user_id) {
$user = User::find($user_id);
$profile = UsersProfile::getData($user_id);
$uid =$id;
return view('user.user_profile', ['userdetails' => $user,'country' => $user->country,'profile' => $profile]);
}
}

public function MerchantDetails($id) {
$user_id = \Crypt::decrypt($id);
if($user_id) {
$user = User::find($user_id);
$merchant = MerchantSetting::GetData($user_id);
$uid =$id;
return view('user.user_account', ['userdetails' => $user,'merchant' => $merchant]);
}
}

public function userdeposit($id) {
$user_id = \Crypt::decrypt($id);
if($user_id) {
$depositList = Transaction::depsoitList_user($user_id);
$user = User::find($user_id);
$uid =$id;
return view('user.user_deposit', ['userdetails' => $user,'uid' => $uid,'depositList' => $depositList]);
}
}

public function userfiatdeposit($id) {
$user_id = \Crypt::decrypt($id);
if($user_id) {
$fiatdepositList = CurrencyDeposit::fiatdepsoitList_user($user_id);
$user = User::find($user_id);
$uid =$id;
return view('user.user_fiat_deposit', ['userdetails' => $user,'uid' => $uid,'deposit' => $fiatdepositList]);
}
}

public function user_fiatdeposit_edit($id) {
$depositList = CurrencyDeposit::edit(Crypt::decrypt($id));
return view('user.deposit_edit')->with(['deposit'=> $depositList]);
}

public function user_fiatdeposit_update(Request $request) {
$depositUpdate = CurrencyDeposit::statusUpdate($request);
return back()->with('success','Deposit Updated Successfully');
}

public function UserWithdrawList($id) {
$user_id = \Crypt::decrypt($id);
$user = User::find($user_id);
$btcWithdraw = UsersWithdraw::userhistroy($user_id);
return view('user.crypto_withdraw', ['userdetails' => $user,'uid' => $user_id,'transaction' => $btcWithdraw]);
}

public function WithdrawCryptoEdit($id) {
$withdraw = UsersWithdraw::edit($id);
return view('user.cryptowithdraw_edit',[
'withdraw' => $withdraw
]);
}

public function updateCryptoWithdraw(Request $request) {
$withdraw = UsersWithdraw::withdrawUpdate($request);
return back()->with('status',$withdraw);
}

public function user_fiat_withdraw($id) {
$user_id = \Crypt::decrypt($id);
$user = User::find($user_id);
$crypto_trasnaction = CurrencyWithdraw::user_histroy_fiat($user_id);
return view('user.fiat_withdraw', ['userdetails' => $user,'uid' => $user_id,'transaction' => $crypto_trasnaction]);
}

public function fiat_withdraw_edit($id) {
$crypto_trasnaction = CurrencyWithdraw::edit(\Crypt::decrypt($id));
return view('user.withdraw_edit', ['withdraw' => $crypto_trasnaction]);
}

public function fiat_withdraw_update(Request $request) {
$crypto_trasnaction = CurrencyWithdraw::withdrawUpdate($request);
return back()->with('status','Withdraw Updated Successfully');
}

public function update(Request $request) {
if($request->fname !="" && $request->phone!="" && $request->emailcheck !="") {
$user = User::userUpdate($request);
if($user) {
\Session::flash('updated_status', 'Profile Details Updated Successfully.');
} else {
\Session::flash('updated_status', 'Profile Details Updated Failed.');
}
return Redirect('admin/users')->with('success','Updated Successfully!');
} else {
$user_id = $request->id;
$crypt_id = \Crypt::encrypt($user_id);
\Session::flash('error', 'Fields required!.');
return Redirect('admin/users_edit/'.$crypt_id);
}
}

public function userWallet($id) {
$id = Crypt::decrypt($id);
$user = User::find($id);
$wallet = UserWallet::userWalletDetails($id);
$currency = $wallet['balance'];
$coins = $wallet['coin'];
$uid = Crypt::encrypt($id);
return view('user.wallet',['balance' => $currency,'coins' =>$coins,'uid' => $uid,'userdetails' => $user]);
}

public function userApi($id) {
$id = Crypt::decrypt($id);
$api = UsersApi::where('user_id',$id)->paginate(20);
$user = User::find($id);
return view('user.userapi',['api' => $api,'userdetails' => $user]);
}

public function users_address($uid,$coin) {
$id = Crypt::decrypt($uid);
if($coin == 'BTC') {
$btcAddress = $this->create_user_btc($id);
}
if($coin == 'ETH') {
$ethAddress = $this->create_user_eth($id);
}
\Session::flash('status', 'Address Created Successfully!.');
return Redirect('admin/users_wallet/'.$uid);
}

public function usersearch(Request $request) {
$q = $request->searchitem ?? "";
if($q == "") {
return Redirect('admin/users')->with('searcherror','Search field is required!');
}
$details = User::user_name_search(1, $q);
return view('user.users')->with(['details' => $details,'searchable' => $q]);
}

public function OverallTransaction($id,$coin) {
$user_id = \Crypt::decrypt($id);
if($user_id) {
$user = User::find($user_id);
if($coin == 'all') {
$histroys = OverallTransaction::where('uid',$user_id)->orderBy('id','Desc')->paginate(20);
} else {
$histroys = OverallTransaction::where(['uid' => $user_id,'coin' =>$coin])->orderBy('id','Desc')->paginate(20);
}
$coins = Commission::on('mysql2')->get();
return view('user.overalltransaction', ['userdetails' => $user,'uid' => $user_id,'histroys' => $histroys,'coins' => $coins,'type' => $coin]);
}
}

public function UserCommissionSetting($id) {
$user_id = \Crypt::decrypt($id);
if($user_id) {
$user = User::find($user_id);
$data = UserCommission::index($user_id);
$uid =$id;
return view('user.usercommissionsetting', ['userdetails' => $user,'commissions' => $data]);
}
}

public function CreateUserCommission($uid) {
$uid = \Crypt::decrypt($uid);
if($uid) {
$user = User::find($uid);
$data = UserCommission::createComm($uid);
$encuid = \Crypt::encrypt($uid);
\Session::flash('updated_status', 'Commission Created Successfully!.');
return Redirect('admin/usercommissionsetting/'.$encuid);
//return view('user.usercommissionsetting', ['userdetails' => $user,'commissions' => $data]);
}else{
return Redirect('admin/users');
}
}

public function EditCommissionSettings($id) {
$commission = UserCommission::edit(Crypt::decrypt($id));
$user = User::find($commission->uid);
return view('user.editusercommission',['commission'=>$commission,'userdetails' => $user]);
}

public function UserCommissionUpdate(Request $request) {
$commission = UserCommission::commissionUpdate($request);
return back()->with('status','Commission Updated Successfully');
}
}
