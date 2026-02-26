<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Validator;
use Auth;
use App\Models\UserMerchant;
use App\Models\Apicategory;
use App\Models\Subapicategory;
use App\Models\InvoiceDetails;
use App\Models\ItemDetails;
use App\Models\LivePrice;
use App\Models\Commission;

class MerchantController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth','twofa','kyc']);
       //$this->middleware(['auth','twofa']);
    }
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('merchantttools.merchant-tools');
    }

    public function ButtonMaker(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.button-maker',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function AdvanceButtonMaker(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.advance-button-maker',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function advanceButtonMakerSubmit(Request $request){

        $this->validate($request, [
        'merchant' => 'required',
        'item_name' => 'required',
        'item_amount' => 'required',
        'success_url' => 'required',
        'cancel_url' => 'required',
        'radio' => 'required|url',
        ]);
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.advance-button-maker',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>$request]);
    }

    public function AdvanceMerchantToolsSimple(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.advance-merchant-tools-simple',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function AdvanceExampleButtons(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.advance-example-buttons',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function ShopCardField(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.shop-card-field',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function shopButtonExamples(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.shop-button-examples',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function donationButton(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.donation-button',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function donationButtonMake(Request $request){
        $this->validate($request, [
            'merchant' => 'required',
            'donation_name' => 'required',
            'invoice' => 'required',
            'donation_amount' => 'required|numeric',
            'taxf' => 'numeric',
            'item_number' => 'numeric',
            'success_url' => 'required|url',
            'cancel_url' => 'required|url',
            'radio' => 'required',
        ]);
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.donation-button',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>$request]);
    }

    public function donationField(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.donation-field',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function donationbuttonExample(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.donation-button-example',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function shopbuttonImage(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.shop-button-image',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function APIDocumentation(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.APIDocumentation',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function posTutorial(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.posTutorial',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function posHtmlFields(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.posHtmlFields',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function posbutton(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.posbutton',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function posExample(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::get();
        }
        return view('merchantttools.posExample',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function posExample2(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::get();
        }
        return view('merchantttools.posExample2',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function posExample3(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::get();
        }
        return view('merchantttools.posExample3',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function PaymentCancelledError(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::get();
        }
        return view('merchantttools.PaymentCancelledError',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function PaymentSuccess(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::get();
        }
        return view('merchantttools.PaymentSuccess',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function invoicebuilder(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::where('status',1)->get();
        }
        return view('merchantttools.invoice-builder',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }

    public function livePriceCalculate(Request $request){
        $validator = Validator::make($request->all(), [
            'convert_currency' => 'required',
            'paymentcurrency' => 'required',
            'currency_amount' => 'required|numeric'
        ]);
        if ($validator->fails()) {
            return response()->json(['status'=> false,'result' => '','msg' => $validator->errors()->first()], 200);
        }
        $tcoin = $request->convert_currency;
        $fcoin = $request->paymentcurrency;
        $amount = $request->currency_amount;
        $price = LivePrice::GetLivePrice($fcoin,$tcoin);

        $data['price'] = $price;
        $data['amount'] = ncDiv($amount,$price,8);
        return response()->json(['status'=> true,'result' => $data,'msg' => null], 200);
    }
     public function createinvoicebuilder(Request $request){
         $validator = Validator::make($request->all(), [
            'merchant' => 'required',
            'item_amount' => 'required',
            'paymentcurrency' => 'required',
            'item_description' => 'required',
            'invoice' => 'required|numeric',
            'tax_amount' => 'nullable|numeric',
            'shipping_address' => 'nullable',
            'shipping_cost' => 'nullable|numeric'
        ]);
         if ($validator->fails()) {
            return response()->json(['status'=> false,'result' => '','msg' => $validator->errors()->first()], 200);
        }
        $uid = Auth::user()->id;
        $backphoto = null;

            $tran = new InvoiceDetails();
            $tran->uid = $uid;
            $tran->invoice_id = $request->invoice;
            $tran->companydetails = $request->item_description;
            $tran->billaddress = '-';
            $tran->customername = '-';
            $tran->customeremail = '-';
            $tran->shippingaddress = $request->shipping_address;
            $tran->subtotal = 0;
            $tran->tax = 0;
            $tran->taxamt = $request->tax_amount;
            $tran->coin = $request->paymentcurrency;
            $tran->cointwo = $request->paymentcurrency;
            $tran->total = $request->item_amount;
            $tran->invoicetype = 'request';
            $tran->checkamount = $request->item_amount;
            $tran->payment_checkamt = $request->item_amount;
            $tran->logo = $backphoto;
            $tran->created_at = date('Y-m-d H:i:s',time());
            $tran->updated_at = date('Y-m-d H:i:s',time());

            if($tran->save()){
                $trans_id = $tran->id;
                $trans = new ItemDetails();
                $trans->invoice_id = $trans_id;
                $trans->itemno = '-';
                $trans->itemname = $request->item_description;
                $trans->quantity = 1;
                $trans->priceperitem = $request->item_amount;
                $trans->shipping = $request->shipping_cost;
                $trans->created_at = date('Y-m-d H:i:s',time());
                $trans->updated_at = date('Y-m-d H:i:s',time());
                $trans->save();
                $url = url('/shareinvoice/'.\Hashids::encode($tran->id));
                return response()->json(["status" => 'success','result' => NULL,'msg'=> "<span id='coinaddress1'>$url</span>"], 200);
            }
        return response()->json(["status" => 'fail','result' => NULL,'msg'=> "Somethingwent wrong"], 200);
    }


    public function invoiceBuilder2(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::get();
        }
        return view('merchantttools.invoiceBuilder2',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>""]);
    }


    public function ButtonMakerSubmit(Request $request){

        $this->validate($request, [
        'merchant' => 'required',
        'item_name' => 'required',
        'item_amount' => 'required',
        'success_url' => 'required',
        'cancel_url' => 'required',
        'radio'     => 'required',
        ]);
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::get();
        }
        return view('merchantttools.button-maker',['merchant' => $mid,'comDetails' => $comDetails,'requestparam' =>$request]);
    }

    public function MerchantToolSimple(){
        return view('merchantttools.merchant-tools-simple');
    }

    public function ExampleButtons(){
        return view('merchantttools.example-buttons');
    }

    public function MerchantToolIPN(){
        return view('merchantttools.merchant-tools-ipn');
    }

    public function NaijacryptoAPI(){

        $category =Apicategory::get();

        $Subapicategory =Subapicategory::where(['cat_id' =>1,'id' =>1])->first();
        return view('merchantttools.naijapayment-api',['category' => $category,'Subapicategory' => $Subapicategory]);
    }

    public function merchant_api($cid,$sid){

        $c =\Crypt::decrypt($cid);
        $s =\Crypt::decrypt($sid);

        $category =Apicategory::get();
        $Subapicategory =Subapicategory::where(['cat_id' =>$c,'id' =>$s])->first();

        return view('merchantttools.viewnaijapayment-api',['category' => $category,'Subapicategory' => $Subapicategory]);
    }

    public function viewinvoice(){
        $uid = Auth::user()->id;
        $category =InvoiceDetails::where(['uid'=>$uid,'invoicetype'=>'simple'])->orderBy('id', 'desc')->paginate(15);
        return view('merchantttools.viewinvoice',['category' => $category]);
    }

    public function editinvoice($id){
        $id = \Hashids::decode($id);
        $uid = Auth::user()->id;
        if($id){
        $category =InvoiceDetails::where(['uid'=>$uid,'id'=>$id])->first();
        $subcategory =ItemDetails::where('invoice_id',$id)->get();
        return view('merchantttools.editinvoice',['category' => $category,'subcategory' => $subcategory]);
        }else{
            return redirect('view-invoice')->with('error','Invoice not Found');
        }
    }

    public function shareinvoice($id){
        $id = \Hashids::decode($id);
        $uid = Auth::user()->id;
        if($id){
        $category =InvoiceDetails::where(['uid'=>$uid,'id'=>$id])->first();
        $subcategory =ItemDetails::where('invoice_id',$id)->get();
        return view('merchantttools.shareinvoice',['category' => $category,'subcategory' => $subcategory]);
        }else{
            return redirect('view-invoice')->with('error','Invoice not Found');
        }
    }

    public function InvoiceMaker(){
        $mid ='';
        if (Auth::check()){
            $uid = Auth::user()->id;
            $mid = UserMerchant::getmerchant($uid);
            $comDetails = Commission::get();
        }
        return view('merchantttools.invoice.create-invoice',['merchant' => $mid,'comDetails' => $comDetails]);
    }

    public function InvoiceMakerSubmit(Request $request){

        $this->validate($request, [
        'invoiceId' => 'required',
        'companydetails' => 'required',
        'billaddress' => 'required',
        'shippingaddress' => 'required',
        'subtotal' => 'required',
        'tax' => 'required',
        'coin' => 'required',
        'cointwo' => 'required',
        'total' => 'required',
        'taxamt' => 'required',
        'itemno' => 'required',
        'customeremail' => 'required',
        'customername' => 'required',
        'checkamount' => 'required',
        'payment_checkamt' => 'required',
        ]);

        if(count($request->itemno)>0){
        if(count($request->itemname)>0){
        if(count($request->quantity)>0){
        if(count($request->priceperitem)>0){
        if(count($request->shipping)>0){
            $uid = Auth::user()->id;

        $backphoto = null;

        if(Input::hasFile('logo_upload'))
        {

        $this->validate($request, [
             'logo_upload' => 'dimensions:min_width=100,max_width=250'
        ]);
        if($this->imgvalidaion($_FILES['logo_upload']['tmp_name']) == 1)
        {
              $dir = 'invoice/';
              $path = 'storage' . DIRECTORY_SEPARATOR .'app'. DIRECTORY_SEPARATOR.'public'. DIRECTORY_SEPARATOR. $dir;
              $location = 'public' . DIRECTORY_SEPARATOR .'storage'. DIRECTORY_SEPARATOR. $dir;
              $back = Input::File('logo_upload');

              $filenamewithextension = $back->getClientOriginalName();
              $backname = str_replace('.','',microtime(true));
              $filename = pathinfo($backname, PATHINFO_FILENAME);
              $extension = $back->getClientOriginalExtension();
              $backphoto = $filename.'.'. $extension;
              $back->move($path, $backphoto);
              $back_img = $location.$backphoto;
        }  else {
            return back()->with('error','Invoice not Generated,Unwanted images can not be accepted');
        }
        }

            $tran = new InvoiceDetails();
            $tran->uid = $uid;
            $tran->invoice_id = $request->invoiceId;
            $tran->companydetails = $request->companydetails;
            $tran->billaddress = $request->billaddress;
            $tran->customername = $request->customername;
            $tran->customeremail = $request->customeremail;
            $tran->shippingaddress = $request->shippingaddress;
            $tran->subtotal = $request->subtotal;
            $tran->tax = $request->tax;
            $tran->taxamt = $request->taxamt;
            $tran->coin = $request->coin;
            $tran->cointwo = $request->cointwo;
            $tran->total = $request->total;
            $tran->invoicetype = 'simple';
            $tran->checkamount = $request->checkamount;
            $tran->payment_checkamt = $request->payment_checkamt;
            $tran->logo = $backphoto;
            $tran->created_at = date('Y-m-d H:i:s',time());
            $tran->updated_at = date('Y-m-d H:i:s',time());

            if($tran->save()){
                for ($i=0; $i < count($request->itemno); $i++) {
                    $trans_id = $tran->id;
                    $trans = new ItemDetails();
                    $trans->invoice_id = $trans_id;
                    $trans->itemno = $request->itemno[$i];
                    $trans->itemname = $request->itemname[$i];
                    $trans->quantity = $request->quantity[$i];
                    $trans->priceperitem = $request->priceperitem[$i];
                    $trans->shipping = $request->shipping[$i];
                    $trans->created_at = date('Y-m-d H:i:s',time());
                    $trans->updated_at = date('Y-m-d H:i:s',time());
                    $trans->save();
                }

            return redirect('/shareinvoice/'.\Hashids::encode($tran->id))->with('success','Invoice Generated Successfully');
            //return back()->with('success','Invoice Generated Successfully');
            }else{
            return back()->with('error','Invoice not Generated');
            }
        } else { return back()->with('error','Please enter the shipping value'); }
        } else { return back()->with('error','Please enter the Price per Item value'); }
        } else { return back()->with('error','Please enter the Quantity'); }
        } else { return back()->with('error','Please enter the Item Name'); }
        } else { return back()->with('error','Please enter the Item Number'); }

    }

    public function updateinvoice(Request $request){

        $this->validate($request, [
        'id' => 'required',
        'invoiceId' => 'required',
        'companydetails' => 'required',
        'billaddress' => 'required',
        'shippingaddress' => 'required',
        'subtotal' => 'required',
        'tax' => 'required',
        'coin' => 'required',
        'cointwo' => 'required',
        'total' => 'required',
        'taxamt' => 'required',
        'itemno' => 'required',
        'customeremail' => 'required',
        'customername' => 'required',
        'checkamount' => 'required',
        'payment_checkamt' => 'required',
        ]);

        if(count($request->itemno)>0){
        if(count($request->itemname)>0){
        if(count($request->quantity)>0){
        if(count($request->priceperitem)>0){
        if(count($request->shipping)>0){
            $uid = Auth::user()->id;
            $tran =InvoiceDetails::where(['uid'=>$uid,'id'=>$request->id])->first();
            if($tran){


        if(Input::hasFile('logo_upload')){

        $this->validate($request, [
             'logo_upload' => 'dimensions:min_width=100,max_width=250'
        ]);
        if($this->imgvalidaion($_FILES['logo_upload']['tmp_name']) == 1)
        {
              $dir = 'invoice/';
              $path = 'storage' . DIRECTORY_SEPARATOR .'app'. DIRECTORY_SEPARATOR.'public'. DIRECTORY_SEPARATOR. $dir;
              $location = 'public' . DIRECTORY_SEPARATOR .'storage'. DIRECTORY_SEPARATOR. $dir;
              $back = Input::File('logo_upload');

              $filenamewithextension = $back->getClientOriginalName();
              $backname = str_replace('.','',microtime(true));
              $filename = pathinfo($backname, PATHINFO_FILENAME);
              $extension = $back->getClientOriginalExtension();
              $backphoto = $filename.'.'. $extension;
              $back->move($path, $backphoto);
              $back_img = $location.$backphoto;
              $tran->logo = $backphoto;
        }  else {
            return back()->with('error','Invoice not Generated,Unwanted images can not be accepted');
        }
        }

            $tran->uid = $uid;
            $tran->invoice_id = $request->invoiceId;
            $tran->companydetails = $request->companydetails;
            $tran->billaddress = $request->billaddress;
            $tran->shippingaddress = $request->shippingaddress;
            $tran->subtotal = $request->subtotal;
            $tran->customername = $request->customername;
            $tran->customeremail = $request->customeremail;
            $tran->tax = $request->tax;
            $tran->taxamt = $request->taxamt;
            $tran->coin = $request->coin;
            $tran->cointwo = $request->cointwo;
            $tran->total = $request->total;
            $tran->checkamount = $request->checkamount;
            $tran->payment_checkamt = $request->payment_checkamt;
            $tran->created_at = date('Y-m-d H:i:s',time());
            $tran->updated_at = date('Y-m-d H:i:s',time());

            if($tran->save()){
                $trans_id = $tran->id;
                //ItemDetails::where('invoice_id', '=', $trans_id)->delete();
                for ($i=0; $i < count($request->itemno); $i++) {

                  if((!empty($request->itemid[$i]))){
                    $trans =ItemDetails::where('id',$request->itemid[$i])->first();
                    if($trans){
                    $trans->itemno = $request->itemno[$i];
                    $trans->itemname = $request->itemname[$i];
                    $trans->quantity = $request->quantity[$i];
                    $trans->priceperitem = $request->priceperitem[$i];
                    $trans->shipping = $request->shipping[$i];
                    $trans->updated_at = date('Y-m-d H:i:s',time());
                    $trans->save();
                    }
                  }else{
                    if((!empty($request->itemno[$i]))&&(!empty($request->itemname[$i]))&&(!empty($request->quantity[$i]))&&(!empty($request->priceperitem[$i]))){
                    $trans = new ItemDetails();
                    $trans->invoice_id = $trans_id;
                    $trans->itemno = $request->itemno[$i];
                    $trans->itemname = $request->itemname[$i];
                    $trans->quantity = $request->quantity[$i];
                    $trans->priceperitem = $request->priceperitem[$i];
                    $trans->shipping = $request->shipping[$i];
                    $trans->created_at = date('Y-m-d H:i:s',time());
                    $trans->updated_at = date('Y-m-d H:i:s',time());
                    $trans->save();
                    }
                }

                }

            return redirect('/shareinvoice/'.\Hashids::encode($tran->id))->with('success','Invoice update Successfully');
            //return back()->with('success','Invoice update Successfully');
            }else{
            return back()->with('error','Invoice not Generated');
            }
            }else{
            return back()->with('error','Invoice not Found');
            }
        } else { return back()->with('error','Please enter the shipping value'); }
        } else { return back()->with('error','Please enter the Price per Item value'); }
        } else { return back()->with('error','Please enter the Quantity'); }
        } else { return back()->with('error','Please enter the Item Name'); }
        } else { return back()->with('error','Please enter the Item Number'); }

    }

    public function deleteitem($id){
        $id = \Hashids::decode($id);
        if($id){
        $subcategory =ItemDetails::where('id',$id)->delete();
        return back()->with('success','Invoice item Deleted');
        }else{
            return redirect('view-invoice')->with('error','Invoice not Found');
        }
    }

    public function generateLink(Request $request){
        $transtr = TransactionString(8);
        $uid = Auth::user()->id;
        $subcategory =InvoiceDetails::where(['uid'=>$uid,'id'=>$request->id,'status'=>0])->first();
        if($subcategory){
            $subcategory->referralid = $transtr;
            $subcategory->status = 1;
            $subcategory->updated_at = date('Y-m-d H:i:s',time());
            $subcategory->save();
        }
        $data['msg'] = 'success';
        $data['status'] = $request;

        return $data;
    }

    public function deleteinvoice($id){
        $id = \Hashids::decode($id);
        if($id){
            //dd();
            $subcategory =InvoiceDetails::where(['id'=>$id[0],'status'=> 0])->delete();
            $subcategorys =ItemDetails::where('invoice_id',$id[0])->delete();
            return back()->with('success','Invoice item Deleted');
        }else{
            return redirect('view-invoice')->with('error','Invoice not Found');
        }
    }

    public function checkamount(Request $request){

        $currency1 = $request->coin;
        $currency2 = $request->cointwo;
        $total = $request->total;
        if($currency1 == 'USD' || $currency1 == 'NGN' ){
            $lprice = LivePrice::GetLivePrice($currency2,$currency1);
            $amount    = ncDiv($total,$lprice);
        }else{
            $amount    = $total;
        }

        $data['msg'] = 'success';
        $data['currency'] = $currency2;
        $data['amount'] = $amount;
        return $data;
   }

    public function imgvalidaion($img)
    {
      $myfile = fopen($img, "r") or die("Unable to open file!");
      $value = fread($myfile,filesize($img));

      if (strpos($value, "<?php") !== false) {
        $img = 0;
      }
      elseif (strpos($value, "<?=") !== false){
        $img = 0;
      }
      elseif (strpos($value, "eval") !== false) {
        $img = 0;
      }
      elseif (strpos($value,"<script") !== false) {
        $img = 0;
      }else{
        $img=1;
      }
      fclose($myfile);
      return $img;
    }

    public function viewrequestinvoice(){
        $uid = Auth::user()->id;
        $category =InvoiceDetails::where(['uid'=>$uid,'invoicetype'=>'request'])->orderBy('id', 'desc')->paginate(15);
        return view('merchantttools.viewrequestinvoice',['category' => $category]);
    }

    public function InvoiceRequestMaker(){
        return view('merchantttools.request-invoice-maker');
    }

    public function InvoiceRequestMakerSubmit(Request $request) {

        $this->validate($request, [
        'customername' => 'required',
        'companydetails' => 'required',
        'cointwo' => 'required',
        'itemname' => 'required',
        'payment_checkamt' => 'required',
        ]);

        $uid = Auth::user()->id;
        $backphoto = null;

            $tran = new InvoiceDetails();
            $tran->uid = $uid;
            $tran->invoice_id = '-';
            $tran->companydetails = $request->companydetails;
            $tran->billaddress = '-';
            $tran->customername = $request->customername;
            $tran->customeremail = '-';
            $tran->shippingaddress = '-';
            $tran->subtotal = 0;
            $tran->tax = 0;
            $tran->taxamt = 0;
            $tran->coin = $request->cointwo;
            $tran->cointwo = $request->cointwo;
            $tran->total = $request->payment_checkamt;
            $tran->invoicetype = 'request';
            $tran->checkamount = $request->payment_checkamt;
            $tran->payment_checkamt = $request->payment_checkamt;
            $tran->logo = $backphoto;
            $tran->created_at = date('Y-m-d H:i:s',time());
            $tran->updated_at = date('Y-m-d H:i:s',time());

            if($tran->save()){
                    $trans_id = $tran->id;
                    $trans = new ItemDetails();
                    $trans->invoice_id = $trans_id;
                    $trans->itemno = '-';
                    $trans->itemname = $request->itemname;
                    $trans->quantity = 1;
                    $trans->priceperitem = $request->payment_checkamt;
                    $trans->shipping = 0;
                    $trans->created_at = date('Y-m-d H:i:s',time());
                    $trans->updated_at = date('Y-m-d H:i:s',time());
                    $trans->save();

            return redirect('/shareinvoice/'.\Hashids::encode($tran->id))->with('success','Invoice Generated Successfully');
            //return back()->with('success','Invoice Generated Successfully');
            }else{
            return back()->with('error','Invoice not Generated');
            }
        return view('merchantttools.request-invoice-maker');
    }


    public function editrequestinvoice($id){
        $id = \Hashids::decode($id);
        $uid = Auth::user()->id;
        if($id){
        $category =InvoiceDetails::where(['uid'=>$uid,'id'=>$id])->first();
        $subcategory =ItemDetails::where('invoice_id',$id)->first();
        return view('merchantttools.editrequestinvoice',['category' => $category,'subcategory' => $subcategory]);
        }else{
            return redirect('view-request-invoice')->with('error','Invoice not Found');
        }
    }

    public function sharerequestinvoice($id){
        $id = \Hashids::decode($id);
        $uid = Auth::user()->id;
        if($id){
        $category =InvoiceDetails::where(['uid'=>$uid,'id'=>$id])->first();
        $subcategory =ItemDetails::where('invoice_id',$id)->first();
        return view('merchantttools.sharerequestinvoice',['category' => $category,'subcategory' => $subcategory]);
        }else{
            return redirect('view-request-invoice')->with('error','Invoice not Found');
        }
    }

    public function updaterequestinvoice(Request $request){

        $this->validate($request, [
        'id' => 'required',
        'itemid' => 'required',
        'customername' => 'required',
        'companydetails' => 'required',
        'cointwo' => 'required',
        'itemname' => 'required',
        'payment_checkamt' => 'required',
        ]);

            $uid = Auth::user()->id;
            $tran =InvoiceDetails::where(['uid'=>$uid,'id'=>$request->id])->first();
            if($tran){
            $tran->invoice_id = '-';
            $tran->companydetails = $request->companydetails;
            $tran->billaddress = '-';
            $tran->customername = $request->customername;
            $tran->customeremail = '-';
            $tran->shippingaddress = '-';
            $tran->subtotal = 0;
            $tran->tax = 0;
            $tran->taxamt = 0;
            $tran->coin = $request->cointwo;
            $tran->cointwo = $request->cointwo;
            $tran->total = $request->payment_checkamt;
            $tran->invoicetype = 'request';
            $tran->checkamount = $request->payment_checkamt;
            $tran->payment_checkamt = $request->payment_checkamt;
            $tran->updated_at = date('Y-m-d H:i:s',time());
            if($tran->save()){
                $trans_id = $tran->id;

                    $trans =ItemDetails::where('id',$request->itemid)->first();
                    if($trans){
                    $trans->invoice_id = $trans_id;
                    $trans->itemno = '-';
                    $trans->itemname = $request->itemname;
                    $trans->quantity = 1;
                    $trans->priceperitem = $request->payment_checkamt;
                    $trans->shipping = 0;
                    $trans->updated_at = date('Y-m-d H:i:s',time());
                    $trans->save();
                    }

            return redirect('/shareinvoice/'.\Hashids::encode($tran->id))->with('success','Invoice update Successfully');
            //return back()->with('success','Invoice update Successfully');
            }else{
            return back()->with('error','Invoice not Generated');
            }
            }else{
            return back()->with('error','Invoice not Found');
            }
    }

}
