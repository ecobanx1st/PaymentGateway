<?php
namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Kyc;
use App\User;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class SumsubKycController extends Controller
{
    //
    public function __construct()
    {
        $this->middleware(['auth', 'twofa']);
    }

    public function index()
    {
        $userId    = Auth::user()->id;
        $userEmail = Auth::user()->email;
        $userId    = 'WallexPay' . $userId;

        //$userId = rand(1000000000,9999999999);
        //$userEmail = 'gk'.$userId.'@dummy.com';

        // $kycdata = SumsubKyc::where('email',$userEmail)->first();
        // if(is_null($kycdata)){
        // $applicantRequests = $this->createApplicant($userId,$userEmail);
        //dd($applicantRequests);
        // if(!empty($applicantRequests) && $applicantRequests['id']){
        //     $kyc = new SumsubKyc;
        //     $kyc->kyc_id = $applicantRequests['id'];
        //     $kyc->kycrequest_id = $applicantRequests['id'];
        //     $kyc->key = $applicantRequests['key'];
        //     $kyc->clientId = $applicantRequests['clientId'];
        //     $kyc->inspectionId = $applicantRequests['inspectionId'];
        //     $kyc->externalUserId = $applicantRequests['externalUserId'];
        //     $kyc->uid = Auth::user()->id;
        //     $kyc->refuid = $userId;
        //     $kyc->email = $userEmail;
        //     $kyc->save();
        // $accessTokens = $this->accessTokens($userId);
        return view('kycverify', ['token' => ["token" => "dafhafd", "userId" => "userId"]]);
        // }else{
        //     \Session::flash('error', 'Token not Generated');
        //     return redirect()->back();
        // }
        // }else{
        //     $accessTokens = $this->accessTokens($userId);
        //     if(isset($accessTokens['token'])){
        //         return view('kycverify',['token' => $accessTokens]);
        //     }else{
        //         dd($accessTokens);
        //         return view('kycverify',['token' => $accessTokens]);
        //     }

        // }
    }

    public function kycForm()
    {
        $country = Country::get();
        return view('kycpage', ['country' => $country]);
    }

    public function kycsubmits(Request $request)
    {

        $request->validate([
            "uid"            => "required",
            "fname"          => "required",
            "lname"          => "required",
            "phone_no"       => "required|numeric",
            "gender_type"    => "required",
            "dob"            => "required",
            "country"        => "required",
            "state"          => "required",
            "city"           => "required",
            "zip_code"       => "required",
            "address_line1"  => "required",
            "id_type"        => "required",
            "id_number"      => "required",
            "id_exp"         => "required",
            "front_img"      => "required|mimes:jpeg,jpg,png|max:2048",
            "back_img"       => "required|mimes:jpeg,jpg,png|max:2048",
            "selfie_img"     => "required|mimes:jpeg,jpg,png|max:2048",
            "proofpaper"     => "required",
            "proofpaper_img" => "required|mimes:jpeg,jpg,png|max:2048",
            "agreement"      => "required|array|size:3",
        ], [
            "uid.required"            => "User Id is required",
            "fname.required"          => "Firstname is required",
            "lname.required"          => "Lastname is required",
            "phone_no.required"       => "Phonenumber is required",
            "gender_type.required"    => "Gender is required",
            "dob.required"            => "DOB is required",
            "country.required"        => "Country is required",
            "state.required"          => "State is required",
            "city.required"           => "City is required",
            "zip_code.required"       => "Zip is required",
            "address_line1.required"  => "Address one is required",
            "id_type.required"        => "Document type is required",
            "id_number.required"      => "Document number is required",
            "id_exp.required"         => "Document expiring date is required",
            "front_img.required"      => "Document front side image is required",
            "front_img.mimes"         => "Only file type jpg, jpeg, png is allowed",

            "front_img.max"           => "Upload file size must be less than 2048 kb",
            "back_img.required"       => "Document back side image is required",
            "back_img.mimes"          => "Only file type jpg, jpeg, png is allowed",

            "back_img.max"            => "Upload file size must be less than 2048 kb",
            "selfie_img.required"     => "Document selfie is required",
            "selfie_img.mimes"        => "Only file type jpg, jpeg, png is allowed",

            "selfie_img.max"          => "Upload file size must be less than 2048 kb",
            "proofpaper.required"     => "Address proof type is required",
            "proofpaper_img.required" => "Address proof image is required",
            "proofpaper_img.mimes"    => "Only file type jpg, jpeg, png is allowed",

            "proofpaper_img.max"      => "Upload file size must be less than 2048 kb",
            "agreement.required"      => "Kindly accept the consent",
            "agreement.size"          => "Kindly accept all consent",
        ]);

        $fullFname          = "";
        $fullback_img       = "";
        $fullselfie_img     = "";
        $fullproofpaper_img = "";
        $milliseconds       = "";

        if ($request->hasFile('front_img')) {

            $milliseconds = round(microtime(true) * 1000);
            $ext          = $request->file('front_img')->extension();
            $filename     = $milliseconds . '.' . $ext;
            $file         = $request->file('front_img');
            $file->move(public_path('uploads/kyc'), $filename);
            $fullFname = 'uploads/kyc/' . $filename;
        }
        if ($request->hasFile('back_img')) {
            $milliseconds = round(microtime(true) * 1000);
            $extTwo       = $request->file('back_img')->extension();
            $filenameTwo  = $milliseconds . '.' . $extTwo;
            $fileTwo      = $request->file('back_img');
            $fileTwo->move(public_path('uploads/kyc'), $filenameTwo);
            $fullback_img = 'uploads/kyc/' . $filenameTwo;

        }
        if ($request->hasFile('selfie_img')) {
            $milliseconds  = round(microtime(true) * 1000);
            $extThree      = $request->file('selfie_img')->extension();
            $filenameThree = $milliseconds . '.' . $extThree;
            $fileThree     = $request->file('selfie_img');
            $fileThree->move(public_path('uploads/kyc'), $filenameThree);
            $fullselfie_img = 'uploads/kyc/' . $filenameThree;

        }
        if ($request->hasFile('proofpaper_img')) {
            $milliseconds = round(microtime(true) * 1000);
            $extFour      = $request->file('proofpaper_img')->extension();
            $filenameFour = $milliseconds . '.' . $extFour;
            $fileFour     = $request->file('proofpaper_img');
            $fileFour->move(public_path('uploads/kyc'), $filenameFour);
            $fullproofpaper_img = 'uploads/kyc/' . $filenameFour;

        }

        try {

            $save = DB::transaction(function () use ($request, $fullFname, $fullback_img, $fullselfie_img, $fullproofpaper_img) {

                $payload = [
                    'uid'            => $request->uid ?? "",
                    'fname'          => $request->fname ?? "",
                    'lname'          => $request->lname ?? "",
                    'dob'            => $request->dob ?? "",
                    'city'           => $request->city ?? "",
                    'state'          => $request->state ?? "",
                    'country'        => $request->country ?? "",
                    'phone_no'       => $request->phone_no ?? "",
                    'zip_code'       => $request->zip_code ?? "",
                    'gender_type'    => $request->gender_type ?? "",
                    'address_line1'  => $request->address_line1 ?? "",
                    'address_line2'  => $request->address_line2 ?? "",
                    'telegram_name'  => $request->telegram_name ?? "",
                    'id_type'        => $request->id_type ?? "",
                    'id_number'      => $request->id_number ?? "",
                    'id_exp'         => $request->id_exp ?? "",
                    'front_img'      => $fullFname ?? "",
                    'back_img'       => $fullback_img ?? "",
                    'selfie_img'     => $fullselfie_img ?? "",
                    'proofpaper'     => $request->proofpaper ?? "",
                    'proofpaper_img' => $fullproofpaper_img ?? "",
                    'is_agreed'      => count($request->agreement) > 1 ? 1 : 0,
                    'status'         => 3,
                    'created_at'     => date('Y-m-d H:i:s'),
                    'updated_at'     => date('Y-m-d H:i:s'),
                ];

                return Kyc::insert($payload);

            });

            if ($save) {

                return redirect('security')->with('success', 'KYC submitted successfully');
            }

            return redirect('kycform')->with('error', 'Unable to submit kyc!');

        } catch (\Exception $err) {

            return redirect('kycform')->with('error', 'something went wrong');
        }

    }

    public function createApplicant($UserId, $email)
    {
        $role = Auth::user()->role;
        if ($role == 'Personal') {
            $level = "wallex_pay_freelance";
        } else {
            $level = "crypto_processor_kyb_2023";
        }

        $method  = 'POST';
        $url     = "/resources/applicants?levelName=$level";
        $payload = json_encode(["externalUserId" => $UserId, "email" => $email]);
        $headers = $this->signature($url, $method, $payload);
        $curl    = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL            => 'https://api.sumsub.com' . $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING       => '',
            CURLOPT_MAXREDIRS      => 10,
            CURLOPT_TIMEOUT        => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST  => 'POST',
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => $headers,
        ]);

        $response = curl_exec($curl);

        curl_close($curl);
        return json_decode($response, true);
    }

    public function applicantRequests($userId, $userEmail)
    {
        $role = Auth::user()->role;
        if ($role == 'Personal') {
            $level = "wallex_pay_freelance";
        } else {
            $level = "crypto_processor_kyb_2023";
        }
        $method  = 'POST';
        $url     = "/resources/accessTokens?userId=$userId&levelName=$level";
        $payload = '';
        $headers = $this->signature($url, $method, $payload);
        if ($headers) {
            $token = $this->generateToken($headers, $url, $payload);
            if ($token) {
                return $token;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public function accessTokens($userId)
    {
        $method  = 'POST';
        $payload = '';
        $role    = Auth::user()->role;
        if ($role == 'Personal') {
            $level = "wallex_pay_freelance";
        } else {
            $level = "crypto_processor_kyb_2023";
        }
        $url     = "/resources/accessTokens?userId=$userId&levelName=$level";
        $headers = $this->signature($url, $method, $payload = null);
        if ($headers) {
            $token = $this->generateAuthToken($url, $headers);
            if ($token) {
                return $token;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public function ajaxkyc(Request $request)
    {
        $userEmail = Auth::user()->email;
        $kycdata   = SumsubKyc::where('email', $userEmail)->first();
        if ($kycdata) {
            $kycdata->kyc_id = $request->data;
            $kycdata->status = 3;
            $kycdata->save();
        }
        $data['sucess'] = 'success';
        return $data;
    }

    public function kycstatus()
    {

        //$userId = Auth::user()->id;
        //$userEmail = Auth::user()->email;
        $kycdatas = SumsubKyc::where('status', 3)->orWhere('status', 0)->get();

        if ($kycdatas) {

            foreach ($kycdatas as $key => $kycdata) {
                # code...

                $userId    = $kycdata->uid;
                $userEmail = $kycdata->email;

                $kyc_id  = $kycdata->kyc_id;
                $method  = 'GET';
                $payload = '';
                $url     = '/resources/applicants/' . $kyc_id . '/status'; //for get status
                                                                           //$url='/resources/applicants/'.$kyc_id; //for get full data

                $headers = $this->signature($url, $method, $payload);

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, 'https://api.sumsub.com' . $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                $result = curl_exec($ch);
                if (curl_errno($ch)) {
                    //echo 'Error:' . curl_error($ch);
                    return redirect('/profile')->with('error', 'Bad request!');
                }
                curl_close($ch);
                $array = json_decode($result, true);

                $status = 0;
                if (! empty($array['reviewStatus'])) {
                    $remark = $array['reviewStatus'];
                    if (($array['reviewStatus'] == 'pending') || ($array['reviewStatus'] == 'queued')) {
                        $status     = 3;
                        $userStatus = 2;
                    }
                    if ($array['reviewStatus'] == 'init') {$status = 0;}
                    if ($array['reviewStatus'] == 'completed') {
                        if ($array['reviewResult']['reviewAnswer'] == 'RED') {
                            $status = 2;
                            if (! empty($array['reviewResult']['moderationComment'])) {
                                $remark = $array['reviewResult']['moderationComment'];
                            }
                            $userStatus = 3;
                        }
                        if ($array['reviewResult']['reviewAnswer'] == 'GREEN') {
                            $status     = 1;
                            $userStatus = 1;
                        }
                    }

                    $kycdata->remark = $remark;
                    $kycdata->status = $status;
                    $kycdata->save();

                    $userdata = User::where('email', $userEmail)->first();
                    if ($userdata) {
                        $userdata->kyc_verify = $userStatus;
                        $userdata->save();
                    }
                }
            }
            return redirect('/profile');
        } else {
            return redirect('/profile')->with('error', 'Bad request!');
        }
    }

    public function signature($endpoint, $method, $payload)
    {
        //$appToken = 'sbx:PtdKZPVLv2yJGrQEyuvtqpr2.Rjw02Zeb0hrAHZ13tyeiCAF7tkO9FTag';
        //$secretKey = 'poms7ENmfQjqUe94R5PAkL8ea8jakHjP';

        $appToken  = 'prd:GClm3b278nnJTZ3wtyFPkt2r.JNAUMniVPSjXvYNqCVC1nezafMS7iFBw';
        $secretKey = 'YXTROddK4Zvu5plHc4IjjaadgrlRvMcH';
        $ts        = round(time());
        //$ts = (string)$ts;
        if (is_null($payload)) {
            $signature = hash_hmac('sha256', $ts . $method . $endpoint, $secretKey);
        } else {
            $signature = hash_hmac('sha256', $ts . $method . $endpoint . $payload, $secretKey);
        }
        $headers = [
            'Accept: application/json',
            'X-App-Token:' . $appToken,
            'X-App-Access-Sig:' . $signature,
            'X-App-Access-Ts:' . $ts,
            'Content-Type: application/json',
        ];
        return $headers;
    }

    public function generateToken($headers, $url, $payload)
    {
        // Generated by curl-to-PHP: http://incarnate.github.io/curl-to-php/
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);
        return json_decode($result, true);
    }

    public function generateAuthToken($url, $headers)
    {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL            => "https://api.sumsub.com$url",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING       => "",
            CURLOPT_MAXREDIRS      => 10,
            CURLOPT_TIMEOUT        => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST  => "POST",
            CURLOPT_HTTPHEADER     => $headers,
        ]);

        $result = curl_exec($curl);

        curl_close($curl);
        return json_decode($result, true);
    }
}
