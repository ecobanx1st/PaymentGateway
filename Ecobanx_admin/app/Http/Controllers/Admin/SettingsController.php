<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\CMS;
use App\Models\Features;
use App\Models\Howitswork;
use App\Models\Faq;
use App\Models\SocialMedia;

class SettingsController extends Controller {

public function logo() {
$terms = CMS::index();
return view('settings.logo', ['logo' => $terms]);
}

public function tc() {
$terms = CMS::index();
return view('settings.tc', ['terms' => $terms]);
}

public function update_terms(Request $request) {
$update = CMS::updateTerms($request);
return back()->with('status',$update);
}

public function privacy() {
$terms = CMS::index();
return view('settings.privacy', ['privacy' => $terms]);
}

public function updatePrivacy(Request $request) {
$update = CMS::updatePrivacy($request);
return back()->with('status',$update);
}

public function aboutus() {
$aboutus = CMS::index();
return view('settings.aboutus', ['aboutus' => $aboutus]);
}

public function updateAbout(Request $request) {
$update = CMS::updateAbout($request);
return back()->with('status',$update);
}

public function accept_payment() {
$accept_payment = CMS::index();
return view('settings.accept_payment', ['accept_payment' => $accept_payment]);
}

public function update_accept_payment(Request $request) {
$update = CMS::update_accept_payment($request);
return back()->with('status',$update);
}

public function homedownbanner($id) {
$accept_payment = CMS::index();
return view('settings.homedownbanner', ['homebanner' => $accept_payment,'id'=>$id]);
}

public function update_homebanner(Request $request) {
$update = CMS::update_homebanner($request);
return back()->with('status',$update);
}

public function faq() { 
$faq = Faq::on('mysql2')->orderBy('id', 'asc')->paginate(20);
return view('settings.faq')->with('faq',$faq);
}

public function faq_add() {
return view('settings.faq_add');
}

public function faq_save(Request $request) { 
$heading        = $request->heading;
$description    = $request->description;
if($heading !="" && $description !="") {
$faq = Faq::saveFaq($request);
return redirect('admin/faq')->with('success','Added Successfully');
} else {
return redirect('admin/faq_add')->with('failed','Fields required!');
}
}

public function faq_edit($id) {
$faq = Faq::edit($id);
return view('settings.faq_edit')->with('faq',$faq);
}

public function faq_update(Request $request) { 
$faq = Faq::faqUpdate($request); 
return redirect('admin/faq')->with('success',$faq);
}

public function faq_destroy($id) {
$faq = Faq::destroy($id);
if($faq){
return redirect('admin/faq')->with('success',$faq);
}else{
return redirect('admin/faq')->with('error','Failed try again!');
}
}

public function socialMedia() {
$socialMedia = SocialMedia::index();
return view('settings.social_media')->with('link',$socialMedia);
}

public function saveSocialMedia(Request $request) {
$socialMedia = SocialMedia::saveSocialMedia($request); 
return back()->with('success', 'Social Media Setting Updated Successfully!');
}

//Home banner

public function bannerview() {
$terms = CMS::index();
return view('settings.banner', ['terms' => $terms]);
}

public function HomeBanner(Request $request) {
$update = CMS::updatebanner($request);
return back()->with('status',$update);
}

public function updatebanner(Request $request) {
$update = CMS::updatebanner($request);
return back()->with('status',$update);
}

//Features
public function features() {
$features = Features::on('mysql2')->get();
return view('settings.features')->with('features',$features);
}

public function features_settings(Request $request) { 
$features = Features::updateFeatures($request);
return back()->with('status',$features);
} 

//How its work
public function howwork() {
$features = Howitswork::on('mysql2')->get();
return view('settings.howworks')->with('features',$features);
}

public function work_update(Request $request) { 
$features = Howitswork::updatewrk($request);
return back()->with('status',$features);
} 

public function securityview() {
$terms = CMS::index();
return view('settings.kyc', ['terms' => $terms]);
}

public function update_kyc(Request $request) {
$update = CMS::updateKyc($request);
return back()->with('status',$update);
}

}