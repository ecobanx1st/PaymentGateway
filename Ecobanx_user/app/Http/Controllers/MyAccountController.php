<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Auth;
use App\User;
use App\Models\Transaction;
use App\Models\UsersApi;
use App\Models\Commission;
use App\Models\UserMerchant;
use App\Models\UsersProfile;
use App\Models\MerchantSetting;
use App\Models\Ipnhistory;
use App\Models\UsersApiSetting;

class MyAccountController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth','twofa','kyc']);
        //$this->middleware(['auth','twofa']);
    }

    public function BasicsSettings()
    {
        $user = Auth::user();
        $merchant_id = UserMerchant::getmerchant($user->id);
        if($merchant_id == ""){
            UserMerchant::create($user->id,keygenerate());
        }
        $UsersProfile = UsersProfile::getData($user->id);

        return view('userpanel.myaccount.basics-settings',['datas' => $user,'merchant_id' => $merchant_id,'UsersProfile' => $UsersProfile]);
    }

    public function BasicsSettingsUpdate(Request $request)
    {

        $this->validate($request, [
        'sex' => 'required'
        ]);

        $uid = Auth::user()->id;


        $merchant_id = UsersProfile::UpdateAccount($uid,$request);
        return redirect('/account-setting')->with('success','Updated Successfully!');

    }

    public function MerchantSettings()
    {
        $uid = Auth::user()->id;
        $merchant = MerchantSetting::GetData($uid);
        $commission = Commission::get();
        return view('userpanel.myaccount.merchant-settings',['datas' => $merchant,'commission' => $commission]);

    }

     public function MerchantSettingsCreate(Request $request)
    {
        $uid = Auth::user()->id;
        $this->validate($request, [
        'ipn_secret' => 'required',
        'ipn_url' => 'nullable|url',
        'coin' => 'nullable',
        'receive_mail' => 'nullable',
        'status' => 'nullable|email',
        ]);

        $uid = Auth::user()->id;
        $histroy = MerchantSetting::UpdateMerchant($uid, $request);
        return redirect('/merchant-setting')->with('success','Updated Successfully!');
    }



    public function IPNHistroy()
    {
        $uid = Auth::user()->id;
        $histroy = Ipnhistory::where('uid',$uid)->paginate(20);
        return view('userpanel.myaccount.ipn-histroy',['history' => $histroy]);
    }


    public function APIKey()
    {
        $uid = Auth::user()->id;
        $count = UsersApi::where('user_id',$uid)->count();
        $data = UsersApi::where(['user_id' => $uid])->get();
        return view('userpanel.myaccount.api-key',['datas' => $data,'count' => $count]);
    }

    public function APIKeyEdit($id)
    {
        $aid = \Hashids::decode($id);
        if(empty($aid)){
            return redirect('/key-list')->with('error', 'Please select the keys for deleting!');
        }
        $uid = Auth::id();
        $apiset = UsersApiSetting::where(['api_id' => $aid,'uid' => Auth::id()])->first();
        if($apiset){
            return view('userpanel.myaccount.api-key-edit',['apiset' => $apiset,'apiid' => $aid]);
        }else{
            return redirect('/key-list')->with('error', 'Something went wrong Please try again!');
        }
    }

     public function APIKeysettingCreate(Request $request){

        $this->validate($request, [
            'keyname' => 'required|regex:/^[\pL\s\-]+$/u|max:20',
            'ip' => 'nullable|ip'
        ]);

        $uid = Auth::user()->id;

        $apiid = $request->apiid;
        $aid = \Hashids::decode($apiid);
        if(empty($aid)){
            return redirect('/key-list')->with('error', 'Something went wrong Please try again!');
        }
        $ip ='';
        if(isset($request->ip)){
            $ip= $request->ip;
        }
        $data = UsersApiSetting::UpdateSetting($aid,$uid,$request->keyname,$ip);
        if($data){
            return redirect('/edit-key/'.$apiid)->with('success', 'Updated Successfully!');
        }else{
            return redirect('/edit-key/'.$apiid)->with('error', 'Something went wrong!');
        }
    }

    public function APIKeyPermission(Request $request){
        $this->validate($request, [
            'basicinfo' => 'boolean',
            'balance' => 'boolean',
            'convert_coins' => 'boolean',
            'deposit' => 'boolean',
            'transaction' => 'boolean',
            'deposit_history' => 'boolean',
            'withdraw_history' => 'boolean',
            'withdraw' => 'boolean'
        ]);

        $uid = Auth::user()->id;
        $apiid = $request->apiid;
        $aid = \Hashids::decode($apiid);
        if(empty($aid)){
            return redirect('/key-list')->with('error', 'Something went wrong Please try again!');
        }
        $basicinfo = $balance = $convert_coins = $deposit = $transaction = $deposit_history = $withdraw_history = $withdraw= 0;
        if (isset($request->basicinfo)){
            $basicinfo = $request->basicinfo;
        }
        if (isset($request->balance)){
            $balance = $request->balance;
        }
        if (isset($request->convert_coins)){
            $convert_coins = $request->convert_coins;
        }
        if (isset($request->deposit)){
            $deposit = $request->deposit;
        }
        if (isset($request->transaction)){
            $transaction = $request->transaction;
        }
        if (isset($request->deposit_history)){
            $deposit_history = $request->deposit_history;
        }
        if (isset($request->withdraw_history)){
            $withdraw_history = $request->withdraw_history;
        }
        if (isset($request->withdraw)){
            $withdraw = $request->withdraw;
        }
        $count = UsersApiSetting::Permissionupdate($aid,$uid,$basicinfo,$balance,$convert_coins,$deposit,$transaction,$deposit_history,$withdraw_history,$withdraw);
        if($count){
            return redirect('/edit-key/'.$apiid)->with('success', 'Updated Successfully!');
        }else{
            return redirect('/edit-key/'.$apiid)->with('error', 'Please fill the api setting!');
        }


    }

    public function Emptyapisetting($apiid){
        $aid = \Hashids::decode($apiid);
        if(empty($aid)){
            return redirect('/key-list')->with('error', 'Something went wrong Please try again!');
        }

        $uid = Auth::user()->id;
        $data = UsersApiSetting::UpdateSetting($aid,$uid);
        if($data){
            return redirect('/edit-key/'.$apiid)->with('success', 'Updated Successfully!');
        }else{
            return redirect('/edit-key/'.$apiid)->with('error', 'Something went wrong!');
        }
    }

    public function EmptyapiPermission($apiid){
        $aid = \Hashids::decode($apiid);
        if(empty($aid)){
            return redirect('/key-list')->with('error', 'Something went wrong Please try again!');
        }

        $uid = Auth::user()->id;
        $data = UsersApiSetting::Permissionupdate($aid,$uid);
        if($data){
            return redirect('/edit-key/'.$apiid)->with('success', 'Updated Successfully!');
        }else{
            return redirect('/edit-key/'.$apiid)->with('error', 'Something went wrong!');
        }
    }


    public function CreateUserAPI(){
        $uid = Auth::user()->id;
        $public     = 'pu_'.keygenerate();
        $private    = 'pk_'.pvtgenerate();
        $count = UsersApi::where('user_id',$uid)->count();
        if($count <= 9){
            $data = UsersApi::create($uid,$public,$private);
            UsersApiSetting::CreateAPISettings($data->id,$uid);
            return redirect()->route('apikeylist')->with('success', 'Successfully created API');
        }else{
            return redirect()->route('apikeylist')->with('error', 'you have exceeded your rate limit for this create API!');
        }
    }
    public function ApiRemove(Request $request) {
        $checked =$request->checkedremove;

        if(isset($checked))
        {
            foreach ($checked as $id) {
            UsersApiSetting::where(["uid" => Auth::id(),"api_id"=>\Hashids::decode($id)])->delete(); //Assuming you have a Todo model.
            UsersApi::where(["user_id" => Auth::id(),"id"=>\Hashids::decode($id)])->delete(); //Assuming you have a Todo model.
            }
             return redirect('/key-list')->with('success', 'Deleted Successfully!');
        }
        else
        {
             return redirect('/key-list')->with('error', 'Select api key to delete!');
        }

    }

    public function ApiSingleRemover($id){

        if(!$id || !isset($id)){
            return redirect('/key-list')->with('error', 'Api key ID is required!');
        }

        $delOne = UsersApiSetting::where(["uid" => Auth::id(),"api_id"=>\Hashids::decode($id)])->delete();
        $delTwo = UsersApi::where(["user_id" => Auth::id(),"id"=>\Hashids::decode($id)])->delete();

        if($delOne && $delTwo){
             return redirect('/key-list')->with('success', 'Deleted Successfully!');
        }else{
            return redirect('/key-list')->with('error', 'Something went wrong Please try again!');
        }

    }

}
