<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CMS extends Model {

    protected $table = 'cms';
    protected $connection = 'mysql2';

    public static function index() {
        $terms = CMS::on('mysql2')->where('id', 1)->first();
        return $terms;
    }

    public static function updateTerms($request) {
        $tc = str_replace("\r\n",'', $request->tc);
        if($tc !='') {
            $data = CMS::on('mysql2')->first();
            if($data) {
                $data = CMS::on('mysql2')->where('id', 1)->update(['tc' => $tc]);
            } else {
                $insert = new CMS();
                $insert->tc = $tc;
                $insert->save();
            }
            $message = "Updated Successfully!";
        } else {
            $message = "Fields Are Empty. Try Again!";
        }
        return $message;
    }

    public static function updatePrivacy($request) {
        $privacy_policy = str_replace("\r\n",'', $request->privacy);
        if($privacy_policy !='') {
            $data = CMS::on('mysql2')->first();
            if($data) {
                $data = CMS::on('mysql2')->where('id', 1)->update(['privacy_policy' => $privacy_policy]);
            } else {
                $insert = new CMS();
                $insert->privacy_policy = $privacy_policy;
                $insert->save();
            }
            $message = "Updated Successfully!"; 
        } else {
            $message = "Fields Are Empty. Try Again!";
        }
        return $message;
    }

    public static function updateAbout($request) {
        $aboutus = str_replace("\r\n",'', $request->aboutus);
        if($aboutus !='') {
            $data = CMS::on('mysql2')->first();
            if($data) {
                $update = CMS::on('mysql2')->where('id', 1)->update(['aboutus' => $aboutus]);
            } else {
                $insert = new CMS();
                $insert->aboutus = $aboutus;
                $insert->save();
            }
            $message = "Updated Successfully!";
        } else {
            $message = "Fields Are Empty. Try Again!";
        }
        return $message;
    }

    public static function update_accept_payment($request) {
        $bitcoin_payments = str_replace("\r\n",'', $request->accept_payment);
        if($bitcoin_payments !='') {
            $data = CMS::on('mysql2')->first();
            if($data) {
                $update = CMS::on('mysql2')->where('id', 1)->update(['bitcoin_payments' => $bitcoin_payments]);
            } else {
                $insert = new CMS();
                $insert->bitcoin_payments = $bitcoin_payments;
                $insert->save();
            }
            $message = "Updated Successfully!";
        } else {
            $message = "Fields Are Empty. Try Again!";
        }
        return $message;
    }

    public static function update_homebanner($request) {


            $data = CMS::on('mysql2')->first();
            if($request->id == 1) { $head ='bannerheadone';$headdesc ='bannerone'; } else{ $head ='bannerheadtwo';$headdesc ='bannertwo'; }

            if($data) {
                $update = CMS::on('mysql2')->where('id', 1)->update([$head => $request->$head,$headdesc => $request->$headdesc]);
            } 
            $message = "Updated Successfully!";
       
        return $message;
    }

    public static function updatebanner($request) {
        $home_banner = str_replace("\r\n",'', $request->banner);
        $banner_title = str_replace("\r\n",'', $request->banner_title);
        if($home_banner !='' && $banner_title !='') {
            $data = CMS::on('mysql2')->first();
            if($data) {
                $data = CMS::on('mysql2')->where('id', 1)->update(['home_banner_title' => $banner_title,'home_banner' => $home_banner]);
            } else {
                $insert = new CMS();
                $insert->home_banner = $home_banner;
                $insert->save();
            }
            $message = "Updated Successfully!"; 
        } else {
            $message = "Fields Are Empty. Try Again!";
        }
        return $message;
    }

    public static function updateKyc($request) {
        $kyc_content = str_replace("\r\n",'', $request->kyc_content);
        $kycaccess = $request->kycaccess;
        $twofawithdraw = $request->twofawithdraw;

        $update = CMS::on('mysql2')->where('id', 1)->update(['kyc_content' => $kyc_content,'kyc_enable' => $kycaccess,'twofa_withdraw_enable' => $twofawithdraw]);
        if($update) {
            $message = "Updated Successfully!";
        }
        return $message;
    }

}