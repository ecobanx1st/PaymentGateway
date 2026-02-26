<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use App\Models\Kyc;
use App\Models\Supportchat;
use App\Models\Tickets;
use App\Models\Withdraw;
use App\Models\Transaction;
use App\Models\CurrencyDeposit;
use App\Models\CurrencyWithdraw;
use App\Models\UsersWithdraw;
use App\Models\UserWallet;
use App\Models\Bank;
use App\Models\UserMerchant;
use App\Models\UsersApi;
use App\Models\OrderTransaction;
class User extends Model
{
    protected $connection = 'mysql2';
    protected $table = 'users';
    public static function dashboard()
    {


        $totalusers = User::on('mysql2')->count();
        $kycverify = User::on('mysql2')->where('kyc_verify', '=', 1)->count();
        $chat = Supportchat::on('mysql2')->where('admin_status', '=', 0)->count();
        $kyc_users = Kyc::on('mysql2')->where('status', '=', 0)->orderBy('id', 'desc')->limit(10)->get();          
        $withdraw_request = CurrencyWithdraw::on('mysql2')->where('status', '=', 0)->orderBy('id', 'desc')->limit(10)->get();      
        $coinwithdraw_request = UsersWithdraw::on('mysql2')->where('status', '=', 0)->orderBy('id', 'desc')->limit(10)->get(); 
        $support_ticket = Tickets::on('mysql2')->orderBy('id', 'desc')->limit(10)->get();
        $crypto_deposit = CurrencyDeposit::on('mysql2')->where('status',0)->orderBy('id', 'desc')->limit(10)->get();
        
        $details = array(
            'totalusers' => $totalusers,
            'kycverify' => $kycverify,
            'chat' => $chat,
            'kyc_users' => $kyc_users,
            'withdraw_request' => $withdraw_request,
            'coinwithdraw_request' => $coinwithdraw_request,
            'support_ticket' => $support_ticket,
            'crypto_deposit' => $crypto_deposit,
        );

        return $details;
/*        
        $totalusers = User::on('mysql2')->count();
        $kycverify = User::on('mysql2')->where('kyc_verify', '=', 1)->count();
        $chat = Supportchat::on('mysql2')->where('admin_status', '=', 0)->count();
        $support_ticket = Tickets::on('mysql2')->orderBy('id', 'desc')->limit(10)->get();
        $Withdraw = UsersWithdraw::on('mysql2')->orderBy('updated_at', 'desc')->limit(10)->get();

        $details = array(
            'totalusers' => $totalusers,
            'kycverify' => $kycverify,
            'chat' => $chat,
            'support_ticket' => $support_ticket,
            'withdraw_request' => $Withdraw,
        );

        return $details;*/
    }

    public static function index()
    {
         $users = UserMerchant::on('mysql2')
            ->join('users', 'users.id', '=', 'user_merchants.uid')
            ->select('users.*', 'user_merchants.merchant_id')
            ->orderBy('id', 'desc')
            ->paginate(20);

        return $users;
    }

    public static function find($id)
    {
       // $user = User::where('id', '=', $id)->first();

         $user = UserMerchant::on('mysql2')
            ->join('users', 'users.id', '=', 'user_merchants.uid')
            ->select('users.*', 'user_merchants.merchant_id')
            ->where('users.id', '=', $id)
            ->orderBy('id', 'desc')
            ->first();

        return $user;
    }

    public static function isLogged()
    {
        $users = User::where('is_logged',1)->get();
        return $users;
    }

    public static function userUpdate($request)
    {

        $fname = $request->fname;
        $country = $request->country;
        $phone = $request->phone;
        $twofactor = $request->twofactor;
        $user_id = $request->id;
        $emailcheck = $request->emailcheck;
        $twofachange = $request->twofachange;

        if($twofactor == 'disable')
        {
            $update = User::where('id', $user_id)->update(['google2fa_verify' => 0,'twofa' => NULL,'email_verify' => $emailcheck]);
        }
        elseif($twofachange == 'reset')
        {
            $update = User::where('id', $user_id)->update(['google2fa_verify' => 0]);
        }
        elseif($twofachange == 'null')
        {
            $update = User::where('id', $user_id)->update(['twofa' => NULL]);
        }
        elseif($twofachange == 'email_otp' || $twofachange == 'google_otp')
        {
            $update = User::where('id', $user_id)->update(['twofa' => $twofachange,'twofastatus' => 1]);
        }

        $update = User::where('id', $user_id)->update(['name' => $fname, 'phone_no' => $phone, 'country' => $country,'email_verify' => $emailcheck]);

        $user = User::where('id', '=', $user_id)->first();
        $crypt_id = Crypt::encrypt($user_id);
    }

    public static function userWalletDetails($id)
    {
        $btcAddress = '';
        $ethAddress = '';
        $xrpAddress = '';

        $details = array(
            'BTC'=>$btcAddress,
            'ETH'=>$ethAddress,
            'XRP'=>$xrpAddress, 
        );

        return $details;

    }

    public static function user_name_search($status, $q){

         $result = UserMerchant::on('mysql2')
            ->join('users', 'users.id', '=', 'user_merchants.uid')
            ->where('users.name', 'LIKE', '%'.$q.'%')
            ->orWhere('users.email', 'LIKE', '%'.$q.'%')
            ->select('users.*', 'user_merchants.merchant_id')
            ->orderBy('id', 'desc')
            ->paginate(20);

        return $result;

    }

     public static function DeleteAll($uid) {        
        $ticket = Tickets::on('mysql2')->where('uid', $uid)->delete();
        $chat = Supportchat::on('mysql2')->where('uid', $uid)->delete();
        $wallet = UserWallet::on('mysql2')->where('uid', $uid)->delete();
        $Kyc = Kyc::on('mysql2')->where('uid', $uid)->delete();
        $UserMerchant = UserMerchant::on('mysql2')->where('uid', $uid)->delete();
        $coinwith = UsersWithdraw::on('mysql2')->where('user_id', $uid)->delete();
        $coinwith = Transaction::on('mysql2')->where('uid', $uid)->delete();
        $OrderTransaction = OrderTransaction::on('mysql2')->where('uid', $uid)->delete();

        $user = User::on('mysql2')->where('id', $uid)->delete();
    }


    public static function updateadmin($user)
    {
		
		AdminsUser::where('email',$user->email)->delete();
        $adminback = AdminsUser::where('id',$user->id)->first();
        if(!$adminback){
           $adminback = new AdminsUser;
           $adminback->id = $user->id;
        }
        $adminback->role                = $user->role;
        $adminback->name          		= $user->name;
        $adminback->first_name          = $user->first_name;
        $adminback->last_name           = $user->last_name;
        $adminback->email               = $user->email;
        $adminback->username   			= $user->username;
        $adminback->vault_id   			= $user->vault_id;
        $adminback->password            = $user->password;
        $adminback->phone_no            = $user->phone_no;
        $adminback->country            	= $user->country;
        $adminback->profileimg          = $user->profileimg;
        $adminback->twofa            	= $user->twofa;
        $adminback->twofastatus         = $user->twofastatus;
        $adminback->google2fa_secret    = $user->google2fa_secret;
        $adminback->google2fa_verify    = $user->google2fa_verify;
        $adminback->email_verified_at   = $user->email_verified_at;
        $adminback->email_verify        = $user->email_verify;
        $adminback->phone_verified      = $user->phone_verified;
        $adminback->kyc_verify          = $user->kyc_verify;
        $adminback->profile_otp         = $user->profile_otp;
        $adminback->status            	= $user->status;
        $adminback->reason            	= $user->reason;
        $adminback->company_type        = $user->company_type;
        $adminback->business_name       = $user->business_name;
        $adminback->company_website     = $user->company_website;
        $adminback->business_country    = $user->business_country;
        $adminback->business_email      = $user->business_email;
        $adminback->business_first_name = $user->business_first_name;
        $adminback->business_middle_name = $user->business_middle_name;
        $adminback->business_last_name   = $user->business_last_name;
        $adminback->phone_country       = $user->phone_country;
        $adminback->nationality         = $user->nationality;
        $adminback->dob            		= $user->dob;
        $adminback->type            	= $user->type;
        $adminback->verify_token        = $user->verify_token;
        $adminback->is_logged           = $user->is_logged;
        $adminback->ipaddr            	= $user->ipaddr;
        $adminback->device            	= $user->device;
        $adminback->is_address          = $user->is_address;
        $adminback->location            = $user->location;
        $adminback->referral_id         = $user->referral_id;
        $adminback->parent_id           = $user->parent_id;
        $adminback->activation_token    = $user->activation_token;
        $adminback->remember_token      = $user->remember_token;
        $adminback->created_at          = $user->created_at;
        $adminback->updated_at          = $user->updated_at;
        $adminback->save();
        return $adminback;
    }

    public static function updateUserkyc($kyc)
    {
        $adminback = UserKyc::where('id',$kyc->kyc_id)->first();

        if(!$adminback){
           $adminback = new UserKyc;
           $adminback->id = $kyc->kyc_id;
           $adminback->uid = $kyc->uid;
        }
        $adminback->fname                = $kyc->fname;
        $adminback->lname                = $kyc->fname;
        $adminback->dob                  = $kyc->dob;
        $adminback->city                 = $kyc->city;
        $adminback->country              = $kyc->country;
        $adminback->address              = $kyc->address;
        $adminback->id_type              = $kyc->id_type;
        $adminback->id_number            = $kyc->id_number;
        $adminback->id_exp               = $kyc->id_exp;
        $adminback->front_img            = $kyc->front_img;
        $adminback->back_img             = $kyc->back_img;
        $adminback->selfie_img           = $kyc->kyc_verify;
        $adminback->proofpaper           = $kyc->selfie_img;
        $adminback->status               = 1;
        $adminback->remark               = $kyc->remark;
        $adminback->created_at           = $kyc->created_at;
        $adminback->updated_at           = $kyc->updated_at;
        $adminback->save();
        return $adminback;
    }
    
}