<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Commission;
use Illuminate\Support\Facades\Crypt;
use App\Http\Requests\CommissionRequest;
use App\Http\Requests\CoincommissionRequest;
use App\Models\User;
use App\Models\Tradepair;
use App\Models\UserWallet;



class CommissionController extends Controller {

    public function __construct() {
        $this->middleware('admin');
    }

    public function index(Request $request,$search=null) {
        $commission = "";
        $searchphrase = $request->searchphrase ?? "";
        if(isset($search) && $request->searchphrase != ""){
            $commission = Commission::where('source', 'LIKE', "%{$request->searchphrase}%")->paginate(10)
            ->appends($request->all());
        }else{
            $commission = Commission::index();
        }

        return view('commission.commission',[
            'commissions' => $commission,
            'searchphrase' => $searchphrase
        ]);
    }

    public function edit($id) {
        $commission = Commission::edit(Crypt::decrypt($id));
        return view('commission.edit')->with('commission',$commission);
    }

    public function commissionUpdate(CommissionRequest $request) {
        $commission = Commission::commissionUpdate($request);
        return back()->with('status','Commission Updated Successfully');
    }


    public function leverage_commission() {
        $commission = Leverages::index();
        return view('le_commission.le_commission',[
            'commissions' => $commission
        ]);
    }


    public function tokenlist(Request $request,$search=null) {

        if(isset($search) && !isset($request->searchphrase)){
            return back()->with('error','Please enter search phrase');
        };
        $commission = Commission::where('type','!=','coin')
        ->when($search, function ($query) use ($request) {
            $query->where('source', 'LIKE', "%{$request->searchphrase}%");
        })
        ->paginate(10)
        ->appends($request->all());

        return view('token.tokenlist',['commissions' => $commission,"searchphrase" => $request->searchphrase]);
    }

    public function addcoin(Request $request)
    {

        return view('token.add');
    }


    public function addcoininsert(CoincommissionRequest $request)
    {
        // echo "<pre>";print_r($request->all());exit;
        try {
            if(isset($request->image)){
                $pho = $request->image;
                $filenamewithextension = $pho->getClientOriginalName();
                $photnam = strtolower($request->symbol);
                $filename = pathinfo($photnam, PATHINFO_FILENAME);
                $extension = $pho->getClientOriginalExtension();
                $photo = $filename . '.' . $extension;
                // Storage::disk('ftpcoin')->put($photo, fopen($request->file('image'), 'r+'));
                $path = 'images/color/';
                $pho->move(public_path($path), $photo);
            }else{
                $photo = 'eth.svg';
            }
        }catch (Exception $e) {
            $photo = strtolower($request->symbol).'.svg';
        }

        $type = $request->type;


        if($type == 'bsctoken'){
            $assertype = 'BEP20';
        }else if($type == 'trxtoken'){
            $assertype = 'TRC20';
        }else if($type == 'erctoken'){
            $assertype = 'ERC20';
        }else if($type == 'polytoken'){
            $assertype = 'POLY20';
        }else if($type == 'wfitoken'){
            $assertype = 'WFI20';
        }else{
            $assertype = 'token';
        }

        $commission = new Commission();
        $commission->source        = $request->symbol;
        $commission->withdraw  = $request->withdraw;
        $commission->assertype = $assertype;
        $commission->type = $request->type;
        $commission->coinname = $request->coinname;
        $commission->point_value = $request->digit;
        $commission->decimal_value = $request->decimal_value;
        $commission->netfee = $request->netfee;
        $commission->contractaddress = $request->contractaddress;
        $commission->abiarray = $request->abiarray;
        $commission->min_amount = $request->min_amount;
        $commission->max_amount = $request->max_amount;
        $commission->limit = $request->limit;
        $commission->autowithdraw = 0;


        // $commission->com_type = $request->com_type;
        // $commission->orderlist = $request->orderlist;
        $commission->status = $request->status;
        // $commission->is_swap =$request->is_swap;

        // $commission->is_deposit = $request->is_deposit;
        // $commission->is_withdraw = $request->is_withdraw;
        $commission->status = $request->status;

        $commission->image = $photo;
        $commission->save();

        User::where(['email_verify' => 1])->update(['is_address' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
        return back()->with('status','Coin Added Successfully');

    }

    public function tokenedit($id)
    {
        $id  = Crypt::decrypt($id);
        $commission = Commission::on('mysql2')->where('id', $id)->first();
        return view('token.edit')->with('commission',$commission);
    }


    public function TokenUpdate(CoincommissionRequest $request)

    {

        $commission = Commission::on('mysql2')->where('id', $request->id)->first();
        if($commission->source != $request->symbol){
            $cointwos = Tradepair::on('mysql2')->where([['cointwo' ,'=', $commission->source]])->update(['cointwo' => $request->symbol]);
            $coinones = Tradepair::on('mysql2')->where([['coinone' ,'=', $commission->source]])->update(['coinone' => $request->symbol]);
            UserWallet::on('mysql2')->where([['currency' ,'=', $commission->source]])->update(['currency' => $request->symbol]);

        }
        $commission->source        = $request->symbol;
        $commission->withdraw  = $request->withdraw;
        $commission->type = $request->type;
        $commission->coinname = $request->coinname;
        $commission->point_value = $request->digit;
        $commission->decimal_value = $request->decimal_value;
        $commission->netfee = $request->netfee;
        $commission->contractaddress = $request->contractaddress;
        $commission->abiarray = $request->abiarray;
        $commission->min_amount = $request->min_amount;
        $commission->max_amount = $request->max_amount;
        $commission->limit = $request->limit;
        $commission->status = $request->status;
        $commission->status = $request->status;
        $commission->autowithdraw = 0;


        try {
            if(isset($request->image)){
                $pho = $request->image;
                $filenamewithextension = $pho->getClientOriginalName();
                $photnam = strtolower($request->symbol). str_replace('.', '', microtime(true));
                $filename = pathinfo($photnam, PATHINFO_FILENAME);
                $extension = $pho->getClientOriginalExtension();
                $photo = $filename . '.' . $extension;
                if($commission->image != ""){
                    Storage::disk('ftpcoin')->delete($commission->image);
                }
                Storage::disk('ftpcoin')->put($photo, fopen($request->file('image'), 'r+'));
                $commission->image = $photo;

            }else{
                $commission->image = $commission->image;
            }
        }catch (Exception $e) {
            $commission->image = $commission->image;
        }

        $commission->save();

        return back()->with('status','Token Updated Successfully');
    }


    public function coinDelete($id){

        $id  = Crypt::decrypt($id);
        $commission = Commission::on('mysql2')->where('id', $id)->first();
        if($commission){
           $coin    = $commission->source;

           $coinones = Tradepair::on('mysql2')->where([['coinone' ,'=', $coin]])->get();
           if(count($coinones) > 0){
                foreach ($coinones as $coinone) {
                    BuyTrades::on('mysql2')->where([['pair', '=', $coinone->id]])->delete();
                    SellTrades::on('mysql2')->where([['pair', '=', $coinone->id]])->delete();
                }
                $coinones = Tradepair::on('mysql2')->where([['coinone' ,'=', $coin]])->delete();
           }
           $cointwos = Tradepair::on('mysql2')->where([['cointwo' ,'=', $coin]])->get();
           if(count($cointwos) > 0){
                foreach ($cointwos as $cointwo) {
                    BuyTrades::on('mysql2')->where([['pair', '=', $cointwo->id]])->delete();
                    SellTrades::on('mysql2')->where([['pair', '=', $cointwo->id]])->delete();
                }
                $cointwos = Tradepair::on('mysql2')->where([['cointwo' ,'=', $coin]])->delete();
           }
           Commission::on('mysql2')->where('id', $id)->delete();
           return back()->with('status','Token Delete Successfully');
        }
        return back()->with('error','Invalid Token ');

    }
}
