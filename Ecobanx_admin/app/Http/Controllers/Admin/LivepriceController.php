<?php
namespace App\Http\Controllers\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\LivePrice;
use Illuminate\Support\Facades\Crypt;
use App\Http\Requests\CommissionRequest;

class LivepriceController extends Controller {

    public function __construct() {
        $this->middleware('admin');
    }

    public function livepricelist() {
        $liveprice = array();
        $ngnliveprice = 0;
        $ngnliveprice = LivePrice::liveprice('NGN');
        return view('liveprice.liveprice',['ngnliveprice' => $ngnliveprice]);
    }

    public function updatengnval() {
         $ngnliveprice = LivePrice::liveprice('NGN');
        return view('liveprice.ngnliveprice',['ngnliveprice' => $ngnliveprice]);
    }


    public function ngnpriceupdate(Request $request) {
            $price = $request->price; 
            $Tradepair = LivePrice::on('mysql2')->where('tcoin','NGN')->first();;
            $Tradepair->price = $price;
            $Tradepair->save();
            return back()->with('status','Price Updated Successfully');
    }
}