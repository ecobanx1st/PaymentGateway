<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\User;
use App\Models\SumsubKyc;

class Sumsubkycupdate extends Command
{
/**
* The name and signature of the console command.
*
* @var string
*/
protected $signature = 'update:sumsubkyc';

/**
* The console command description.
*
* @var string
*/
protected $description = 'Update Sumsub Kyc status';

/**
* Create a new command instance.
*
* @return void
*/
public function __construct()
{
    parent::__construct();
}

/**
* Execute the console command.
*
* @return mixed
*/
public function handle() {
    //$kycdatas = SumsubKyc::where('status',3)->get();
    $kycdatas = SumsubKyc::where('status',3)->orWhere('status',0)->get();
    if($kycdatas){
        foreach ($kycdatas as $key => $kycdata) {
            $userId = $kycdata->uid;
            $userEmail = $kycdata->email;
            $kyc_id = $kycdata->kyc_id;;
            $method='GET';
            $payload = '';
            $url='/resources/applicants/'.$kyc_id.'/status'; 
            $headers = $this->signature($url,$method,$payload);
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://api.sumsub.com'.$url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            $result = curl_exec($ch);
            if (curl_errno($ch)) {
                return redirect('/profile')->with('error', 'Bad request!');
            }
            curl_close($ch);
            $array = json_decode($result , true);
            $status = 0; 
            $userStatus = 0;
            //dd($array);
        if(!empty($array['reviewStatus'])){
            $remark = $array['reviewStatus'];
            if(($array['reviewStatus'] == 'pending') || ($array['reviewStatus'] == 'queued')) { 
                $status = 3; 
                $userStatus = 2; 
            }
            echo "ID:$userId RE: $remark - ";
            if($array['reviewStatus'] == 'init'){ $status = 0; $userStatus = 0;}
            if($array['reviewStatus'] == 'completed'){ 
                if($array['reviewResult']['reviewAnswer'] == 'RED') {                
                    $userStatus = 3; 
                    $status = 2;
                    if(!empty($array['reviewResult']['moderationComment'])) {
                        $remark = $array['reviewResult']['moderationComment'];  
                    }          
                }
                if($array['reviewResult']['reviewAnswer'] == 'GREEN') {                
                    $status = 1;            
                    $userStatus = 1; 
                }
            }
            $kycdata->remark = $remark;
            $kycdata->status = $status;
            $kycdata->save();
            $userdata = User::where('email',$userEmail)->first();
            if($userdata) {
                $userdata->kyc_verify = $userStatus;
                $userdata->save();            
            }
        } 
      }
    }
    $this->info('Sumsub KYC updated successfully');

}

function signature($endpoint, $method, $payload) {    
    $appToken = 'prd:GClm3b278nnJTZ3wtyFPkt2r.JNAUMniVPSjXvYNqCVC1nezafMS7iFBw';
    $secretKey = 'YXTROddK4Zvu5plHc4IjjaadgrlRvMcH';
    /*$appToken = 'sbx:PtdKZPVLv2yJGrQEyuvtqpr2.Rjw02Zeb0hrAHZ13tyeiCAF7tkO9FTag';
    $secretKey = 'poms7ENmfQjqUe94R5PAkL8ea8jakHjP';*/
    $ts = round(strtotime("now"));
    if(is_null($payload)){
        $signature = hash_hmac('sha256', $ts . $method . $endpoint, $secretKey);
    }else{
        $signature = hash_hmac('sha256', $ts . $method . $endpoint . $payload, $secretKey);
    }
    $headers = [
        'Accept: application/json',
        'X-App-Token:' . $appToken,
        'X-App-Access-Sig:' . $signature,
        'X-App-Access-Ts:' . $ts,
        'Content-Type: application/json'
    ];
    return $headers;
}

}