<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use App\User;
use App\Models\Country;
use App\Models\UsersProfile;
use App\Models\Kyc;
use App\Models\LivePrice;
use App\Models\OrderTransaction;
use App\Models\Ipnhistory;
use App\Models\Usercarddetails;
use App\Models\Bankuser;
use App\Models\Commission;
use App\Models\UsersWallet;
use Auth;
use App\Mail\SendOtpVerification;

class UserpanelController extends Controller {

  public function __construct() {
    $this->middleware(['auth']);
    $this->middleware(['twofa','kyc'], ['except' => ['profile','changepwd','kycindex','persinoaldetais_update','uploadkyc']]);
  }

  public function Userpanel() { 
    $uid = Auth::id();
    $history = OrderTransaction::where('uid',$uid)->orderBy('id','Desc')->paginate(10);
    $ipnhistroy = Ipnhistory::where('uid',$uid)->paginate(10);
    $comdetails = Commission::index();
    $currency = array();
    $price = array();
    $totalusd = 0;
    if($comdetails->count()) {
      foreach($comdetails as $data) {
        $coin = $data->source;
        $price[$coin] = LivePrice::usersBalance($coin,$uid);          
        $balance = UsersWallet::where(['uid'=>$uid,'currency'=>$data->source])->first();
        if($balance) {
          $currency[$balance->currency]['balance'] = sprintf("%.8f", $balance->balance);
          $currency[$balance->currency]['escrow'] = sprintf("%.8f", $balance->escrow_balance);
          $currency[$balance->currency]['margin'] = sprintf("%.8f", $balance->vilimpu_camanilai);
		  
          $totalusd = ncAdd($price[$coin]['USD'],$totalusd);
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
    return view('userpanel.dashboard',['price' => $price,'totalusd' => $totalusd, 'comdetails' => $comdetails, 'wallet' => $currency, 'history' => $history,'ipnhistroys' => $ipnhistroy]);
  }

  public function TransactionView($id) {
    $uid = Auth::id(); 
    $history = OrderTransaction::where(['txn_id' => $id,'uid' => $uid])->first();
    if(!is_object($history)){
      return abort(404);
    }    
    $user = User::where('id',$uid)->first();
    return view('userpanel.payment-details',['trans' => $history,'user' => $user]);
  }

  public function profile() {  
    $country= Country::get();
    $user= User::where('id',Auth::id())->first();
    return view('userpanel.profile',['country' => $country,'user' => $user]);
  }

  public function persinoaldetais_update(Request $request) {
    $user_id = Auth::user()->id;
    if(Auth::user()->role == 'Personal'){
      $this->validate($request, [
        'first_name' => 'required|regex:/^[\pL\s\-]+$/u|max:50',
        'last_name' => 'required|regex:/^[\pL\s\-]+$/u|max:50',
        'country' => 'required',
      ]);
      $first_name = $request->input('first_name');
      $last_name = $request->input('last_name');
      $username = $first_name;
      $country = $request->input('country');
      $user = new User;
      $user->where('id', '=', $user_id)->update(['name' => $username, 'first_name' => $first_name,'last_name' => $last_name, 'country' => $country]);
      $profile = UsersProfile::where('user_id', '=', $user_id)->first();
      if($profile != NULL || $profile != "") {
        $UsersProfile = new UsersProfile;
        $UsersProfile->where('user_id', '=', $user_id)->update(['display_name' => $username]);
      } else {
        $user = UsersProfile::create([
          'user_id'        => $user_id,
          'display_name'   => $username,
        ]);
      }
      return redirect('/profile')->with('profilestatus', 'Updated Successfully!');
    }else{
      $this->validate($request, [
        'business_name' => 'required|regex:/^[\pL\s\-]+$/u|max:50',
        'company_website' => 'required|url',
        'country' => 'required',
        'business_name' => 'required',
      ]);
      $user_id = Auth::user()->id;
      $business_name = $request->input('business_name');
      $name = $business_name;
      $username = $business_name;
      $phoneno = $request->input('phone');
      $country = $request->input('country');
      
      $company_website = $request->input('company_website');
      $user = new User;
      $user->where('id', '=', $user_id)->update(['name' => $name,'company_website' => $company_website,'country' => $country, 'business_name' => $business_name]);
      $profile = UsersProfile::where('user_id', '=', $user_id)->first();
      if($profile != NULL || $profile != "") {
        $UsersProfile = new UsersProfile;
        $UsersProfile->where('user_id', '=', $user_id)->update(['display_name' => $username]);
      } else {
        $user = UsersProfile::create([
          'user_id'              => $user_id,
          'display_name'             => $username,
        ]);
      }
      return redirect('/profile')->with('profilestatus', 'Updated Successfully!');
    }
    
    return redirect('/profile')->with('profilestatus', 'Personal Details Updated Successfully');
  }

  public function changepwd(Request $request) {
    $security = User::where('id', Auth::id())->first();
    $this->validate($request, [
      'oldpassword' => 'required|min:6',
      'newpassword' => 'required|min:8|max:16|required_with:confirmnewpassword|same:confirmnewpassword|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/',
      'confirmnewpassword' => 'required|min:8|max:16|same:newpassword'
    ]);
    $oldpwd =$request->oldpassword;
    $newpwd =$request->newpassword;
    $confirmnewpwd =$request->confirmnewpassword;
    $user = User::find(Auth::id());
    $hashedPassword = $user->password;
    if (\Hash::check($oldpwd, $hashedPassword)) {
      if($newpwd == $confirmnewpwd) {
        $data = [ 'password' =>  bcrypt($newpwd)];
        $user = \App\User::where('id',Auth::id())->update($data);
        if($user) {
          return back()->with('success_pwd','Password Changed successfully!');
        } else {
          return back()->with('error','Try again!');
        }
      } else {
        return back()->with('error','Password Mismatch!');
      }
    } else {
      return back()->with('error','Old Password Wrong!');
    }
  }

  public function kycindex() {  
    $country = Country::get();  
    $Kyc = Kyc::where('uid',Auth::id())->latest()->first(); 
    if(isset($Kyc->status) && $Kyc->status != 2) {
      return view('userpanel.kycdata',['country' => $country,'kyc' => $Kyc]);
    } else {
      return view('userpanel.kyc',['country' => $country]);
    }
  }

  public function uploadkyc(Request $request) {
    $rules = [
      'first_name' => 'required|regex:/^[\pL\s\-]+$/u|max:30',
      'last_name' => 'required |regex:/^[\pL\s\-]+$/u|max:30',
      'dob' => 'required|date|before:-18 years',
      'city' => 'required |regex:/^[\pL\s\-]+$/u|max:30',
      'id_document' => 'required',
      'country' => 'required |regex:/^[\pL\s\-]+$/u|max:30',
      'id_type' => 'required',
      'id_number' => 'required |regex:/^[a-z\d\-_\s]+$/i|max:50',
      'id_exp' => 'required|date',
      'front_upload_id' => 'required|mimes:jpeg,jpg,png|max:1024',
      'back_upload_id' => 'required|mimes:jpeg,jpg,png|max:1024',
    ];

    $messages = [
      'first_name.required' => 'First Name is required.',
      'first_name.regex' => 'Invalid First Name.',
      'last_name.required' => 'Last Name is required.',
      'last_name.regex' => 'Invalid Last Name.',
      'dob.required' => 'The Date of Birth is required.',
      'dob.date' => 'The Date of Birth is required.',
      'dob.before' => 'The Date of Birth must be a date before -18 years.',
      'city.required' => 'City is required.',
      'city.regex' => 'Invalid City and allowed only alpha space.',
      'id_document.required' => 'Document is required.',
      'country.required' => 'Country is required.',
      'country.regex' => 'Invalid Country.',
      'id_type.required' => 'ID Type is required.',
      'id_number.required' => 'ID Number is required.',
      'id_number.regex' => 'Invalid ID Type.',
      'id_exp.required' => 'Expiry Date is required.',
      'front_upload_id.required' => 'Upload Document (Front) is required.',
      'back_upload_id.required' => 'Upload Document (Back) is required.'
    ];  

    $validator = \Validator::make($request->all(), $rules, $messages);

    if ($validator->fails()) {
      return back()
      ->withInput()
      ->withErrors($validator);
    }  

    if($this->imgvalidaion($_FILES['front_upload_id']['tmp_name']) == 1 && $this->imgvalidaion($_FILES['back_upload_id']['tmp_name']) == 1) {
      if(Input::hasFile('front_upload_id')){
        $dir = 'kyc/';
        $path = 'storage' . DIRECTORY_SEPARATOR .'app'. DIRECTORY_SEPARATOR.'public'. DIRECTORY_SEPARATOR. $dir;
        $location = 'public' . DIRECTORY_SEPARATOR .'storage'. DIRECTORY_SEPARATOR. $dir;
        $fornt = Input::File('front_upload_id');//
        $filenamewithextension = $fornt->getClientOriginalName();
        $photnam = str_replace('.','',microtime(true));
        $filename = pathinfo($photnam, PATHINFO_FILENAME);
        $extension = $fornt->getClientOriginalExtension();
        $photo = $filename.'.'. $extension;
        $fornt->move($path, $photo);
        $front_img = $location.$photo;
        }

        if(Input::hasFile('back_upload_id')) {
          $dir = 'kyc/';
          $path = 'storage' . DIRECTORY_SEPARATOR .'app'. DIRECTORY_SEPARATOR.'public'. DIRECTORY_SEPARATOR. $dir;
          $location = 'public' . DIRECTORY_SEPARATOR .'storage'. DIRECTORY_SEPARATOR. $dir;
          $back = Input::File('back_upload_id');
          $filenamewithextension = $back->getClientOriginalName();
          $backname = str_replace('.','',microtime(true));
          $filename = pathinfo($backname, PATHINFO_FILENAME);
          $extension = $back->getClientOriginalExtension();
          $backphoto = $filename.'.'. $extension;
          $back->move($path, $backphoto);
          $back_img = $location.$backphoto;
        }
        Kyc::kycinsert($request,$front_img,$back_img);
        return redirect('/kyc')->with('kycstatus', 'KYC Submitted Successfully');
        } else {
          return redirect('/kyc')->with('kycfail', 'Your Kyc has been failed ,Unwanted images can not be approved');
        }
}


  public function uploadProfilePic(Request $request) {
    $rules = [
      'photo' => 'required|mimes:jpeg,jpg,png,JPEG,JPG,PNG|max:4096',
    ];

    $messages = [
      'photo.required' => 'Upload photo is required.',
    ];  

    $validator = \Validator::make($request->all(), $rules, $messages);

    if ($validator->fails()) {
      $data['status'] = 'fail';
      $data['msg'] = 'All fields required!';
      return $data;
    }  

    if($this->imgvalidaion($_FILES['photo']['tmp_name']) == 1 ) {
      if(Input::hasFile('photo')){
        $dir = 'profile/';
        /*$path = 'storage' . DIRECTORY_SEPARATOR .'app'. DIRECTORY_SEPARATOR.'public'. DIRECTORY_SEPARATOR. $dir;
        $location = 'public' . DIRECTORY_SEPARATOR .'storage'. DIRECTORY_SEPARATOR. $dir;*/
        $path = 'storage'. DIRECTORY_SEPARATOR. $dir;

        $fornt = Input::File('photo');//
        $filenamewithextension = $fornt->getClientOriginalName();
        $photnam = str_replace('.','',microtime(true));
        $filename = pathinfo($photnam, PATHINFO_FILENAME);
        $extension = $fornt->getClientOriginalExtension();
        $photo = $filename.'.'. $extension;
        $fornt->move($path, $photo);
        $front_img = $path.$photo;
        $user = Auth::user();
        $user->profileimg = url($front_img);
        $user->save();

        $data['status'] = 'success';
        $data['msg'] = 'Profile image updated successfully!';
        return $data;
      }
      $data['status'] = 'fail';
      $data['msg'] = 'There is an error while uploading! Please try again later.';
      return $data;
    } else {
      $data['status'] = 'fail';
      $data['msg'] = 'Please choose the valid image!';
      return $data;
    }
}

public function imgvalidaion($img) {
  $myfile = fopen($img, "r") or die("Unable to open file!");
  $value = fread($myfile,filesize($img));
  if (strpos($value, "<?php") !== false) {
    $img = 0;
  } elseif (strpos($value, "<?=") !== false){
    $img = 0;
  } elseif (strpos($value, "eval") !== false) {
    $img = 0;
  } elseif (strpos($value,"<script") !== false) {
    $img = 0;
  } else {
    $img=1;
  }
  fclose($myfile);
  return $img;
}

public function security_two() {  
  $user = User::where('id', Auth::id())->first();
  $Kyc = Kyc::where('uid', Auth::id())->latest()->first();
  return view('userpanel.security',['user' => $user,'kyc' => $Kyc]);
}

public function updateBankDetails(Request $request) {
  $get_id = $request->id;
  $id = Crypt::encrypt($request->id);
  $user = Auth::user()->id;
  $this->validate($request, [
    'account_name' => 'required|regex:/^[\w]+([-_\s]{1}[a-z0-9]+)*$/i|max:50',
    'account_no' => 'required|regex:/^[0-9]+$/',
    'bank_name' => 'required|regex:/^[\w]+([-_\s]{1}[a-z0-9]+)*$/i|max:50',
    'bank_branch' => 'nullable|regex:/(^[- .,\/0-9a-zA-Z]+$)+/|max:50',
    'bank_branch_code' => 'nullable|regex:/^[\w]+([-_\s]{1}[a-z0-9]+)*$/i|max:50',
    'bank_code' => 'nullable|regex:/^[\w]+([-_\s]{1}[a-z0-9]+)*$/i|max:50',
    'bank_address' => 'nullable|regex:/(^[- .,\/0-9a-zA-Z]+$)+/|max:100'
  ]);
  $account_name = $request->account_name;
  $account_no = $request->account_no;
  $bank_name = $request->bank_name;
  $bank_branch = $request->bank_branch;
  $bank_address = $request->bank_address;
  $bank_branch_code = $request->bank_branch_code;
  $remark = $request->remark;
  $ifsc_code = $request->bank_code;
  $is_user_bank = Bankuser::where([['uid' , '=' , $user], ['id', '=', $get_id]])->first();
  if($is_user_bank && $is_user_bank->count() > 0) {
    $update = Bankuser::where('uid', '=', $user)->update(['account_name' => $account_name, 'account_number' => $account_no, 'bank_name' => $bank_name, 'bank_branch' => $bank_branch, 'bank_address' => $bank_address, 'swift_code' => $ifsc_code, 'branch_code' => $bank_branch_code]);
    if($update) {
      $bank_success_response = 'Bank Details Updated Successfully!';
      return redirect('bankDetail/'.$id)->with('bank_success_response', $bank_success_response);
    }
  } else {
    $bank_details = new Bankuser();
    $bank_details->uid = $user;
    $bank_details->account_name = $request->account_name;
    $bank_details->account_number = $request->account_no;
    $bank_details->bank_name = $request->bank_name;
    $bank_details->bank_branch = $request->bank_branch;
    $bank_details->bank_address = $request->bank_address;
    $bank_details->swift_code = $request->ifsc_code;
    $bank_details->branch_code = $request->bank_branch_code;
    if($bank_details->save()) {
      $bank_success_response = 'Bank Details Updated Successfully!';
      return redirect('bankDetail/'.$id)->with('bank_success_response', $bank_success_response);
    }
  }
}

public function bankDetail() {
  $user = Auth::user()->id;
  $is_user_bank = Bankuser::where([['uid' , '=' , $user], ['status', '=', 1]])->paginate(15);
  return view('userpanel.bankDetails.bank_details', ['bank_details' => $is_user_bank]);
}

public function addBankDetail() {
  return view('userpanel.bankDetails.add_bank_details');
}

public function deleteBank(Request $request) {
  $user = Auth::user()->id;
  $get_id = $request->id;
  $is_user_bank = Bankuser::where([['uid' , '=' , $user], ['id', '=', $get_id]])->first();
  if($is_user_bank) {
    $update = Bankuser::where([['uid' , '=' , $user], ['id', '=', $get_id]])->update(['status' => 0]);
    if($update) {
      return \Response::json(array(
        'status' => true,
        'msg' => "Bank Details Deleted Successfully!"
      ));
    }
  }
}

public function addBank(Request $request) {
  $user = Auth::user()->id;
  $this->validate($request, [
    'account_name' => 'required|regex:/^[\w]+([-_\s]{1}[a-z0-9]+)*$/i|max:50',
    'account_no' => 'required|regex:/^[0-9]+$/',
    'bank_name' => 'required|regex:/^[\w]+([-_\s]{1}[a-z0-9]+)*$/i|max:50',
    'bank_branch' => 'nullable|regex:/(^[- .,\/0-9a-zA-Z]+$)+/|max:50',
    'bank_branch_code' => 'nullable|regex:/^[\w]+([-_\s]{1}[a-z0-9]+)*$/i|max:50',
    'bank_code' => 'nullable|regex:/^[\w]+([-_\s]{1}[a-z0-9]+)*$/i|max:50',
    'bank_address' => 'nullable|regex:/(^[- .,\/0-9a-zA-Z]+$)+/|max:100'
  ]);
  $count = Bankuser::where(['uid' => Auth::id(),'status' => 1])->count();
  if($count < 5){
    $bank_details = new Bankuser();
    $bank_details->uid = $user;
    $bank_details->account_name = $request->account_name;
    $bank_details->account_number = $request->account_no;
    $bank_details->bank_name = $request->bank_name;
    $bank_details->bank_branch = $request->bank_branch;
    $bank_details->bank_address = $request->bank_address;
    $bank_details->swift_code = $request->bank_code;
    $bank_details->branch_code = $request->bank_branch_code;
    if($bank_details->save()) {
      $bank_success_response = 'Bank Details Added Successfully!';
      return redirect('bankDetail')->with('bank_success_response', $bank_success_response);
    }
  } else {
    $bank_success_response = 'Maximum 5 Bank Account can be added!';
    return redirect('bankDetail')->with('bank_success_response', $bank_success_response);
  }
}

public function bankDetails(Request $request) {
  $user = Auth::user()->id;
  $get_id = Crypt::decrypt($request->id);
  $is_user_bank = Bankuser::where([['uid' , '=' , $user], ['id', '=', $get_id]])->first();
  return view('userpanel.bankDetails.update_bank_details', ['bank' => $is_user_bank]);
}

}